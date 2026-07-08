<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ItemCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItemCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ItemCategory::query()->latest();

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        });

        $query->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')));

        return $this->success('Data kategori item berhasil dimuat', $query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $category = ItemCategory::create($this->validated($request));

        return $this->success('Kategori item berhasil ditambahkan', $category, 201);
    }

    public function show(ItemCategory $itemCategory): JsonResponse
    {
        return $this->success('Detail kategori item berhasil dimuat', $itemCategory);
    }

    public function update(Request $request, ItemCategory $itemCategory): JsonResponse
    {
        $itemCategory->update($this->validated($request, $itemCategory->id));

        return $this->success('Kategori item berhasil diperbarui', $itemCategory->fresh());
    }

    public function destroy(ItemCategory $itemCategory): JsonResponse
    {
        $itemCategory->delete();

        return $this->success('Kategori item berhasil dihapus', null);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('item_categories', 'code')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', Rule::in(['spare_part', 'service', 'general'])],
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
