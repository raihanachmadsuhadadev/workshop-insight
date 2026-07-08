<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\ItemCategoryController;
use App\Http\Controllers\Api\Admin\MechanicController;
use App\Http\Controllers\Api\Admin\ServiceItemController;
use App\Http\Controllers\Api\Admin\SparePartController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/dashboard-summary', function () {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard admin berhasil dimuat',
                'data' => [
                    'role' => 'admin',
                ],
            ]);
        });

        Route::apiResource('item-categories', ItemCategoryController::class);
        Route::apiResource('spare-parts', SparePartController::class);
        Route::apiResource('services', ServiceItemController::class)->parameters([
            'services' => 'serviceItem',
        ]);
        Route::apiResource('customers', CustomerController::class);
        Route::apiResource('mechanics', MechanicController::class);
    });

    Route::middleware('role:owner')->get('/owner/dashboard-summary', function () {
        return response()->json([
            'success' => true,
            'message' => 'Dashboard owner berhasil dimuat',
            'data' => [
                'role' => 'owner',
            ],
        ]);
    });
});
