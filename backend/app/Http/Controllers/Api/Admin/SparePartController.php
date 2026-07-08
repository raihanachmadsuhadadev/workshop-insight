<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SparePartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SparePart::query()->with('itemCategory')->latest();

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        });

        $query->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')));
        $query->when($request->filled('category_id'), fn ($query) => $query->where('item_category_id', $request->integer('category_id')));
        $query->when($request->boolean('low_stock'), fn ($query) => $query->whereColumn('current_stock', '<=', 'minimum_stock'));

        return $this->success('Data suku cadang berhasil dimuat', $query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $sparePart = SparePart::create($this->validated($request));

        return $this->success('Suku cadang berhasil ditambahkan', $sparePart->load('itemCategory'), 201);
    }

    public function show(SparePart $sparePart): JsonResponse
    {
        return $this->success('Detail suku cadang berhasil dimuat', $sparePart->load('itemCategory'));
    }

    public function update(Request $request, SparePart $sparePart): JsonResponse
    {
        $sparePart->update($this->validated($request, $sparePart->id));

        return $this->success('Suku cadang berhasil diperbarui', $sparePart->fresh()->load('itemCategory'));
    }

    public function destroy(SparePart $sparePart): JsonResponse
    {
        $sparePart->delete();

        return $this->success('Suku cadang berhasil dihapus', null);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'item_category_id' => ['nullable', 'exists:item_categories,id'],
            'code' => ['required', 'string', 'max:50', Rule::unique('spare_parts', 'code')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:50'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'current_stock' => ['nullable', 'integer', 'min:0'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
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
