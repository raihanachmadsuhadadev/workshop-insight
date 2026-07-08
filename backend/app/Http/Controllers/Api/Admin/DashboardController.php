<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        $today = now()->toDateString();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard admin berhasil dimuat',
            'data' => [
                'summary' => [
                    'total_transactions_today' => Transaction::whereDate('transaction_date', $today)->count(),
                    'revenue_today' => (float) Transaction::where('status', 'completed')->whereDate('transaction_date', $today)->sum('total_amount'),
                    'total_customers' => Customer::count(),
                    'total_spare_parts' => SparePart::count(),
                    'low_stock_count' => SparePart::whereColumn('current_stock', '<=', 'minimum_stock')->count(),
                    'total_services' => ServiceItem::count(),
                ],
                'recent_transactions' => Transaction::with(['customer', 'mechanic'])
                    ->latest('transaction_date')
                    ->limit(5)
                    ->get(),
                'low_stock_items' => SparePart::with('itemCategory')
                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                    ->orderBy('current_stock')
                    ->limit(5)
                    ->get(),
                'top_spare_parts' => $this->topItems('spare_part'),
                'top_services' => $this->topItems('service'),
                'monthly_transaction_summary' => Transaction::query()
                    ->selectRaw("to_char(transaction_date, 'YYYY-MM') as month")
                    ->selectRaw('count(*) as total_transactions')
                    ->selectRaw("sum(case when status = 'completed' then total_amount else 0 end) as revenue")
                    ->groupBy('month')
                    ->orderBy('month')
                    ->limit(12)
                    ->get(),
            ],
        ]);
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
