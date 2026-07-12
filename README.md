# Workshop Insight

Workshop Insight adalah aplikasi web untuk membantu pengelolaan transaksi bengkel, spare part, layanan servis, stok, dashboard, laporan, analisis pola transaksi, dan rekomendasi paket layanan berdasarkan data transaksi.

## Preview

### Login

![Halaman login Workshop Insight](docs/screenshots/01-login-page.png)

### Dashboard

![Dashboard admin](docs/screenshots/02-dashboard-admin.png)

### Manajemen Transaksi

![Input transaksi bengkel](docs/screenshots/04-input-transaksi.png)

### Manajemen Stok

![Stok suku cadang](docs/screenshots/06-stok-suku-cadang.png)

### Rekomendasi Paket

![Rekomendasi paket layanan](docs/screenshots/10-rekomendasi-paket.png)

### Laporan

![Laporan transaksi owner](docs/screenshots/11-laporan-transaksi.png)

## Key Features

### Admin

- Login sebagai admin.
- Mengelola data spare part dan layanan servis.
- Mengelola data pelanggan, mekanik, dan kategori item.
- Mencatat dan melihat detail transaksi bengkel.
- Memantau stok serta riwayat mutasi stok.
- Melihat laporan transaksi dan stok.

### Owner

- Login sebagai owner.
- Melihat dashboard bisnis bengkel.
- Menjalankan analisis pola transaksi.
- Melihat kombinasi item yang sering muncul.
- Melihat rekomendasi paket layanan.
- Melihat laporan transaksi, stok, dan hasil analisis.

## Pattern Analysis Feature

Sistem membaca transaksi bengkel yang sudah selesai dan memiliki item transaksi berupa spare part atau layanan servis. Data tersebut digunakan untuk mencari kombinasi item yang sering muncul bersama.

Hasil analisis menampilkan metrik support, confidence, dan lift. Owner dapat memanfaatkan pola kombinasi transaksi tersebut untuk memahami kebiasaan pembelian pelanggan dan menilai peluang pembuatan paket layanan.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel API |
| Frontend | Next.js |
| Language | TypeScript, PHP |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Authentication | Laravel Sanctum |
| Analysis Service | Flask Service |
| Data Processing | Python, Pandas, mlxtend |

## Project Structure

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

## Database Overview

Tabel inti yang digunakan secara konseptual:

- `users`
- `item_categories`
- `spare_parts`
- `service_items`
- `customers`
- `mechanics`
- `transactions`
- `transaction_items`
- `stock_movements`
- `analysis_runs`
- `analysis_itemsets`
- `analysis_rules`

## Main Workflow

### Admin Flow

`Master Data → Transaction Entry → Stock Update → Reports`

### Owner Flow

`Dashboard → Run Pattern Analysis → Review Analysis Result → Review Package Recommendation → Reports`

## Installation

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Analysis Service Setup

Dari root project, masuk ke satu-satunya folder service Python:

```powershell
Set-Location (Get-ChildItem -Directory *-service | Select-Object -First 1 -ExpandProperty FullName)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

## Environment Example

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

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@workshop.test` | `password` |
| Owner | `owner@workshop.test` | `password` |

## Validation Commands

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

## Future Improvements

- Export laporan PDF dan Excel.
- Advanced dashboard analytics.
- Dukungan bengkel multi-cabang.
- Manajemen campaign paket layanan.
- Integrasi notifikasi.
- Filter transaksi yang lebih fleksibel untuk analisis.

## Project Status

**Completed / Portfolio Ready**
