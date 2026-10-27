import NextLink from "next/link";
import { getRooms } from "@/lib/data";
import { getCurrentUser } from "@/actions/auth";
import { TIME_SLOTS } from "@/lib/slots";
import {
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Tv,
  Wifi,
  Zap,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

export default async function HomePage() {
  const rooms = await getRooms();
  const user = await getCurrentUser();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-14 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Portal Resmi Pemesanan Focus Room FISIP UIN Jakarta
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Ruang Diskusi & Belajar Nyaman,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Bebas Antrean & Transparan
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Pesan 4 Focus Room FISIP dengan verifikasi QR dinamis real-time. Tidak ada lagi kecurangan foto barcode atau slot rebutan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NextLink
              href="/booking"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <CalendarCheck className="w-4 h-4" />
              Pesan Ruangan Sekarang
              <ArrowRight className="w-4 h-4" />
            </NextLink>

            {user ? (
              <NextLink
                href="/ticket"
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all"
              >
                Lihat Tiket QR Saya
              </NextLink>
            ) : (
              <NextLink
                href="/login"
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all"
              >
                Masuk Mahasiswa / Verifikator
              </NextLink>
            )}
          </div>

          {/* Quick Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">QR Dinamis Anti-Kecurangan</h3>
              <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                QR berubah otomatis tiap 30 detik. Foto dan screenshot lama otomatis ditolak scanner verifikator.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">3 Slot Sesi Terjadwal</h3>
              <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                Tersedia Sesi Pagi 1 (07.30-09.30), Sesi Pagi 2 (10.00-12.00), dan Sesi Siang (13.00-15.30) dengan jeda pembersihan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">1 Booking Aktif / Mahasiswa</h3>
              <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                Mencegah penimbunan slot ruangan. Setiap mahasiswa berkesempatan adil memanfaatkan fasilitas FISIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Room Catalog Section */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Katalog 4 Focus Room FISIP</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Pilihan ruang diskusi interaktif dengan fasilitas lengkap di Kampus FISIP UIN Jakarta
            </p>
          </div>
          <NextLink
            href="/booking"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Cek Ketersediaan Hari Ini <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room, idx) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Aktif & Siap Dipesan
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">#RUANG-0{idx + 1}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{room.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Kapasitas {room.capacity} Mahasiswa
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <Tv className="w-3.5 h-3.5 text-slate-500" />
                    Smart TV / Monitor
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <Wifi className="w-3.5 h-3.5 text-slate-500" />
                    Wi-Fi Kampus
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    Port Charger
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Durasi: 2 - 2.5 Jam per Sesi</span>
                <NextLink
                  href={`/booking?room=${room.id}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                >
                  Pilih Ruang Ini
                </NextLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Guidelines Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Ketentuan & Prosedur Presensi Focus Room FISIP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-900 leading-relaxed">
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <strong className="block text-slate-900 font-semibold">1. Hadir Fisik & Scan Langsung</strong>
              <p>
                Tunjukkan QR Code langsung melalui browser HP Anda ke petugas verifikator saat memasuki ruangan. Foto/screenshot tidak dapat diverifikasi.
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <strong className="block text-slate-900 font-semibold">2. Batas Toleransi Check-In</strong>
              <p>
                Check-in dibuka 15 menit sebelum jam sesi dimulai. Jika tidak dipindai hingga batas akhir sesi, tiket otomatis berstatus <strong>EXPIRED</strong>.
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <strong className="block text-slate-900 font-semibold">3. Jeda Pembersihan Ruangan (30 Menit)</strong>
              <p>
                Harap meninggalkan ruangan tepat waktu agar petugas kebersihan dapat mensterilkan dan merapikan ruangan untuk sesi berikutnya.
              </p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <strong className="block text-slate-900 font-semibold">4. Kebijakan 1 Booking Aktif</strong>
              <p>
                Mahasiswa hanya dapat memiliki 1 jadwal booking aktif dalam satu waktu untuk memberikan kesempatan merata kepada seluruh mahasiswa FISIP.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
