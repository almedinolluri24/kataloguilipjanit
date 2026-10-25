<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DirectoryAssistantController;

/*
|--------------------------------------------------------------------------
| API Routes: Katalogu i Bizneseve të Komunës së Lipjanit
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'ok',
            'app' => 'Katalogu i Bizneseve te Lipjanit API',
            'database' => 'connected',
        ]);
    } catch (\Throwable $exception) {
        return response()->json([
            'status' => 'error',
            'app' => 'Katalogu i Bizneseve te Lipjanit API',
            'database' => 'unavailable',
        ], 503);
    }
});

// Autentikimi i Administratorit (publik - pa token)
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/send-invite-code', [AuthController::class, 'sendInviteCode'])->middleware('throttle:3,1');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Rutat Publike (pa regjistrim / pa token)
Route::get('/businesses', [PublicController::class, 'businesses']);
Route::post('/businesses', [PublicController::class, 'submitBusiness']);
Route::get('/businesses/{idOrSlug}', [PublicController::class, 'business']);
Route::get('/categories', [PublicController::class, 'categories']);
Route::get('/settlements', [PublicController::class, 'settlements']);
Route::get('/services', [PublicController::class, 'services']);
Route::get('/advertisements', [PublicController::class, 'advertisements']);

// Public visitor assistant: limited to published directory data and protected by an IP rate limit.
Route::post('/ai/chat', [DirectoryAssistantController::class, 'chat'])->middleware('throttle:assistant-public-chat');

// Rutat Administrative (te mbrojtura me admin.auth middleware)
Route::prefix('admin')->middleware('admin.auth')->group(function () {

    // Directory assistant (administrator-only, rate limited)
    Route::post('/ai/chat', [DirectoryAssistantController::class, 'chat'])->middleware('throttle:assistant-chat');

    // === PROFILI I ADMINISTRATORIT ===
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);

    // Statistikat e Dashboard-it
    Route::get('/stats', [AdminController::class, 'stats']);

    // Bizneset CRUD
    Route::get('/businesses', [AdminController::class, 'businesses']);
    Route::post('/businesses', [AdminController::class, 'createBusiness']);
    Route::put('/businesses/{id}', [AdminController::class, 'updateBusiness']);
    Route::delete('/businesses/{id}', [AdminController::class, 'deleteBusiness']);

    // Kategorite CRUD
    Route::get('/categories', [AdminController::class, 'categories']);
    Route::post('/categories', [AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

    // Vendbanimet CRUD
    Route::get('/settlements', [AdminController::class, 'settlements']);
    Route::post('/settlements', [AdminController::class, 'storeSettlement']);
    Route::put('/settlements/{id}', [AdminController::class, 'updateSettlement']);
    Route::delete('/settlements/{id}', [AdminController::class, 'deleteSettlement']);

    // Reklamat CRUD
    Route::get('/advertisements', [AdminController::class, 'advertisements']);
    Route::post('/advertisements', [AdminController::class, 'storeAdvertisement']);
    Route::put('/advertisements/{id}', [AdminController::class, 'updateAdvertisement']);
    Route::delete('/advertisements/{id}', [AdminController::class, 'deleteAdvertisement']);
});
