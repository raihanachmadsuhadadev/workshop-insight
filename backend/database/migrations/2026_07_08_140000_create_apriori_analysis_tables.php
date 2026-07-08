<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apriori_runs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('item_scope')->default('all');
            $table->decimal('minimum_support', 8, 4);
            $table->decimal('minimum_confidence', 8, 4);
            $table->integer('total_transactions')->default(0);
            $table->integer('total_unique_items')->default(0);
            $table->integer('total_frequent_itemsets')->default(0);
            $table->integer('total_rules')->default(0);
            $table->string('status')->default('completed');
            $table->text('message')->nullable();
            $table->foreignId('run_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('ran_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('apriori_frequent_itemsets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apriori_run_id')->constrained()->cascadeOnDelete();
            $table->json('items');
            $table->integer('item_count');
            $table->decimal('support', 8, 4);
            $table->decimal('support_percentage', 8, 2);
            $table->timestamps();
        });

        Schema::create('apriori_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apriori_run_id')->constrained()->cascadeOnDelete();
            $table->json('antecedents');
            $table->json('consequents');
            $table->decimal('support', 8, 4);
            $table->decimal('confidence', 8, 4);
            $table->decimal('lift', 8, 4);
            $table->decimal('support_percentage', 8, 2);
            $table->decimal('confidence_percentage', 8, 2);
            $table->text('interpretation')->nullable();
            $table->string('recommendation_title')->nullable();
            $table->text('recommendation_description')->nullable();
            $table->text('suggestion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apriori_rules');
        Schema::dropIfExists('apriori_frequent_itemsets');
        Schema::dropIfExists('apriori_runs');
    }
};
