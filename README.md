# Workshop Insight

Workshop Insight adalah aplikasi web untuk membantu pengelolaan transaksi bengkel, spare part, layanan servis, stok, dashboard, laporan, analisis pola transaksi, dan rekomendasi paket layanan berdasarkan data transaksi.

Aplikasi ini dirancang untuk membantu operasional bengkel agar data transaksi, item layanan, spare part, stok, laporan, dan hasil analisis dapat dikelola secara lebih terstruktur.

## Ringkasan Sistem

Workshop Insight mendukung alur operasional bengkel mulai dari pengelolaan master data, pencatatan transaksi, pembaruan stok, dan pelaporan hingga analisis pola transaksi serta rekomendasi paket layanan.

Admin berfokus pada pengelolaan data operasional sehari-hari. Owner berfokus pada pemantauan dashboard, laporan, hasil analisis, rekomendasi paket layanan, dan insight bisnis yang diperoleh dari data transaksi.

## Tech Stack

### Backend

- Laravel API
- Laravel Sanctum
- PostgreSQL
- REST API

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Analysis Service

- Flask
- Python
- Pandas
- mlxtend

### Tools

- Composer
- NPM
- Git

## Fitur Utama

### Auth & Role

- Login sebagai Admin dan Owner.
- Pembatasan menu dan tindakan berdasarkan role pengguna.

### Master Data

- Pengelolaan spare part.
- Pengelolaan layanan servis.
- Pengelolaan pelanggan, mekanik, dan kategori item.

### Transaction Management

- Pencatatan transaksi bengkel.
- Peninjauan detail transaksi.

### Stock Management

- Pembaruan stok berdasarkan transaksi.
- Pemantauan stok dan mutasi stok.

### Pattern Analysis

- Analisis pola transaksi bengkel yang telah selesai.
- Peninjauan kombinasi item yang sering muncul bersama.

### Service Package Recommendation

- Rekomendasi paket layanan berdasarkan hasil analisis pola transaksi.

### Reports

- Laporan transaksi.
- Laporan stok.
- Laporan hasil analisis.

### UI/UX

- Dashboard bisnis bengkel.
- Tampilan pengelolaan data, transaksi, stok, analisis, rekomendasi, dan laporan yang disesuaikan dengan role pengguna.

## Role & Akses

Workshop Insight memiliki dua role utama. Tindakan yang dapat dilakukan dan menu yang ditampilkan mengikuti tanggung jawab masing-masing role.

### Admin

Admin bertanggung jawab mengelola data operasional bengkel dan memiliki akses ke:

- Dashboard
- Spare Part
- Layanan Servis
- Pelanggan
- Mekanik
- Kategori Item
- Transaksi Bengkel
- Stok dan Mutasi Stok
- Laporan Transaksi
- Laporan Stok

### Owner

Owner bertanggung jawab memantau performa bisnis dan meninjau hasil pengolahan data. Owner memiliki akses ke:

- Dashboard
- Analisis Pola Transaksi
- Hasil Analisis
- Rekomendasi Paket Layanan
- Laporan Transaksi
- Laporan Stok
- Laporan Hasil Analisis

## Struktur Project

```text
workshop-insight/
├── backend/
├── frontend/
├── analysis-service/
├── docs/
│   └── screenshots/
└── README.md
```

Nama layanan di atas bersifat konseptual. Nama folder internal dipertahankan untuk kompatibilitas project.

## Screenshots

Berikut beberapa tampilan utama Workshop Insight yang menggambarkan proses autentikasi, pengelolaan transaksi dan stok, pemantauan dashboard, rekomendasi paket layanan, serta laporan.

### Login

![Halaman login Workshop Insight](docs/screenshots/01-login-page.png)

### Dashboard Admin

![Dashboard admin](docs/screenshots/02-dashboard-admin.png)

### Input Transaksi

![Input transaksi bengkel](docs/screenshots/04-input-transaksi.png)

### Stok Spare Part

![Stok suku cadang](docs/screenshots/06-stok-suku-cadang.png)

### Rekomendasi Paket Layanan

![Rekomendasi paket layanan](docs/screenshots/10-rekomendasi-paket.png)

### Laporan Transaksi

![Laporan transaksi owner](docs/screenshots/11-laporan-transaksi.png)

## Persiapan Environment

Pastikan perangkat pengembangan telah memiliki perangkat lunak berikut:

- PHP
- Composer
- Node.js
- npm
- Python
- pip
- PostgreSQL
- Git

Siapkan database PostgreSQL untuk aplikasi, lalu jalankan backend, frontend, dan analysis service pada terminal terpisah.

## Setup Backend

Dari root project, jalankan:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

Jika menggunakan Windows PowerShell dan perintah `cp` tidak tersedia, salin file environment dengan:

```powershell
copy .env.example .env
```

## Setup Frontend

Dari root project, jalankan:

```bash
cd frontend
npm install
npm run dev
```

## Setup Analysis Service

Dari root project, gunakan Windows PowerShell untuk masuk ke folder service Python, membuat virtual environment, memasang dependensi, dan menjalankan service:

```powershell
Set-Location (Get-ChildItem -Directory *-service | Select-Object -First 1 -ExpandProperty FullName)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

## Environment Example

Sesuaikan kredensial database dan alamat service dengan environment lokal.

### Backend `.env`

```env
APP_NAME="Workshop Insight"
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=workshop_insight
DB_USERNAME=postgres
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
PATTERN_ANALYSIS_SERVICE_URL=http://127.0.0.1:5002
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_APP_NAME="Workshop Insight"
```

## Akun Demo

Akun berikut tersedia setelah proses seeding:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@workshop.test` | `password` |
| Owner | `owner@workshop.test` | `password` |

## Alur Penggunaan Sistem

1. Login menggunakan akun demo.
2. Admin mengelola master data seperti spare part, layanan servis, pelanggan, mekanik, dan kategori item.
3. Admin mencatat transaksi bengkel.
4. Sistem memperbarui stok dan mutasi stok.
5. Admin atau Owner melihat laporan transaksi dan stok.
6. Owner menjalankan analisis pola transaksi.
7. Sistem menampilkan kombinasi item yang sering muncul.
8. Sistem menampilkan rekomendasi paket layanan.
9. Owner meninjau dashboard, laporan, hasil analisis, dan rekomendasi.

## Analisis Pola Transaksi

Sistem membaca transaksi bengkel yang telah selesai dan berisi spare part dan/atau layanan servis. Data tersebut kemudian dianalisis untuk menemukan kombinasi item yang sering muncul secara bersamaan.

Hasil analisis menggunakan tiga metrik utama:

- **Support** menunjukkan seberapa sering suatu item atau kombinasi item muncul dalam seluruh transaksi yang dianalisis.
- **Confidence** menunjukkan kemungkinan kemunculan item tujuan ketika item awal terdapat dalam transaksi.
- **Lift** menunjukkan kekuatan hubungan antaritem dibandingkan dengan kemunculan keduanya secara independen.

Hasil analisis dapat digunakan sebagai bahan pendukung untuk menyusun rekomendasi paket layanan, memahami pola transaksi pelanggan, dan membantu pengambilan keputusan bisnis. Hasil tersebut tetap perlu ditinjau bersama konteks operasional bengkel.

## Validasi Build

### Backend

```bash
php artisan optimize:clear
php artisan route:list
```

### Frontend

```bash
npm run lint
npm run build
```

### Analysis Service

```bash
python app.py
```

## Project Status

Workshop Insight telah diselesaikan sebagai sistem manajemen bengkel berbasis web. Sistem mencakup pengelolaan transaksi, pengelolaan stok, pelaporan, analisis pola transaksi, dan rekomendasi paket layanan.

Sistem masih dapat dikembangkan lebih lanjut melalui grafik dashboard lanjutan, ekspor laporan, audit log, fitur notifikasi, permission yang lebih terperinci, pengujian otomatis, konfigurasi deployment, dan penyempurnaan UI/UX.

## Catatan Pengembangan Lanjutan

- Export laporan ke Excel/PDF.
- Grafik dashboard yang lebih lengkap.
- Audit log aktivitas pengguna.
- Permission yang lebih detail.
- Unit test dan integration test.
- Deployment setup.
- Optimasi analysis service.
- Peningkatan UI/UX pada halaman analisis dan laporan.
