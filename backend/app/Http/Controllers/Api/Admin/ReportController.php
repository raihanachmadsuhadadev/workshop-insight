<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function transactions(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Laporan transaksi berhasil dimuat',
            'data' => $this->transactionReport($request),
        ]);
    }

    public function stocks(Request $request): JsonResponse
    {
        $query = SparePart::query()->with('itemCategory');

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        });
        $query->when($request->filled('category_id'), fn ($query) => $query->where('item_category_id', $request->integer('category_id')));
        $query->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')));
        $query->when($request->string('stock_status')->toString() === 'safe', fn ($query) => $query->whereColumn('current_stock', '>', 'minimum_stock'));
        $query->when($request->string('stock_status')->toString() === 'low', fn ($query) => $query->whereColumn('current_stock', '<=', 'minimum_stock'));

        $items = $query->orderBy('name')->get()->map(function (SparePart $part) {
            $stockValue = (float) $part->purchase_price * $part->current_stock;

            return [
                'id' => $part->id,
                'code' => $part->code,
                'name' => $part->name,
                'category' => $part->itemCategory?->name,
                'brand' => $part->brand,
                'current_stock' => $part->current_stock,
                'minimum_stock' => $part->minimum_stock,
                'purchase_price' => (float) $part->purchase_price,
                'selling_price' => (float) $part->selling_price,
                'stock_status' => $part->current_stock <= $part->minimum_stock ? 'low' : 'safe',
                'stock_value' => $stockValue,
                'is_active' => $part->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Laporan stok berhasil dimuat',
            'data' => [
                'summary' => [
                    'total_spare_parts' => $items->count(),
                    'safe_stock' => $items->where('stock_status', 'safe')->count(),
                    'low_stock' => $items->where('stock_status', 'low')->count(),
                    'total_stock_value' => $items->sum('stock_value'),
                ],
                'data' => $items->values(),
                'filters_applied' => $request->only(['search', 'category_id', 'stock_status', 'is_active']),
            ],
        ]);
    }

    public function transactionReport(Request $request): array
    {
        $query = Transaction::query()->with(['customer', 'mechanic']);

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('vehicle_plate_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('mechanic', fn ($query) => $query->where('name', 'like', "%{$search}%"));
            });
        });
        $query->when($request->filled('start_date'), fn ($query) => $query->whereDate('transaction_date', '>=', $request->date('start_date')));
        $query->when($request->filled('end_date'), fn ($query) => $query->whereDate('transaction_date', '<=', $request->date('end_date')));
        $query->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')));
        $query->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')));
        $query->when($request->filled('customer_id'), fn ($query) => $query->where('customer_id', $request->integer('customer_id')));
        $query->when($request->filled('mechanic_id'), fn ($query) => $query->where('mechanic_id', $request->integer('mechanic_id')));

        $transactions = $query->latest('transaction_date')->get();
        $completed = $transactions->where('status', 'completed');

        return [
            'summary' => [
                'total_transactions' => $transactions->count(),
                'completed_transactions' => $completed->count(),
                'cancelled_transactions' => $transactions->where('status', 'cancelled')->count(),
                'total_revenue' => $completed->sum('total_amount'),
                'total_discount' => $completed->sum('discount_amount'),
                'average_transaction' => $completed->count() ? round($completed->avg('total_amount'), 2) : 0,
            ],
            'data' => $transactions->values(),
            'filters_applied' => $request->only(['start_date', 'end_date', 'status', 'payment_status', 'customer_id', 'mechanic_id', 'search']),
        ];
    }
}
