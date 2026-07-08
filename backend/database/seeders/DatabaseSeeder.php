<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\ItemCategory;
use App\Models\Mechanic;
use App\Models\ServiceItem;
use App\Models\SparePart;
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

        $categories = collect([
            ['code' => 'OLI', 'name' => 'Oli & Pelumas', 'type' => 'spare_part'],
            ['code' => 'REM', 'name' => 'Sistem Rem', 'type' => 'spare_part'],
            ['code' => 'MESIN', 'name' => 'Komponen Mesin', 'type' => 'spare_part'],
            ['code' => 'KELISTRIKAN', 'name' => 'Kelistrikan', 'type' => 'spare_part'],
            ['code' => 'SERVIS', 'name' => 'Layanan Servis', 'type' => 'service'],
            ['code' => 'BAN', 'name' => 'Ban & Roda', 'type' => 'spare_part'],
            ['code' => 'AKSESORIS', 'name' => 'Aksesoris', 'type' => 'general'],
            ['code' => 'CVT', 'name' => 'CVT & Transmisi', 'type' => 'spare_part'],
        ])->mapWithKeys(function (array $category) {
            $model = ItemCategory::updateOrCreate([
                'code' => $category['code'],
            ], [
                'name' => $category['name'],
                'type' => $category['type'],
                'description' => 'Kategori '.$category['name'].' untuk kebutuhan bengkel.',
                'is_active' => true,
            ]);

            return [$category['code'] => $model];
        });

        foreach ([
            ['SP-0001', 'Oli Mesin MPX', 'Honda', 'OLI', 42000, 55000, 32, 10],
            ['SP-0002', 'Oli Gardan', 'Federal', 'OLI', 15000, 25000, 18, 8],
            ['SP-0003', 'Busi NGK', 'NGK', 'MESIN', 18000, 30000, 45, 12],
            ['SP-0004', 'Kampas Rem Depan', 'Aspira', 'REM', 35000, 55000, 14, 6],
            ['SP-0005', 'Kampas Rem Belakang', 'Aspira', 'REM', 30000, 50000, 12, 6],
            ['SP-0006', 'V-Belt', 'Bando', 'CVT', 90000, 135000, 9, 4],
            ['SP-0007', 'Roller CVT', 'Yamaha', 'CVT', 45000, 70000, 16, 6],
            ['SP-0008', 'Filter Udara', 'Honda', 'MESIN', 28000, 45000, 20, 8],
            ['SP-0009', 'Aki Motor', 'GS Astra', 'KELISTRIKAN', 155000, 220000, 7, 3],
            ['SP-0010', 'Bohlam Lampu Depan', 'Philips', 'KELISTRIKAN', 22000, 35000, 24, 10],
            ['SP-0011', 'Ban Dalam', 'IRC', 'BAN', 26000, 40000, 28, 10],
            ['SP-0012', 'Bearing Roda', 'Koyo', 'BAN', 32000, 52000, 11, 5],
        ] as [$code, $name, $brand, $categoryCode, $purchasePrice, $sellingPrice, $stock, $minimumStock]) {
            SparePart::updateOrCreate([
                'code' => $code,
            ], [
                'item_category_id' => $categories[$categoryCode]->id,
                'name' => $name,
                'brand' => $brand,
                'unit' => 'pcs',
                'purchase_price' => $purchasePrice,
                'selling_price' => $sellingPrice,
                'current_stock' => $stock,
                'minimum_stock' => $minimumStock,
                'description' => 'Suku cadang '.$name.' untuk transaksi bengkel.',
                'is_active' => true,
            ]);
        }

        foreach ([
            ['SRV-0001', 'Servis Ringan', 45000, 45],
            ['SRV-0002', 'Servis Lengkap', 85000, 90],
            ['SRV-0003', 'Ganti Oli', 15000, 20],
            ['SRV-0004', 'Tune Up', 75000, 75],
            ['SRV-0005', 'Servis Rem', 40000, 40],
            ['SRV-0006', 'Ganti Ban', 30000, 30],
            ['SRV-0007', 'Servis CVT', 65000, 60],
            ['SRV-0008', 'Cek Kelistrikan', 50000, 45],
        ] as [$code, $name, $price, $duration]) {
            ServiceItem::updateOrCreate([
                'code' => $code,
            ], [
                'item_category_id' => $categories['SERVIS']->id,
                'name' => $name,
                'service_price' => $price,
                'estimated_duration' => $duration,
                'description' => 'Layanan '.$name.' bengkel Star Motor.',
                'is_active' => true,
            ]);
        }

        foreach ([
            ['CUS-0001', 'Rizky Pratama', '081234567801', 'Honda', 'Beat', 'B 1234 RZ'],
            ['CUS-0002', 'Dewi Lestari', '081234567802', 'Yamaha', 'Mio', 'B 2211 DL'],
            ['CUS-0003', 'Ari Saputra', '081234567803', 'Honda', 'Vario', 'B 9032 AS'],
            ['CUS-0004', 'Nanda Putri', '081234567804', 'Suzuki', 'Address', 'B 4810 NP'],
            ['CUS-0005', 'Bayu Nugroho', '081234567805', 'Yamaha', 'NMAX', 'B 7788 BN'],
            ['CUS-0006', 'Siti Aminah', '081234567806', 'Honda', 'Scoopy', 'B 6754 SA'],
            ['CUS-0007', 'Fajar Hidayat', '081234567807', 'Kawasaki', 'W175', 'B 9912 FH'],
            ['CUS-0008', 'Maya Sari', '081234567808', 'Honda', 'PCX', 'B 3381 MS'],
            ['CUS-0009', 'Ilham Ramadhan', '081234567809', 'Yamaha', 'Aerox', 'B 8120 IR'],
            ['CUS-0010', 'Putra Wijaya', '081234567810', 'Honda', 'Supra X', 'B 7012 PW'],
        ] as [$code, $name, $phone, $vehicleBrand, $vehicleType, $plateNumber]) {
            Customer::updateOrCreate([
                'code' => $code,
            ], [
                'name' => $name,
                'phone' => $phone,
                'address' => 'Jakarta dan sekitarnya',
                'vehicle_brand' => $vehicleBrand,
                'vehicle_type' => $vehicleType,
                'vehicle_plate_number' => $plateNumber,
                'notes' => 'Pelanggan bengkel Star Motor.',
                'is_active' => true,
            ]);
        }

        foreach ([
            ['MCH-0001', 'Joko Santoso', '081300000001', 'Servis umum'],
            ['MCH-0002', 'Agus Setiawan', '081300000002', 'Kelistrikan'],
            ['MCH-0003', 'Rudi Hartono', '081300000003', 'CVT dan transmisi'],
        ] as [$code, $name, $phone, $specialization]) {
            Mechanic::updateOrCreate([
                'code' => $code,
            ], [
                'name' => $name,
                'phone' => $phone,
                'specialization' => $specialization,
                'is_active' => true,
            ]);
        }
    }
}
