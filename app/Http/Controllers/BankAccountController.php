<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BankAccountController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:255'],
            'account_number' => ['required', 'string', 'max:255'],
            'account_holder_name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->bankAccounts()->create($validated);

        return redirect()->back()->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BankAccount $bankAccount)
    {
        // Ensure user owns the bank account
        if ($bankAccount->user_id !== Auth::id()) {
            abort(403);
        }

        $bankAccount->delete();

        return redirect()->back()->with('success', 'Rekening bank berhasil dihapus.');
    }
}
