<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AprioriRun extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'start_date',
        'end_date',
        'item_scope',
        'minimum_support',
        'minimum_confidence',
        'total_transactions',
        'total_unique_items',
        'total_frequent_itemsets',
        'total_rules',
        'status',
        'message',
        'run_by',
        'ran_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'minimum_support' => 'decimal:4',
            'minimum_confidence' => 'decimal:4',
            'ran_at' => 'datetime',
        ];
    }

    public function runBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'run_by');
    }

    public function frequentItemsets(): HasMany
    {
        return $this->hasMany(AprioriFrequentItemset::class);
    }

    public function rules(): HasMany
    {
        return $this->hasMany(AprioriRule::class);
    }
}
