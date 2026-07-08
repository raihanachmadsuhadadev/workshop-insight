<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Controller;
use App\Models\AprioriRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function transactions(Request $request): JsonResponse
    {
        $report = app(AdminReportController::class)->transactionReport($request);

        return response()->json([
            'success' => true,
            'message' => 'Laporan transaksi owner berhasil dimuat',
            'data' => $report,
        ]);
    }

    public function apriori(Request $request): JsonResponse
    {
        $run = $request->filled('apriori_run_id')
            ? AprioriRun::where('status', 'completed')->find($request->integer('apriori_run_id'))
            : AprioriRun::where('status', 'completed')->latest('ran_at')->first();

        if (! $run) {
            return response()->json([
                'success' => true,
                'message' => 'Belum ada hasil analisis Apriori.',
                'data' => [
                    'selected_run' => null,
                    'summary' => [
                        'total_runs' => AprioriRun::where('status', 'completed')->count(),
                        'total_transactions_analyzed' => 0,
                        'total_frequent_itemsets' => 0,
                        'total_rules' => 0,
                        'average_confidence' => 0,
                        'highest_lift' => 0,
                    ],
                    'frequent_itemsets' => [],
                    'association_rules' => [],
                    'recommendations' => [],
                    'filters_applied' => $request->all(),
                ],
            ]);
        }

        $run->load(['frequentItemsets', 'rules']);
        $rules = $run->rules
            ->when($request->filled('minimum_confidence'), fn ($rules) => $rules->where('confidence', '>=', (float) $request->minimum_confidence))
            ->when($request->filled('minimum_support'), fn ($rules) => $rules->where('support', '>=', (float) $request->minimum_support))
            ->when($request->filled('search'), function ($rules) use ($request) {
                $search = strtolower((string) $request->string('search'));
                return $rules->filter(fn ($rule) => str_contains(strtolower(implode(' ', array_merge($rule->antecedents ?? [], $rule->consequents ?? []))), $search));
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Laporan Apriori berhasil dimuat',
            'data' => [
                'selected_run' => $run,
                'summary' => [
                    'total_runs' => AprioriRun::where('status', 'completed')->count(),
                    'total_transactions_analyzed' => $run->total_transactions,
                    'total_frequent_itemsets' => $run->frequentItemsets->count(),
                    'total_rules' => $rules->count(),
                    'average_confidence' => $rules->count() ? round($rules->avg('confidence_percentage'), 2) : 0,
                    'highest_lift' => $rules->count() ? round($rules->max('lift'), 4) : 0,
                ],
                'frequent_itemsets' => $run->frequentItemsets,
                'association_rules' => $rules,
                'recommendations' => $rules->take(10)->map(fn ($rule) => [
                    'title' => $rule->recommendation_title,
                    'description' => $rule->recommendation_description,
                    'items' => array_values(array_merge($rule->antecedents ?? [], $rule->consequents ?? [])),
                    'confidence_percentage' => (float) $rule->confidence_percentage,
                    'support_percentage' => (float) $rule->support_percentage,
                    'suggestion' => $rule->suggestion,
                ])->values(),
                'filters_applied' => $request->all(),
            ],
        ]);
    }
}
