<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\AprioriRun;
use App\Models\Customer;
use App\Models\ServiceItem;
use App\Models\SparePart;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $latestRun = AprioriRun::with(['rules' => fn ($query) => $query->orderByDesc('confidence')->limit(5)])
            ->where('status', 'completed')
            ->latest('ran_at')
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard owner berhasil dimuat',
            'data' => [
                'summary' => [
                    'total_transactions' => Transaction::count(),
                    'total_revenue' => (float) Transaction::where('status', 'completed')->sum('total_amount'),
                    'total_customers' => Customer::count(),
                    'total_spare_parts' => SparePart::count(),
                    'total_services' => ServiceItem::count(),
                    'total_apriori_runs' => AprioriRun::count(),
                    'low_stock_count' => SparePart::whereColumn('current_stock', '<=', 'minimum_stock')->count(),
                ],
                'latest_apriori_run' => $latestRun,
                'latest_rules' => $latestRun?->rules ?? [],
                'latest_recommendations' => $latestRun?->rules?->map(fn ($rule) => [
                    'title' => $rule->recommendation_title,
                    'description' => $rule->recommendation_description,
                    'items' => array_values(array_merge($rule->antecedents ?? [], $rule->consequents ?? [])),
                    'confidence_percentage' => (float) $rule->confidence_percentage,
                    'support_percentage' => (float) $rule->support_percentage,
                    'suggestion' => $rule->suggestion,
                ])->values() ?? [],
                'revenue_by_month' => $this->monthly('sum'),
                'transaction_by_month' => $this->monthly('count'),
                'top_spare_parts' => $this->topItems('spare_part'),
                'top_services' => $this->topItems('service'),
            ],
        ]);
    }

    private function monthly(string $mode)
    {
        $query = Transaction::query()
            ->selectRaw("to_char(transaction_date, 'YYYY-MM') as month")
            ->where('status', 'completed')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12);

        return $mode === 'sum'
            ? $query->selectRaw('sum(total_amount) as total')->get()
            : $query->selectRaw('count(*) as total')->get();
    }

    private function topItems(string $type)
    {
        return TransactionItem::query()
            ->select('item_code', 'item_name')
            ->selectRaw('sum(quantity) as total_quantity')
            ->selectRaw('sum(subtotal) as total_amount')
            ->where('item_type', $type)
            ->whereHas('transaction', fn ($query) => $query->where('status', 'completed'))
            ->groupBy('item_code', 'item_name')
            ->orderByDesc(DB::raw('sum(quantity)'))
            ->limit(5)
            ->get();
    }
}
