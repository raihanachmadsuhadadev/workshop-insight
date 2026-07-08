<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AprioriFrequentItemset extends Model
{
    use HasFactory;

    protected $fillable = [
        'apriori_run_id',
        'items',
        'item_count',
        'support',
        'support_percentage',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'support' => 'decimal:4',
            'support_percentage' => 'decimal:2',
        ];
    }

    public function aprioriRun(): BelongsTo
    {
        return $this->belongsTo(AprioriRun::class);
    }
}
