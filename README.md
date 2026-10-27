# Focus Room FISIP - UIN Syarif Hidayatullah Jakarta 🏛️

Sistem Pemesanan Ruangan Focus Room FISIP UIN Jakarta berbasis web dengan teknologi **QR Dinamis (Time-Based Refresh)** untuk mengeliminasi kecurangan presensi dan antrean manual.

---

## 🌟 Fitur Utama

1. **4 Focus Room FISIP**:
   - Focus Room 1 (Lantai 2 - Kapasitas 6 orang, Smart TV 55", Whiteboard, AC)
   - Focus Room 2 (Lantai 2 - Kapasitas 6 orang, Smart TV 55", Whiteboard, AC)
   - Focus Room 3 (Lantai 3 - Kapasitas 4 orang, Whiteboard Kaca, Port Charger, AC)
   - Focus Room 4 (Lantai 3 - Kapasitas 4 orang, Whiteboard Kaca, Port Charger, AC)

2. **Pembagian Slot Sesi Terjadwal**:
   - **Sesi Pagi 1**: 07:30 – 09:30 (Durasi 2 jam)
   - *Jeda Pembersihan & Persiapan*: 09:30 – 10:00 (30 menit)
   - **Sesi Pagi 2**: 10:00 – 12:00 (Durasi 2 jam)
   - *Jeda Ishoma*: 12:00 – 13:00 (60 menit)
   - **Sesi Siang**: 13:00 – 15:30 (Durasi 2 jam 30 menit)

3. **Mekanisme Anti-Kecurangan (Dynamic Rotating QR Code)**:
   - Kode QR di-generate menggunakan **HMAC-SHA256 time-windowing (30 detik)**.
   - Dilengkapi animasi progress bar countdown dan sinkronisasi detik live.
   - **Foto atau tangkapan layar (screenshot) yang dioper/disebarkan ke teman akan otomatis DITOLAK** oleh scanner verifikator karena token waktu sudah expired (>60 detik).
   - Kebijakan **1 booking aktif per mahasiswa** untuk pemerataan akses.

4. **Panel Scanner & Verifikator Admin**:
   - Scanner kamera live terintegrasi browser (tanpa perlu aplikasi tambahan).
   - Audio feedback (beep sukses / peringatan kecurangan).
   - Monitoring ketersediaan 4 ruangan secara real-time.
   - Log riwayat kehadiran & check-in mahasiswa.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 (App Router, Server Actions)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) + PostgreSQL ([Supabase](https://supabase.com/) / [Neon](https://neon.tech/))
- **QR Engine**: `qrcode` + `html5-qrcode` (kamera scanner) + Node `crypto` HMAC-SHA256
- **Deployment**: [Vercel](https://vercel.com/) (Free Tier)

---

## 🚀 Panduan Menjalankan di Lokal (Development)

Proyek ini telah dilengkapi **Dual-Mode Persistence**. Anda dapat langsung mengujinya di lokal tanpa harus menyalakan database server terlebih dahulu!

### 1. Jalankan Server Dev:
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 2. Akun Demo Cepat (Tersedia tombol 1-klik di halaman `/login`):
- **Mahasiswa**: NIM `11220910000001` (Ahmad Fauzi)
- **Petugas Verifikator**: ID `ADMIN_FISIP` (Petugas Verifikator FISIP)

---

## 🗄️ Menghubungkan ke PostgreSQL (Supabase / Neon)

Ketika ingin menghubungkan ke database cloud gratis:

1. Buat project baru di [Supabase](https://supabase.com) atau [Neon.tech](https://neon.tech).
2. Salin connection string PostgreSQL dan simpan di file `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"
   QR_SECRET_KEY="kunci-rahasia-keamanan-qr-anda"
   ```
3. Push skema ke database:
   ```bash
   npx prisma db push
   ```
4. Jalankan seeder untuk mengisi 4 Focus Room FISIP dan akun admin awal:
   ```bash
   npm run prisma:seed
   ```

---

## ☁️ Deploy ke Vercel (Gratis)

1. Push repository ini ke GitHub:
   ```bash
   git add .
   git commit -m "feat: initial focus room fisip app"
   git branch -M main
   git remote add origin <URL_REPO_GITHUB_ANDA>
   git push -u origin main
   ```
2. Buka [Vercel](https://vercel.com/) -> **Add New Project** -> Pilih repo GitHub ini.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: Connection string PostgreSQL dari Supabase/Neon.
   - `QR_SECRET_KEY`: String rahasia acak untuk menandatangani token QR dinamis.
4. Klik **Deploy**!

