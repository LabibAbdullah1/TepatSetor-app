<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BankAccount extends Model
{
    protected $fillable = [
        'bank_name',
        'account_number',
        'account_holder_name',
    ];

    /**
     * Get the user that owns the bank account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the deposits for the bank account.
     */
    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }
}
