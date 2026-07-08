<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use App\Models\SparePart;
use App\Models\StockMovement;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::query()
            ->with(['customer', 'mechanic', 'cashier'])
            ->latest('transaction_date');

        $this->applyFilters($query, $request);

        return $this->success('Data transaksi berhasil dimuat', $query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'transaction_date' => ['nullable', 'date'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'mechanic_id' => ['nullable', 'exists:mechanics,id'],
            'vehicle_plate_number' => ['nullable', 'string', 'max:100'],
            'vehicle_description' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['nullable', Rule::in(['cash', 'transfer', 'qris', 'other'])],
            'payment_status' => ['nullable', Rule::in(['paid', 'unpaid'])],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['required', Rule::in(['spare_part', 'service'])],
            'items.*.item_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $transaction = DB::transaction(function () use ($payload, $request) {
            $code = $this->generateCode();
            $subtotalSpareParts = 0;
            $subtotalServices = 0;
            $preparedItems = [];

            foreach ($payload['items'] as $item) {
                $quantity = (int) $item['quantity'];

                if ($item['item_type'] === 'spare_part') {
                    $sparePart = SparePart::where('is_active', true)->lockForUpdate()->find($item['item_id']);

                    if (! $sparePart) {
                        throw ValidationException::withMessages([
                            'items' => ['Suku cadang tidak ditemukan atau tidak aktif.'],
                        ]);
                    }

                    if ($sparePart->current_stock < $quantity) {
                        throw ValidationException::withMessages([
                            'items' => ["Stok {$sparePart->name} tidak mencukupi. Stok tersedia: {$sparePart->current_stock}."],
                        ]);
                    }

                    $unitPrice = (float) $sparePart->selling_price;
                    $subtotal = $unitPrice * $quantity;
                    $subtotalSpareParts += $subtotal;
                    $preparedItems[] = compact('sparePart') + [
                        'item_type' => 'spare_part',
                        'item_id' => $sparePart->id,
                        'item_code' => $sparePart->code,
                        'item_name' => $sparePart->name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $subtotal,
                    ];

                    continue;
                }

                $service = ServiceItem::where('is_active', true)->find($item['item_id']);

                if (! $service) {
                    throw ValidationException::withMessages([
                        'items' => ['Layanan servis tidak ditemukan atau tidak aktif.'],
                    ]);
                }

                $unitPrice = (float) $service->service_price;
                $subtotal = $unitPrice * $quantity;
                $subtotalServices += $subtotal;
                $preparedItems[] = [
                    'item_type' => 'service',
                    'item_id' => $service->id,
                    'item_code' => $service->code,
                    'item_name' => $service->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $discountAmount = (float) ($payload['discount_amount'] ?? 0);
            $totalAmount = max(0, $subtotalSpareParts + $subtotalServices - $discountAmount);

            $transaction = Transaction::create([
                'code' => $code,
                'transaction_date' => $payload['transaction_date'] ?? now(),
                'customer_id' => $payload['customer_id'] ?? null,
                'mechanic_id' => $payload['mechanic_id'] ?? null,
                'cashier_id' => $request->user()?->id,
                'vehicle_plate_number' => $payload['vehicle_plate_number'] ?? null,
                'vehicle_description' => $payload['vehicle_description'] ?? null,
                'subtotal_spare_parts' => $subtotalSpareParts,
                'subtotal_services' => $subtotalServices,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'payment_method' => $payload['payment_method'] ?? 'cash',
                'payment_status' => $payload['payment_status'] ?? 'paid',
                'status' => 'completed',
                'notes' => $payload['notes'] ?? null,
            ]);

            foreach ($preparedItems as $preparedItem) {
                $sparePart = $preparedItem['sparePart'] ?? null;
                unset($preparedItem['sparePart']);

                $transaction->items()->create($preparedItem);

                if ($sparePart instanceof SparePart) {
                    $stockBefore = $sparePart->current_stock;
                    $stockAfter = $stockBefore - $preparedItem['quantity'];

                    $sparePart->update(['current_stock' => $stockAfter]);

                    StockMovement::create([
                        'spare_part_id' => $sparePart->id,
                        'transaction_id' => $transaction->id,
                        'movement_type' => 'out',
                        'quantity' => $preparedItem['quantity'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_code' => $transaction->code,
                        'description' => 'Pengurangan stok dari transaksi '.$transaction->code,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }

            return $transaction->load(['customer', 'mechanic', 'cashier', 'items', 'stockMovements.sparePart']);
        });

        return $this->success('Transaksi berhasil dibuat', $transaction, 201);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return $this->success(
            'Detail transaksi berhasil dimuat',
            $transaction->load(['customer', 'mechanic', 'cashier', 'cancelledBy', 'items', 'stockMovements.sparePart', 'stockMovements.createdBy'])
        );
    }

    public function cancel(Request $request, Transaction $transaction): JsonResponse
    {
        $payload = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($transaction->status !== 'completed') {
            throw ValidationException::withMessages([
                'transaction' => ['Transaksi yang sudah dibatalkan tidak bisa dibatalkan ulang.'],
            ]);
        }

        $cancelled = DB::transaction(function () use ($payload, $request, $transaction) {
            $transaction->load('items');

            foreach ($transaction->items->where('item_type', 'spare_part') as $item) {
                $sparePart = SparePart::lockForUpdate()->find($item->item_id);

                if (! $sparePart) {
                    continue;
                }

                $stockBefore = $sparePart->current_stock;
                $stockAfter = $stockBefore + $item->quantity;

                $sparePart->update(['current_stock' => $stockAfter]);

                StockMovement::create([
                    'spare_part_id' => $sparePart->id,
                    'transaction_id' => $transaction->id,
                    'movement_type' => 'reversal',
                    'quantity' => $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_code' => $transaction->code,
                    'description' => 'Pengembalian stok dari pembatalan transaksi '.$transaction->code,
                    'created_by' => $request->user()?->id,
                ]);
            }

            $transaction->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $request->user()?->id,
                'cancellation_reason' => $payload['cancellation_reason'],
            ]);

            return $transaction->fresh()->load(['customer', 'mechanic', 'cashier', 'cancelledBy', 'items', 'stockMovements.sparePart']);
        });

        return $this->success('Transaksi berhasil dibatalkan', $cancelled);
    }

    private function applyFilters($query, Request $request): void
    {
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
    }

    private function generateCode(): string
    {
        $prefix = 'TRX-'.now()->format('Ymd');
        $latestCode = Transaction::where('code', 'like', $prefix.'-%')->orderByDesc('code')->value('code');
        $count = $latestCode ? ((int) substr($latestCode, -4)) + 1 : 1;

        return $prefix.'-'.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
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
