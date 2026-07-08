<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockMovement::query()
            ->with(['sparePart.itemCategory', 'transaction', 'createdBy'])
            ->latest();

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('reference_code', 'like', "%{$search}%")
                    ->orWhereHas('sparePart', fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"));
            });
        });

        $query->when($request->filled('spare_part_id'), fn ($query) => $query->where('spare_part_id', $request->integer('spare_part_id')));
        $query->when($request->filled('movement_type'), fn ($query) => $query->where('movement_type', $request->string('movement_type')));
        $query->when($request->filled('start_date'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('start_date')));
        $query->when($request->filled('end_date'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('end_date')));

        return response()->json([
            'success' => true,
            'message' => 'Data mutasi stok berhasil dimuat',
            'data' => $query->get(),
        ]);
    }
}
