# Server ChatLeADS Website Manajemen Chatbot – Backend (MERN Stack)

Ini adalah bagian backend dari Website Manajemen Chatbot - ChatLeADS yang dibangun menggunakan **MERN Stack** (MongoDB, Express.js, React, Node.js).

## Persiapan Awal

### 1. Clone Repository

```bash
git clone <url-repo>
cd server
```

### 2. Install Dependencies

Pastikan kamu sudah menginstall Node.js dan npm, lalu jalankan:

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di direktori `server/` dan isi dengan variabel berikut:

```env
# MongoDB
MONGO_LOCAL_URL=mongodb://localhost:27017/ChatLeADS
MONGO_ATLAS_URL=

# Cloudinary (untuk upload gambar/media)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Token JWT
ACTIVATION_TOKEN=
REFRESH_TOKEN=
ACCESS_TOKEN=

# Google OAuth
G_CLIENT_ID=
G_CLIENT_SECRET=
G_REFRESH_TOKEN=

# Email Admin
ADMIN_EMAIL=
```

> Catatan:
>
> * Gunakan `MONGO_LOCAL_URL` saat di lokal development.
> * Gunakan `MONGO_ATLAS_URL` saat di deployment (hosting MongoDB di Atlas).

## Menjalankan Server

Untuk development (otomatis restart saat ada perubahan):

```bash
npm run dev
```

Atau, untuk menjalankan satu kali:

```bash
node server.js
```

Secara default server berjalan di [http://localhost:8000](http://localhost:8000)

## Fitur Utama

* Autentikasi dan otorisasi JWT
* Upload gambar ke Cloudinary
* Dukungan Google OAuth
* Manajemen pengguna dan admin
* Terintegrasi dengan frontend React dan chatbot Rasa

## Catatan

* Jangan lupa menjaga keamanan file `.env`. Jangan upload ke repository publik.
* Pastikan kamu sudah membuat akun Cloudinary dan Google Developer Console untuk mendapatkan API key dan token yang dibutuhkan.