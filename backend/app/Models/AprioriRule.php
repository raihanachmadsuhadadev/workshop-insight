<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AprioriRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'apriori_run_id',
        'antecedents',
        'consequents',
        'support',
        'confidence',
        'lift',
        'support_percentage',
        'confidence_percentage',
        'interpretation',
        'recommendation_title',
        'recommendation_description',
        'suggestion',
    ];

    protected function casts(): array
    {
        return [
            'antecedents' => 'array',
            'consequents' => 'array',
            'support' => 'decimal:4',
            'confidence' => 'decimal:4',
            'lift' => 'decimal:4',
            'support_percentage' => 'decimal:2',
            'confidence_percentage' => 'decimal:2',
        ];
    }

    public function aprioriRun(): BelongsTo
    {
        return $this->belongsTo(AprioriRun::class);
    }
}
