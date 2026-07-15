<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDepositRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'deposit_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', 'in:draft,completed'],
            'proof_image' => [
                function ($attribute, $value, $fail) {
                    $uuid = $this->route('uuid') ?? $this->input('uuid');
                    $deposit = \App\Models\Deposit::where('uuid', $uuid)->first();
                    
                    if ($this->input('status') === 'completed' && (!$deposit || !$deposit->proof_image_path) && !$this->hasFile('proof_image')) {
                        $fail('Bukti setoran bank wajib diunggah jika status adalah Selesai (Completed).');
                    }
                },
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,pdf',
                'max:5120',
            ],
            'bank_account_id' => [
                'nullable',
                'integer',
                \Illuminate\Validation\Rule::exists('bank_accounts', 'id')->where(function ($query) {
                    $query->where('user_id', $this->user()->id);
                }),
            ],
            'details' => ['required', 'array', 'min:1'],
            'details.*.denomination' => ['required', 'integer', 'in:100000,50000,20000,10000,5000,2000,1000'],
            'details.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'proof_image.mimes' => 'Bukti setoran harus berupa file gambar (jpeg, png, jpg) atau PDF.',
            'proof_image.max' => 'Ukuran file bukti setoran tidak boleh melebihi 5MB.',
            'details.*.quantity.min' => 'Jumlah denominasi uang tidak boleh kurang dari 0.',
        ];
    }
}
