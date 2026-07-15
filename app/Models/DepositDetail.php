<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositDetail extends Model
{
    protected $fillable = [
        'deposit_id',
        'denomination',
        'quantity',
        'subtotal',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'denomination' => 'integer',
            'quantity' => 'integer',
            'subtotal' => 'integer',
        ];
    }

    /**
     * Get the deposit that owns the detail.
     */
    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }
}
