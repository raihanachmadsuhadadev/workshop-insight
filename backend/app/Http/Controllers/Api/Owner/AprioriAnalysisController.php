<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\AprioriRun;
use App\Models\AprioriRule;
use App\Services\AprioriAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AprioriAnalysisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $runs = AprioriRun::query()
            ->with('runBy')
            ->latest('ran_at')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('start_date'), fn ($query) => $query->whereDate('ran_at', '>=', $request->date('start_date')))
            ->when($request->filled('end_date'), fn ($query) => $query->whereDate('ran_at', '<=', $request->date('end_date')))
            ->get();

        return $this->success('Data hasil analisis Apriori berhasil dimuat', $runs);
    }

    public function store(Request $request, AprioriAnalysisService $service): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'item_scope' => ['nullable', Rule::in(['all', 'spare_part', 'service'])],
            'minimum_support' => ['required', 'numeric', 'min:0.01', 'max:1'],
            'minimum_confidence' => ['required', 'numeric', 'min:0.01', 'max:1'],
        ]);

        $run = $service->run($payload, $request->user()->id);

        return $this->success('Analisis Apriori berhasil dijalankan', $run, 201);
    }

    public function show(AprioriRun $aprioriRun): JsonResponse
    {
        return $this->success(
            'Detail hasil analisis Apriori berhasil dimuat',
            $aprioriRun->load(['runBy', 'frequentItemsets', 'rules'])
        );
    }

    public function destroy(AprioriRun $aprioriRun): JsonResponse
    {
        $aprioriRun->delete();

        return $this->success('Hasil analisis Apriori berhasil dihapus', null);
    }

    public function recommendations(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 10), 50);
        $runId = $request->integer('run_id');
        $latestRunId = $runId ?: AprioriRun::where('status', 'completed')->latest('ran_at')->value('id');

        $rules = AprioriRule::query()
            ->when($latestRunId, fn ($query) => $query->where('apriori_run_id', $latestRunId))
            ->orderByDesc('confidence')
            ->orderByDesc('lift')
            ->limit($limit)
            ->get()
            ->map(fn (AprioriRule $rule) => [
                'title' => $rule->recommendation_title,
                'description' => $rule->recommendation_description,
                'items' => array_values(array_merge($rule->antecedents ?? [], $rule->consequents ?? [])),
                'confidence_percentage' => (float) $rule->confidence_percentage,
                'support_percentage' => (float) $rule->support_percentage,
                'suggestion' => $rule->suggestion,
                'run_id' => $rule->apriori_run_id,
            ]);

        return $this->success('Rekomendasi paket berhasil dimuat', $rules);
    }

    private function success(string $message, mixed $data, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }
}
