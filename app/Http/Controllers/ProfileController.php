<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'bankAccounts' => $request->user()->bankAccounts()->orderBy('bank_name')->get(),
            'defaultSigners' => $request->user()->default_signers,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update default signers setting.
     */
    public function updateDefaultSigners(Request $request): RedirectResponse
    {
        $request->validate([
            'default_signers' => ['nullable', 'array', 'max:3'],
            'default_signers.*.name' => ['nullable', 'string', 'max:255'],
            'default_signers.*.title' => ['nullable', 'string', 'max:255'],
        ]);

        $rawSigners = $request->input('default_signers', []);
        $cleanSigners = [];
        if (is_array($rawSigners)) {
            foreach ($rawSigners as $s) {
                $name = trim($s['name'] ?? '');
                $title = trim($s['title'] ?? '');
                if (!empty($name) || !empty($title)) {
                    $cleanSigners[] = ['name' => $name, 'title' => $title];
                }
            }
        }

        $request->user()->update([
            'default_signers' => count($cleanSigners) > 0 ? array_values($cleanSigners) : null,
        ]);

        return Redirect::route('profile.edit')->with('success', 'Preset penanda tangan default berhasil diperbarui.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
