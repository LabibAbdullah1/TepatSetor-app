<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Deposit extends Model
{
    protected $fillable = [
        'uuid',
        'deposit_date',
        'notes',
        'grand_total',
        'status',
        'proof_image_path',
        'bank_account_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deposit_date' => 'date',
            'grand_total' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the details for the deposit.
     */
    public function details(): HasMany
    {
        return $this->hasMany(DepositDetail::class);
    }

    /**
     * Get the bank account linked to this deposit.
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }
}
