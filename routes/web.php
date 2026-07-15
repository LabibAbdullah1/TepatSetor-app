<?php

use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DepositController::class, 'index'])->name('dashboard');
    
    Route::get('/deposit/create', [DepositController::class, 'create'])->name('deposit.create');
    Route::post('/deposit/store', [DepositController::class, 'store'])->name('deposit.store');
    Route::get('/deposit/edit/{uuid}', [DepositController::class, 'edit'])->name('deposit.edit');
    Route::post('/deposit/update/{uuid}', [DepositController::class, 'update'])->name('deposit.update');
    Route::delete('/deposit/destroy/{uuid}', [DepositController::class, 'destroy'])->name('deposit.destroy');
    
    // Secure proof image route
    Route::get('/deposit/proof/{uuid}', [DepositController::class, 'serveProof'])->name('deposit.proof');
    
    // PDF generator route
    Route::get('/deposit/pdf/{uuid}', [DepositController::class, 'generatePdf'])->name('deposit.pdf');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/bank-accounts', [BankAccountController::class, 'store'])->name('bank-accounts.store');
    Route::delete('/bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy'])->name('bank-accounts.destroy');
});

require __DIR__.'/auth.php';
