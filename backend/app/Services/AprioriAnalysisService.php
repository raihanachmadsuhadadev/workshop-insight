<?php

namespace App\Services;

use App\Models\AprioriRun;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AprioriAnalysisService
{
    public function run(array $payload, int $userId): AprioriRun
    {
        $dataset = $this->buildDataset($payload);

        if (count($dataset) < 3) {
            throw ValidationException::withMessages([
                'transactions' => ['Minimal 3 transaksi selesai diperlukan untuk menjalankan analisis.'],
            ]);
        }

        $run = AprioriRun::create([
            'code' => $this->generateCode(),
            'name' => $payload['name'] ?? null,
            'start_date' => $payload['start_date'] ?? null,
            'end_date' => $payload['end_date'] ?? null,
            'item_scope' => $payload['item_scope'] ?? 'all',
            'minimum_support' => $payload['minimum_support'],
            'minimum_confidence' => $payload['minimum_confidence'],
            'total_transactions' => count($dataset),
            'status' => 'completed',
            'run_by' => $userId,
            'ran_at' => now(),
        ]);

        try {
            $response = Http::timeout(30)->post(config('services.apriori.url').'/analyze', [
                'transactions' => $dataset,
                'minimum_support' => (float) $payload['minimum_support'],
                'minimum_confidence' => (float) $payload['minimum_confidence'],
            ]);

            if (! $response->successful()) {
                $message = $response->json('message') ?? 'Apriori service belum aktif atau gagal memproses analisis.';
                $run->update(['status' => 'failed', 'message' => $message]);

                throw ValidationException::withMessages(['apriori_service' => [$message]]);
            }

            $this->persistResult($run, $response->json());

            return $run->fresh()->load(['runBy', 'frequentItemsets', 'rules']);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            $message = 'Apriori service belum aktif. Jalankan apriori-service di port 5002.';
            $run->update(['status' => 'failed', 'message' => $message.' '.$exception->getMessage()]);

            throw ValidationException::withMessages(['apriori_service' => [$message]]);
        }
    }

    private function buildDataset(array $payload): array
    {
        $scope = $payload['item_scope'] ?? 'all';

        return Transaction::query()
            ->with('items')
            ->where('status', 'completed')
            ->when($payload['start_date'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '>=', $date))
            ->when($payload['end_date'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '<=', $date))
            ->oldest('transaction_date')
            ->get()
            ->map(function (Transaction $transaction) use ($scope) {
                $items = $transaction->items
                    ->filter(fn ($item) => $scope === 'all' || $item->item_type === $scope)
                    ->pluck('item_name')
                    ->unique()
                    ->values()
                    ->all();

                return [
                    'transaction_code' => $transaction->code,
                    'items' => $items,
                ];
            })
            ->filter(fn (array $transaction) => count($transaction['items']) > 0)
            ->values()
            ->all();
    }

    private function persistResult(AprioriRun $run, array $result): void
    {
        DB::transaction(function () use ($run, $result) {
            $summary = $result['summary'] ?? [];

            $run->update([
                'total_transactions' => $summary['total_transactions'] ?? $run->total_transactions,
                'total_unique_items' => $summary['total_unique_items'] ?? 0,
                'total_frequent_itemsets' => $summary['total_frequent_itemsets'] ?? 0,
                'total_rules' => $summary['total_rules'] ?? 0,
                'status' => 'completed',
                'message' => $result['message'] ?? 'Apriori analysis completed',
            ]);

            foreach ($result['frequent_itemsets'] ?? [] as $itemset) {
                $items = $itemset['items'] ?? [];
                $run->frequentItemsets()->create([
                    'items' => $items,
                    'item_count' => count($items),
                    'support' => $itemset['support'] ?? 0,
                    'support_percentage' => $itemset['support_percentage'] ?? 0,
                ]);
            }

            $recommendations = collect($result['recommendations'] ?? []);

            foreach ($result['rules'] ?? [] as $rule) {
                $items = array_values(array_merge($rule['antecedents'] ?? [], $rule['consequents'] ?? []));
                $recommendation = $recommendations->first(fn ($item) => ($item['items'] ?? []) === $items);

                $run->rules()->create([
                    'antecedents' => $rule['antecedents'] ?? [],
                    'consequents' => $rule['consequents'] ?? [],
                    'support' => $rule['support'] ?? 0,
                    'confidence' => $rule['confidence'] ?? 0,
                    'lift' => $rule['lift'] ?? 0,
                    'support_percentage' => $rule['support_percentage'] ?? 0,
                    'confidence_percentage' => $rule['confidence_percentage'] ?? 0,
                    'interpretation' => $rule['interpretation'] ?? null,
                    'recommendation_title' => $recommendation['title'] ?? ('Paket '.implode(' + ', $items)),
                    'recommendation_description' => $recommendation['description'] ?? 'Item ini sering muncul bersama dalam transaksi bengkel.',
                    'suggestion' => $recommendation['suggestion'] ?? 'Pertimbangkan membuat paket servis atau promosi gabungan.',
                ]);
            }
        });
    }

    private function generateCode(): string
    {
        $prefix = 'APR-'.now()->format('Ymd');
        $latestCode = AprioriRun::where('code', 'like', $prefix.'-%')->orderByDesc('code')->value('code');
        $count = $latestCode ? ((int) substr($latestCode, -4)) + 1 : 1;

        return $prefix.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
