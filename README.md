<p align="center">
  <img src="public/tepatsetor-logo.svg" width="80" alt="TepatSetor Logo" />
</p>

<h1 align="center">TepatSetor</h1>
<p align="center">
  <strong>Sistem Pelaporan Setoran Kas Pribadi</strong><br/>
  Hitung, laporkan, dan kelola setoran tunai Anda secara efisien dan akurat.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js" />
  <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="MIT License" />
</p>

---

## 📋 Tentang TepatSetor

**TepatSetor** adalah aplikasi web berbasis Laravel + React (Inertia.js) yang dirancang khusus untuk membantu bendahara dan pengelola keuangan mencatat, menghitung, dan melaporkan setoran kas tunai secara terstruktur dan profesional.

### ✨ Fitur Utama

- **Kalkulator Setoran Kas** — Hitung total setoran berdasarkan pecahan uang kertas Indonesia secara otomatis dan real-time.
- **Manajemen Rekening Tujuan** — Daftarkan rekening bank tujuan setoran langsung dari profil pengguna.
- **Laporan PDF Profesional** — Generate laporan setoran dalam format PDF lengkap dengan bukti transfer dan rincian pecahan uang.
- **Upload Bukti Setoran** — Upload foto/scan bukti transfer (gambar atau PDF) dengan kompresi otomatis.
- **Berbagi via WhatsApp** — Kirim ringkasan setoran langsung ke WhatsApp dengan satu klik.
- **Dual Tema** — Tampilan mode Gelap dan Terang yang bisa dipilih pengguna.
- **Desain Responsif** — Tampilan optimal di desktop (sidebar) dan mobile (fixed bottom navigation).
- **Multi-device** — Akun dapat digunakan dari beberapa perangkat secara bersamaan.

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| Backend Framework | Laravel 13.x |
| Frontend | React 18 + TypeScript |
| SPA Bridge | Inertia.js 2.x |
| Styling | Tailwind CSS 3.x |
| UI Components | Headless UI, Lucide React |
| PDF Generator | DomPDF (barryvdh/laravel-dompdf) |
| Image Processing | Intervention Image 4.x |
| Authentication | Laravel Breeze |
| Database | MySQL |

---

## 🚀 Instalasi Lokal

### Prasyarat
- PHP >= 8.3
- Composer
- Node.js >= 20
- MySQL

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/username/tepatsetor-app.git
cd tepatsetor-app

# 2. Install dependencies
composer install
npm install

# 3. Konfigurasi environment
cp .env.example .env
php artisan key:generate

# 4. Konfigurasi database di .env
# DB_HOST=127.0.0.1
# DB_DATABASE=tepatsetor
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Jalankan migrasi
php artisan migrate

# 6. Buat symlink storage
php artisan storage:link

# 7. Build frontend assets
npm run build

# 8. Jalankan server lokal
php artisan serve
```

Akses aplikasi di: `http://localhost:8000`

---

## 🌐 Deployment ke cPanel

Proyek ini dilengkapi CI/CD otomatis via **GitHub Actions** yang akan berjalan setiap kali ada push ke branch `main`.

### Struktur File di Server cPanel

```
~/tepatstore/              ← root subdomain (semua file diupload ke sini)
├── .htaccess              ← redirect semua request ke public/  ✅
├── public/                ← web entry point Laravel
│   ├── index.php
│   ├── .htaccess
│   └── build/             ← hasil npm run build (JS/CSS assets)
├── app/
├── bootstrap/
├── config/
├── resources/
├── routes/
├── storage/
├── vendor/                ← diinstall langsung di server via SSH
└── ...
```

> **Cara kerjanya:** `.htaccess` di root folder me-redirect semua request browser ke `public/`, sehingga Laravel berjalan normal meskipun semua file ada di satu folder.

### GitHub Secrets yang Harus Dikonfigurasi

Tambahkan secrets berikut di **GitHub → Settings → Secrets and Variables → Actions**:

| Secret | Keterangan |
|---|---|
| `FTP_SERVER` | Hostname/IP FTP server cPanel |
| `FTP_USERNAME` | Username FTP cPanel |
| `FTP_PASSWORD` | Password FTP cPanel |
| `FTP_PORT` | Port FTP (default: `21`) |
| `FTP_SERVER_DIR` | Biarkan `/` — FTP root cPanel sudah di folder subdomain |
| `SSH_HOST` | Hostname SSH cPanel |
| `SSH_USERNAME` | Username SSH cPanel |
| `SSH_PRIVATE_KEY` | Isi lengkap private key SSH (-----BEGIN ... KEY-----) |
| `SSH_PASSPHRASE` | Passphrase private key SSH (kosongkan jika tidak ada) |
| `SSH_PORT` | Port SSH (default: `22`) |
| `APP_PATH` | Path app di server: `~/tepatstore` |


### Proses CI/CD

1. ✅ Checkout kode dari GitHub
2. ✅ Install Composer dependencies (production only, tanpa dev)
3. ✅ Install NPM & build frontend assets (`npm run build`)
4. ✅ Exclude file non-produksi (`node_modules`, `tests`, `.env`, source JS/CSS, dsb.)
5. ✅ Upload file ke cPanel via FTP
6. ✅ Jalankan artisan commands via SSH (`migrate`, `config:cache`, `route:cache`, `view:cache`, `storage:link`)

### Konfigurasi `.env` di Server

Setelah deploy pertama, buat file `.env` di root direktori server:

```env
APP_NAME=TepatSetor
APP_ENV=production
APP_KEY=           # Akan di-generate ulang
APP_DEBUG=false
APP_URL=https://subdomain.domain.anda

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database

FILESYSTEM_DISK=local
```

Lalu jalankan: `php artisan key:generate`

---

## 📁 Struktur Folder Penting

```
tepatsetor-app/
├── app/
│   ├── Http/Controllers/
│   │   ├── DepositController.php    # Logika setoran kas
│   │   └── BankAccountController.php # Manajemen rekening
│   └── Models/
│       ├── Deposit.php
│       ├── DepositDetail.php
│       └── BankAccount.php
├── resources/
│   ├── js/
│   │   ├── Pages/                   # Halaman React (Inertia)
│   │   ├── Components/              # Komponen reusable
│   │   └── Layouts/                 # Layout utama & guest
│   └── views/pdf/                   # Template laporan PDF
├── storage/app/private/deposits/    # Bukti setoran (private)
├── .github/workflows/deploy.yml     # CI/CD workflow
└── .env.example                     # Template environment
```

---

## 🔒 Keamanan

- File bukti setoran disimpan di direktori **private** (`storage/app/private/`), tidak bisa diakses langsung via URL publik.
- Akses file bukti setoran dilindungi middleware autentikasi.
- Semua credentials disimpan sebagai **GitHub Secrets** dan tidak di-commit ke repository.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">Dibuat dengan ❤️ menggunakan Laravel & React</p>
