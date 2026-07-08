<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mechanic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MechanicController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Mechanic::query()->latest();

        $query->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search');
            $query->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('specialization', 'like', "%{$search}%");
            });
        });

        $query->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')));

        return $this->success('Data mekanik berhasil dimuat', $query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $mechanic = Mechanic::create($this->validated($request));

        return $this->success('Mekanik berhasil ditambahkan', $mechanic, 201);
    }

    public function show(Mechanic $mechanic): JsonResponse
    {
        return $this->success('Detail mekanik berhasil dimuat', $mechanic);
    }

    public function update(Request $request, Mechanic $mechanic): JsonResponse
    {
        $mechanic->update($this->validated($request, $mechanic->id));

        return $this->success('Mekanik berhasil diperbarui', $mechanic->fresh());
    }

    public function destroy(Mechanic $mechanic): JsonResponse
    {
        $mechanic->delete();

        return $this->success('Mekanik berhasil dihapus', null);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('mechanics', 'code')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'specialization' => ['nullable', 'string', 'max:255'],
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
