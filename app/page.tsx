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
  QrCode,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const rooms = await getRooms(true); // Tampilkan semua ruangan termasuk yang sedang terkunci/nonaktif
  const user = await getCurrentUser();

  return (
    <div className="space-y-10 pb-16 bg-stone-50">
      {/* Hero Section Resmi FISIP UIN Jakarta */}
      <section className="bg-gradient-to-b from-fisip-950 via-fisip-900 to-fisip-800 text-white pt-14 pb-16 px-4 border-b-4 border-amber-500 shadow-sm">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-fisip-950/80 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            Fakultas Ilmu Sosial dan Ilmu Politik   UIN Syarif Hidayatullah Jakarta
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Sistem Informasi Reservasi{" "}
            <span className="text-amber-300 underline decoration-amber-400/60 underline-offset-8">
              Focus Room FISIP
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-200 text-xs md:text-sm leading-relaxed">
            Fasilitas ruang diskusi fokus, riset kolaboratif, dan bimbingan akademik dengan presensi QR dinamis berbasis waktu (30 detik) untuk menjamin ketertiban dan akuntabilitas pemakaian ruang di lingkungan FISIP.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <NextLink
              href="/booking"
              className="px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-fisip-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-fisip-950" />
              Isi Formulir Peminjaman
              <ArrowRight className="w-4 h-4 text-fisip-950" />
            </NextLink>

            {user ? (
              <NextLink
                href="/ticket"
                className="px-5 py-3.5 rounded-lg bg-fisip-800/90 hover:bg-fisip-700 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                E-Tiket Presensi QR Saya
              </NextLink>
            ) : (
              <NextLink
                href="/login"
                className="px-5 py-3.5 rounded-lg bg-fisip-800/90 hover:bg-fisip-700 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
              >
                Masuk Pemesan (Mahasiswa / Dosen)
              </NextLink>
            )}
          </div>

          {/* 3 Pilar Utama Sistem */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
            <div className="p-5 rounded-xl bg-fisip-950/80 border border-fisip-700">
              <div className="w-9 h-9 rounded-lg bg-fisip-800 text-amber-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">QR Dinamis Tiap 30 Detik</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Mencegah kecurangan presensi. Foto maupun screenshot tiket otomatis ditolak oleh pemindai petugas di lokasi.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-fisip-950/80 border border-fisip-700">
              <div className="w-9 h-9 rounded-lg bg-fisip-800 text-amber-300 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">3 Sesi Terjadwal Teratur</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Sesi Pagi 1 (07.30-09.30), Sesi Pagi 2 (10.00-12.00), dan Sesi Siang (13.00-15.30) dengan jeda pembersihan 30 menit.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-fisip-950/80 border border-fisip-700">
              <div className="w-9 h-9 rounded-lg bg-fisip-800 text-amber-300 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Pelaporan Data Transparan</h3>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                Seluruh peminjaman tercatat dalam pangkalan data terpusat fakultas dengan ekspor rekapitulasi berkala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Katalog 4 Ruangan Focus Room */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="border-b-2 border-stone-200 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-fisip-800 uppercase tracking-wider mb-1">
              Fasilitas Akademik
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Katalog Ruangan Focus Room FISIP
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Tersedia 4 unit Focus Room dengan kapasitas dan peruntukan yang disesuaikan kebutuhan sivitas akademika.
            </p>
          </div>
          <NextLink
            href="/booking"
            className="text-xs font-bold text-fisip-800 hover:text-fisip-900 inline-flex items-center gap-1 shrink-0"
          >
            Lihat Jadwal Tersedia <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rooms.map((room) => {
            const isFocusRoom1 = room.id === "room-1";

            return (
              <div
                key={room.id}
                className={`rounded-xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-sm ${
                  room.isActive
                    ? "bg-white border-stone-200 hover:border-fisip-700"
                    : "bg-stone-100/90 border-stone-300"
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {room.id.toUpperCase()}
                    </span>
                    {room.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Tersedia untuk Publik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <Lock className="w-3 h-3 text-amber-800" />
                        Khusus Dosen / Izin Admin
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900 tracking-tight">{room.name}</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{room.description}</p>
                  </div>

                  {/* Fasilitas aktual */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Fasilitas & Kapasitas:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <div className="flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-medium">
                        <Users className="w-3.5 h-3.5 text-fisip-700" />
                        Kapasitas {isFocusRoom1 ? "> 15 Orang (Hingga 20)" : `Maksimal ${room.capacity} Orang`}
                      </div>

                      {isFocusRoom1 && (
                        <div className="flex items-center gap-1 bg-fisip-50 text-fisip-900 px-2.5 py-1 rounded-md font-bold border border-fisip-200">
                          <Monitor className="w-3.5 h-3.5 text-fisip-700" />
                          2 Unit Komputer (PC Desktop)
                        </div>
                      )}

                      <div className="flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md font-medium">
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
                      className="px-4 py-2 bg-fisip-800 hover:bg-fisip-900 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
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
        <div className="bg-white border border-stone-300 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-3">
            <CheckCircle2 className="w-5 h-5 text-fisip-800" />
            <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
              Tata Tertib & Ketentuan Peminjaman Ruang FISIP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700 leading-relaxed">
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">1. Kehadiran Fisik & Verifikasi QR Live</strong>
              <p>
                Penanggung jawab wajib menunjukkan QR Code secara langsung dari layar ponsel kepada petugas verifikator saat memasuki ruangan. Foto cetak atau tangkapan layar (screenshot) dinyatakan tidak sah.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">2. Penanggung Jawab Terdaftar</strong>
              <p>
                Data nama lengkap, NIM/NIP, email, WhatsApp, dan prodi wajib diisi secara valid sebagai penanggung jawab fasilitas selama durasi peminjaman.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <strong className="block text-stone-900 font-bold">3. Batas Toleransi Check-In & Expired</strong>
              <p>
                Presensi dibuka 15 menit sebelum sesi dimulai. Apabila tidak dipindai hingga batas akhir sesi, status reservasi otomatis berubah menjadi <strong>EXPIRED</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
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
