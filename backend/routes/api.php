<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin')->get('/admin/dashboard-summary', function () {
        return response()->json([
            'success' => true,
            'message' => 'Dashboard admin berhasil dimuat',
            'data' => [
                'role' => 'admin',
            ],
        ]);
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
