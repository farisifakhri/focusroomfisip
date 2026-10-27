"use client";

import React, { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { BookingRecord, RoomRecord } from "@/lib/data";
import { toggleRoomStatusAction, adminManualCheckIn } from "@/actions/booking";
import { useRouter } from "next/navigation";
import {
  Shield,
  Camera,
  ListOrdered,
  Building,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle,
  Lock,
  Unlock,
  AlertCircle,
  Monitor,
  Zap,
  Users,
} from "lucide-react";

interface AdminClientProps {
  rooms: RoomRecord[];
  allBookings: BookingRecord[];
}

export default function AdminClient({ rooms: initialRooms, allBookings: initialBookings }: AdminClientProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomRecord[]>(initialRooms);
  const [allBookings, setAllBookings] = useState<BookingRecord[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<"table" | "scanner" | "rooms">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roomFilter, setRoomFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Sinkronkan state jika props diperbarui dari server
  React.useEffect(() => {
    setRooms(initialRooms);
    setAllBookings(initialBookings);
  }, [initialRooms, initialBookings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleToggleRoom = async (roomId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    const confirm = window.confirm(
      nextState
        ? "Apakah Anda ingin MENGAKTIFKAN ruangan ini untuk pemesanan umum?"
        : "Apakah Anda ingin MENONAKTIFKAN / MENGUNCI ruangan ini khusus kegiatan Dosen/Fakultas?"
    );
    if (!confirm) return;

    // Optimistic update
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isActive: nextState } : r))
    );

    const res = await toggleRoomStatusAction(roomId, nextState);
    if (res.success) {
      setActionMessage(`Status ${roomId} berhasil diperbarui menjadi ${nextState ? "AKTIF" : "NONAKTIF"}.`);
      router.refresh();
    } else {
      // Revert if failed
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, isActive: currentActive } : r))
      );
      alert(res.error || "Gagal memperbarui status ruangan.");
    }
  };

  const handleManualCheckIn = async (bookingId: string, name: string) => {
    const confirm = window.confirm(
      `Verifikasi check-in manual untuk pemesan: ${name}? Status akan diubah menjadi TERVERIFIKASI HADIR (USED).`
    );
    if (!confirm) return;

    // Optimistic update
    setAllBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "USED", checkedInAt: new Date().toISOString() }
          : b
      )
    );

    const res = await adminManualCheckIn(bookingId);
    if (res.success) {
      setActionMessage(res.message);
      router.refresh();
    } else {
      alert(res.message);
      router.refresh();
    }
  };

  // Filter Bookings
  const filteredBookings = allBookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();

    const responsibleName = (b.responsibleName || b.user?.name || "").toLowerCase();
    const identifier = (b.identifier || b.user?.nim || "").toLowerCase();
    const email = (b.email || b.user?.email || "").toLowerCase();
    const phone = b.phone || b.user?.phone || "";
    const prodi = (b.prodi || b.user?.prodi || "").toLowerCase();
    const purpose = (b.purpose || "").toLowerCase();
    const roomName = (b.room?.name || "").toLowerCase();

    const matchesSearch =
      !q ||
      responsibleName.includes(q) ||
      identifier.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      prodi.includes(q) ||
      purpose.includes(q) ||
      roomName.includes(q);

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesRoom = roomFilter === "ALL" || b.roomId === roomFilter;

    return matchesSearch && matchesStatus && matchesRoom;
  });

  // Ekspor Data ke CSV
  const exportToCSV = () => {
    const headers = [
      "No",
      "Tanggal",
      "Jam Sesi",
      "Ruangan",
      "Nama Penanggung Jawab",
      "NIM / NIP",
      "Email",
      "No WhatsApp",
      "Program Studi / Unit",
      "Keperluan",
      "Jumlah Pengguna",
      "Status Presensi",
      "Waktu Check-In",
    ];

    const rows = filteredBookings.map((b, idx) => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const dateStr = start.toLocaleDateString("id-ID");
      const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

      return [
        idx + 1,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${b.room?.name || "-"}"`,
        `"${b.responsibleName || b.user?.name || "-"}"`,
        `"${b.identifier || b.user?.nim || "-"}"`,
        `"${b.email || b.user?.email || "-"}"`,
        `"${b.phone || b.user?.phone || "-"}"`,
        `"${b.prodi || b.user?.prodi || "-"}"`,
        `"${(b.purpose || "-").replace(/"/g, '""')}"`,
        b.userCount || 1,
        `"${b.status}"`,
        `"${b.checkedInAt ? new Date(b.checkedInAt).toLocaleString("id-ID") : "-"}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Peminjaman_Focus_Room_FISIP_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="bg-fisip-950 text-white p-6 rounded-2xl border-b-4 border-amber-500 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Panel Verifikator & Administrasi FISIP
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Rekap Data Peminjaman & Presensi Ruangan
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            Laporan lengkap peminjaman 4 Focus Room, pemindai scanner presensi live, dan pengaturan ketersediaan ruangan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="self-start md:self-auto px-4 py-2 bg-fisip-800 hover:bg-fisip-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-fisip-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-stone-300 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("table")}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] flex items-center gap-2 transition-all ${
            activeTab === "table"
              ? "border-fisip-800 text-fisip-900 bg-white rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <ListOrdered className="w-4 h-4 text-fisip-700" />
          Tabel Laporan Data Peminjaman ({allBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scanner")}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] flex items-center gap-2 transition-all ${
            activeTab === "scanner"
              ? "border-fisip-800 text-fisip-900 bg-white rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Camera className="w-4 h-4 text-fisip-700" />
          Pemindai Kamera Presensi Live
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] flex items-center gap-2 transition-all ${
            activeTab === "rooms"
              ? "border-fisip-800 text-fisip-900 bg-white rounded-t-xl"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Building className="w-4 h-4 text-fisip-700" />
          Kelola Ketersediaan Ruangan (Buka/Kunci Room 1)
        </button>
      </div>

      {/* TAB 1: TABEL LAPORAN DATA LENGKAP */}
      {activeTab === "table" && (
        <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-sm p-6 space-y-4">
          {/* Action Bar (Search, Filters, Export) */}
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-center pb-2">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Penanggung Jawab / NIM / Prodi..."
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-fisip-700 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-stone-50 focus:ring-2 focus:ring-fisip-700 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">ACTIVE (Belum Hadir)</option>
                <option value="USED">USED (Terverifikasi Hadir)</option>
                <option value="CANCELLED">CANCELLED (Batal)</option>
                <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
              </select>

              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-stone-50 focus:ring-2 focus:ring-fisip-700 focus:outline-none"
              >
                <option value="ALL">Semua Ruangan</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                type="button"
                onClick={exportToCSV}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Tabel
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-300">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">Waktu & Jam Pemakaian</th>
                  <th className="py-3 px-3">Pemilihan Ruang</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                  <th className="py-3 px-3">NIM / NIP</th>
                  <th className="py-3 px-3">Kontak (Email & WA)</th>
                  <th className="py-3 px-3">Prodi</th>
                  <th className="py-3 px-3">Jumlah Pengguna</th>
                  <th className="py-3 px-3">Keperluan</th>
                  <th className="py-3 px-3">Status Presensi</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-stone-400">
                      Tidak ada data peminjaman yang cocok dengan parameter filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b, idx) => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);

                    return (
                      <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-stone-500 font-semibold">{idx + 1}</td>

                        {/* Waktu & Jam Sesi */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-stone-900">
                            {start.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="font-mono text-fisip-800 text-[11px] font-bold">
                            {start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </div>
                        </td>

                        {/* Pemilihan Ruang */}
                        <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                          {b.room?.name}
                        </td>

                        {/* Nama Penanggung Jawab */}
                        <td className="py-3 px-3 font-bold text-stone-900">
                          {b.responsibleName || b.user?.name || "Penanggung Jawab"}
                          <span className="block text-[10px] text-stone-400 uppercase font-normal">
                            {b.userType === "DOSEN_PEGAWAI" ? "Dosen/Pegawai" : "Mahasiswa"}
                          </span>
                        </td>

                        {/* NIM / NIP */}
                        <td className="py-3 px-3 font-mono text-stone-800 font-semibold whitespace-nowrap">
                          {b.identifier || b.user?.nim || "-"}
                        </td>

                        {/* Kontak */}
                        <td className="py-3 px-3">
                          <div className="text-stone-800">{b.email || b.user?.email || "-"}</div>
                          <div className="font-mono text-stone-500 text-[11px]">{b.phone || b.user?.phone || "-"}</div>
                        </td>

                        {/* Prodi */}
                        <td className="py-3 px-3 text-stone-800 font-medium whitespace-nowrap">{b.prodi || b.user?.prodi || "FISIP"}</td>

                        {/* Jumlah Pengguna */}
                        <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                          {b.userCount || 1} Orang
                        </td>

                        {/* Keperluan */}
                        <td className="py-3 px-3 text-stone-700 max-w-[180px] truncate" title={b.purpose || "-"}>
                          {b.purpose || "-"}
                        </td>

                        {/* Status Presensi */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              b.status === "USED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : b.status === "ACTIVE"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            }`}
                          >
                            {b.status === "USED"
                              ? "TERVERIFIKASI HADIR"
                              : b.status === "ACTIVE"
                              ? "BELUM SCAN"
                              : b.status}
                          </span>
                          {b.checkedInAt && (
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              Scan: {new Date(b.checkedInAt).toLocaleTimeString("id-ID")}
                            </div>
                          )}
                        </td>

                        {/* Aksi Check-in Manual */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {b.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleManualCheckIn(b.id, b.responsibleName)}
                              title="Verifikasi Check-in Manual jika ponsel pemesan kehabisan baterai"
                              className="px-2.5 py-1 bg-fisip-800 hover:bg-fisip-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            >
                              Check-In Manual
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PEMINDAI SCANNER LIVE */}
      {activeTab === "scanner" && (
        <div className="max-w-2xl mx-auto">
          <QRScanner />
        </div>
      )}

      {/* TAB 3: KELOLA KETERSEDIAAN RUANGAN (TOGGLE FOCUS ROOM 1) */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs">
            <strong>Instruksi Pengelolaan Ruangan:</strong> Focus Room 1 memiliki kapasitas besar (&gt; 15 orang) dan secara default dimatikan/dikunci untuk publik. Admin dapat mengaktifkannya jika sedang diizinkan untuk pemesanan umum, atau menguncinya kembali khusus kegiatan dosen/fakultas.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((r) => {
              const isRoom1 = r.id === "room-1";

              return (
                <div
                  key={r.id}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                    r.isActive
                      ? "bg-white border-stone-300 shadow-sm"
                      : "bg-stone-100 border-stone-300 opacity-90"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-stone-900">{r.name}</h3>
                      {r.isActive ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          STATUS: AKTIF
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          <Lock className="w-3.5 h-3.5 text-amber-800" />
                          STATUS: NONAKTIF (TERKUNCI)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600">{r.description}</p>

                    <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-fisip-700" />
                        <span className="font-bold text-stone-800">
                          Kapasitas: {isRoom1 ? "> 15 Orang (Hingga 20)" : `Maksimal ${r.capacity} Orang`}
                        </span>
                      </div>
                      {isRoom1 && (
                        <div className="flex items-center gap-2 font-bold text-fisip-900">
                          <Monitor className="w-3.5 h-3.5 text-fisip-700" />
                          <span>2 Unit Komputer (PC Desktop)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-stone-600">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Port Charger Meja & Full AC</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      {isRoom1 ? "Khusus Dosen / Rapat" : "Ruang Mahasiswa"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleRoom(r.id, r.isActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                        r.isActive
                          ? "bg-rose-700 hover:bg-rose-800 text-white"
                          : "bg-emerald-700 hover:bg-emerald-800 text-white"
                      }`}
                    >
                      {r.isActive ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          Nonaktifkan / Kunci
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          Aktifkan Ruangan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
