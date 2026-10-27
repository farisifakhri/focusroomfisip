import NextLink from "next/link";
import { getRooms } from "@/lib/data";
import { getCurrentUser } from "@/actions/auth";
import {
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  Monitor,
  Zap,
  CheckCircle2,
  CalendarCheck,
  Building,
  Lock,
  FileSpreadsheet,
} from "lucide-react";

export default async function HomePage() {
  const rooms = await getRooms(true); // Tampilkan semua ruangan termasuk yang sedang terkunci/nonaktif
  const user = await getCurrentUser();

  return (
    <div className="space-y-12 pb-16 bg-stone-50">
      {/* Hero Section FISIP UIN */}
      <section className="bg-gradient-to-b from-fisip-950 via-fisip-900 to-fisip-800 text-white pt-16 pb-20 px-4 border-b-4 border-amber-500 shadow-sm">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-fisip-800/80 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            Fakultas Ilmu Sosial dan Ilmu Politik • UIN Jakarta
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Sistem Informasi Reservasi{" "}
            <span className="text-amber-300 underline decoration-amber-400/60 decoration-wavy underline-offset-8">
              Focus Room FISIP
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-200 text-sm md:text-base leading-relaxed">
            Fasilitas ruang belajar mandiri, riset, dan bimbingan akademik dengan presensi QR dinamis berbasis waktu untuk menjamin transparansi penggunaan ruangan di lingkungan FISIP.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NextLink
              href="/booking"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-fisip-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-fisip-950" />
              Isi Formulir Peminjaman
              <ArrowRight className="w-4 h-4 text-fisip-950" />
            </NextLink>

            {user ? (
              <NextLink
                href="/ticket"
                className="px-5 py-3.5 rounded-xl bg-fisip-800/90 hover:bg-fisip-700 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
              >
                E-Tiket Presensi QR Saya
              </NextLink>
            ) : (
              <NextLink
                href="/login"
                className="px-5 py-3.5 rounded-xl bg-fisip-800/90 hover:bg-fisip-700 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
              >
                Masuk Pemesan (Mahasiswa / Dosen)
              </NextLink>
            )}
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 text-left">
            <div className="p-5 rounded-2xl bg-fisip-950/60 border border-fisip-700/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-fisip-800 border border-fisip-700 text-amber-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">QR Dinamis Berputar Tiap 30 Detik</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Mencegah kecurangan presensi. Foto maupun screenshot tiket otomatis ditolak oleh scanner petugas di lokasi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-fisip-950/60 border border-fisip-700/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-fisip-800 border border-fisip-700 text-amber-300 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Penjadwalan 3 Sesi Terstruktur</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Terbagi Sesi Pagi 1 (07.30-09.30), Sesi Pagi 2 (10.00-12.00), dan Sesi Siang (13.00-15.30) dengan jeda pembersihan 30 menit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-fisip-950/60 border border-fisip-700/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-fisip-800 border border-fisip-700 text-amber-300 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Pencatatan Data Lengkap</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Pencatatan transparan penanggung jawab, NIM/NIP, email, WhatsApp, prodi, keperluan, hingga jumlah peserta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Room Catalog Section */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b-2 border-stone-200 pb-4">
          <div>
            <span className="text-xs font-bold text-fisip-800 uppercase tracking-wider">
              Katalog Fasilitas Ruangan
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              4 Ruang Focus Room FISIP
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Daftar ruangan, kapasitas maksimal peserta, dan kelengkapan fasilitas akademik
            </p>
          </div>
          <NextLink
            href="/booking"
            className="text-xs font-bold text-fisip-800 hover:text-fisip-900 flex items-center gap-1"
          >
            Buka Formulir Peminjaman <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const isFocusRoom1 = room.id === "room-1";

            return (
              <div
                key={room.id}
                className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden ${
                  !room.isActive
                    ? "bg-stone-100 border-stone-300 opacity-90"
                    : "bg-white border-stone-200 hover:border-fisip-700 shadow-sm"
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    {room.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Terbuka untuk Reservasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        Khusus Dosen / Rapat (Nonaktif)
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-stone-400 uppercase">
                      {room.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900">{room.name}</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{room.description}</p>
                  </div>

                  {/* Fasilitas aktual */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Fasilitas & Kapasitas:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <div className="flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg font-medium">
                        <Users className="w-3.5 h-3.5 text-fisip-700" />
                        Kapasitas {isFocusRoom1 ? "> 15 Orang (Hingga 20)" : `Maksimal ${room.capacity} Orang`}
                      </div>

                      {isFocusRoom1 && (
                        <div className="flex items-center gap-1 bg-fisip-50 text-fisip-900 px-2.5 py-1 rounded-lg font-bold border border-fisip-200">
                          <Monitor className="w-3.5 h-3.5 text-fisip-700" />
                          2 Unit Komputer (PC Desktop)
                        </div>
                      )}

                      <div className="flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        Port Charger Meja
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Sesi Pagi (2 Jam) / Sesi Siang (2.5 Jam)
                  </span>

                  {room.isActive ? (
                    <NextLink
                      href={`/booking?room=${room.id}`}
                      className="px-4 py-2 bg-fisip-800 hover:bg-fisip-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Pilih Ruangan Ini
                    </NextLink>
                  ) : (
                    <span className="text-xs font-bold text-stone-400 italic">
                      Dikelola oleh Admin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SOP & Tata Tertib Presensi */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white border-2 border-stone-300 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-3">
            <CheckCircle2 className="w-5 h-5 text-fisip-800" />
            <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
              Tata Tertib & Ketentuan Peminjaman Ruang FISIP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">1. Kehadiran Fisik & Verifikasi QR Live</strong>
              <p>
                Penanggung jawab wajib menunjukkan QR Code secara langsung dari layar ponsel kepada petugas verifikator saat memasuki ruangan. Foto cetak atau tangkapan layar (screenshot) dinyatakan tidak sah.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">2. Penanggung Jawab Terdaftar</strong>
              <p>
                Data nama lengkap, NIM/NIP, email, WhatsApp, dan prodi wajib diisi secara valid sebagai penanggung jawab fasilitas selama durasi peminjaman.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">3. Batas Toleransi Check-In & Expired</strong>
              <p>
                Presensi dibuka 15 menit sebelum sesi dimulai. Apabila tidak dipindai hingga batas akhir sesi, status reservasi otomatis berubah menjadi <strong>EXPIRED</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">4. Kebersihan & Jeda Antar Sesi</strong>
              <p>
                Pengguna diwajibkan mengosongkan ruangan 5 menit sebelum sesi berakhir untuk memberikan waktu jeda 30 menit bagi petugas kebersihan FISIP.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
