<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'deposit_id',
        'category_name',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
        ];
    }

    /**
     * Get the deposit that owns this category breakdown.
     */
    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }
}
