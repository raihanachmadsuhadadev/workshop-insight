<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ItemCategoryController;
use App\Http\Controllers\Api\Admin\MechanicController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\ServiceItemController;
use App\Http\Controllers\Api\Admin\SparePartController;
use App\Http\Controllers\Api\Admin\StockMovementController;
use App\Http\Controllers\Api\Admin\TransactionController;
use App\Http\Controllers\Api\Owner\AprioriAnalysisController;
use App\Http\Controllers\Api\Owner\DashboardController as OwnerDashboardController;
use App\Http\Controllers\Api\Owner\ReportController as OwnerReportController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/dashboard', AdminDashboardController::class);
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
        Route::get('transactions', [TransactionController::class, 'index']);
        Route::post('transactions', [TransactionController::class, 'store']);
        Route::get('transactions/{transaction}', [TransactionController::class, 'show']);
        Route::post('transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);
        Route::get('stock-movements', [StockMovementController::class, 'index']);
        Route::get('reports/transactions', [AdminReportController::class, 'transactions']);
        Route::get('reports/stocks', [AdminReportController::class, 'stocks']);
    });

    Route::middleware('role:owner')->prefix('owner')->group(function (): void {
        Route::get('/dashboard', OwnerDashboardController::class);
        Route::get('/dashboard-summary', function () {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard owner berhasil dimuat',
                'data' => [
                    'role' => 'owner',
                ],
            ]);
        });

        Route::get('/apriori-runs', [AprioriAnalysisController::class, 'index']);
        Route::post('/apriori-runs', [AprioriAnalysisController::class, 'store']);
        Route::get('/apriori-runs/{aprioriRun}', [AprioriAnalysisController::class, 'show']);
        Route::delete('/apriori-runs/{aprioriRun}', [AprioriAnalysisController::class, 'destroy']);
        Route::get('/recommendations', [AprioriAnalysisController::class, 'recommendations']);
        Route::get('/reports/transactions', [OwnerReportController::class, 'transactions']);
        Route::get('/reports/apriori', [OwnerReportController::class, 'apriori']);
    });
});
