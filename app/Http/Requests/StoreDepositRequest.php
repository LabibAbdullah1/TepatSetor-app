<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDepositRequest extends FormRequest
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
                'required_if:status,completed',
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
            'signers' => ['nullable', 'array', 'max:3'],
            'signers.*.name' => ['nullable', 'string', 'max:255'],
            'signers.*.title' => ['nullable', 'string', 'max:255'],
            'categories' => ['nullable', 'array'],
            'categories.*.category_name' => ['required_with:categories.*.amount', 'nullable', 'string', 'max:255'],
            'categories.*.amount' => ['required_with:categories.*.category_name', 'nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $details = $this->input('details', []);
            $categories = array_filter($this->input('categories', []), function ($cat) {
                return !empty($cat['category_name']) || (isset($cat['amount']) && floatval($cat['amount']) > 0);
            });

            if (!empty($categories)) {
                $grandTotal = 0;
                foreach ($details as $detail) {
                    $grandTotal += (int) ($detail['quantity'] ?? 0) * (int) ($detail['denomination'] ?? 0);
                }

                $categoryTotal = 0;
                foreach ($categories as $cat) {
                    $categoryTotal += (float) ($cat['amount'] ?? 0);
                }

                if ((int) round($categoryTotal) !== (int) $grandTotal) {
                    $validator->errors()->add(
                        'categories',
                        'Total nominal rincian keterangan opsional (Rp ' . number_format($categoryTotal, 0, ',', '.') . ') harus sama dengan total keseluruhan uang yang disetor (Rp ' . number_format($grandTotal, 0, ',', '.') . ').'
                    );
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'proof_image.required_if' => 'Bukti setoran bank wajib diunggah jika status adalah Selesai (Completed).',
            'proof_image.mimes' => 'Bukti setoran harus berupa file gambar (jpeg, png, jpg) atau PDF.',
            'proof_image.max' => 'Ukuran file bukti setoran tidak boleh melebihi 5MB.',
            'details.*.quantity.min' => 'Jumlah denominasi uang tidak boleh kurang dari 0.',
            'signers.max' => 'Maksimal 3 penanda tangan.',
        ];
    }
}
