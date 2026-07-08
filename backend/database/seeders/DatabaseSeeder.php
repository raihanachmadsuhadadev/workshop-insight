<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'admin@starmotor.test',
        ], [
            'name' => 'Admin Star Motor',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '081111111111',
            'is_active' => true,
        ]);

        User::updateOrCreate([
            'email' => 'owner@starmotor.test',
        ], [
            'name' => 'Owner Star Motor',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'phone' => '082222222222',
            'is_active' => true,
        ]);
    }
}
