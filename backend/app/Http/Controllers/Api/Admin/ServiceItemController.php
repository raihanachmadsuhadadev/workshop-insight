<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceItem::query()->with('itemCategory')->latest();

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        });

        $query->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')));
        $query->when($request->filled('category_id'), fn ($query) => $query->where('item_category_id', $request->integer('category_id')));

        return $this->success('Data layanan servis berhasil dimuat', $query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $serviceItem = ServiceItem::create($this->validated($request));

        return $this->success('Layanan servis berhasil ditambahkan', $serviceItem->load('itemCategory'), 201);
    }

    public function show(ServiceItem $serviceItem): JsonResponse
    {
        return $this->success('Detail layanan servis berhasil dimuat', $serviceItem->load('itemCategory'));
    }

    public function update(Request $request, ServiceItem $serviceItem): JsonResponse
    {
        $serviceItem->update($this->validated($request, $serviceItem->id));

        return $this->success('Layanan servis berhasil diperbarui', $serviceItem->fresh()->load('itemCategory'));
    }

    public function destroy(ServiceItem $serviceItem): JsonResponse
    {
        $serviceItem->delete();

        return $this->success('Layanan servis berhasil dihapus', null);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'item_category_id' => ['nullable', 'exists:item_categories,id'],
            'code' => ['required', 'string', 'max:50', Rule::unique('service_items', 'code')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'service_price' => ['nullable', 'numeric', 'min:0'],
            'estimated_duration' => ['nullable', 'integer', 'min:0'],
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
