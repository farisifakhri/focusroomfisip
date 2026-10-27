"use client";

import React, { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { BookingRecord, RoomRecord } from "@/lib/data";
import { updateBookingStatus } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  Shield,
  Camera,
  ListOrdered,
  Building2,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

interface AdminClientProps {
  rooms: RoomRecord[];
  allBookings: BookingRecord[];
}

export default function AdminClient({ rooms, allBookings }: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scanner" | "bookings" | "rooms">("scanner");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredBookings = allBookings.filter((b) => {
    const matchesSearch =
      b.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.room?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Panel Verifikator & Administrasi
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Focus Room FISIP UIN Jakarta
          </h1>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            Pindai QR dinamis presensi mahasiswa, pantau ketersediaan ruangan, dan kelola reservasi.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start md:self-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("scanner")}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "scanner"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Camera className="w-4 h-4" />
          Scanner Presensi Live
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "bookings"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Log & Riwayat Booking ({allBookings.length})
        </button>

        <button
          onClick={() => setActiveTab("rooms")}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "rooms"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Status 4 Focus Room
        </button>
      </div>

      {/* Tab 1: Scanner */}
      {activeTab === "scanner" && (
        <div className="max-w-2xl mx-auto">
          <QRScanner />
        </div>
      )}

      {/* Tab 2: Bookings Log */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Mahasiswa / NIM / Ruang..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">ACTIVE (Aktif / Belum Scan)</option>
                <option value="USED">USED (Sudah Hadir / Check-in)</option>
                <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu Sesi</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Mahasiswa (NIM)</th>
                  <th className="py-3 px-4">Keperluan</th>
                  <th className="py-3 px-4">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Tidak ada data pemesanan yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {start.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="font-mono text-slate-500 text-[11px]">
                            {start.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {end.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{b.room?.name}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{b.user?.name}</div>
                          <div className="font-mono text-slate-400 text-[11px]">{b.user?.nim}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                          {b.notes || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                              b.status === "ACTIVE"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : b.status === "USED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {b.status === "USED"
                              ? "HADIR / TERVERIFIKASI"
                              : b.status === "ACTIVE"
                              ? "MENUNGGU SCAN"
                              : b.status}
                          </span>
                          {b.checkedInAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Scan: {new Date(b.checkedInAt).toLocaleTimeString("id-ID")}
                            </div>
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

      {/* Tab 3: Rooms Overview */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((r) => {
            const todayBookings = allBookings.filter((b) => {
              const bDate = b.startTime.split("T")[0];
              const today = new Date().toISOString().split("T")[0];
              return b.roomId === r.id && bDate === today && b.status !== "CANCELLED";
            });

            return (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{r.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Kapasitas {r.capacity} Orang
                  </span>
                </div>
                <p className="text-xs text-slate-500">{r.description}</p>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    Pemesanan Hari Ini ({todayBookings.length} Sesi Terisi):
                  </div>
                  {todayBookings.length === 0 ? (
                    <div className="text-xs text-emerald-600 italic">Ruangan kosong / belum ada pesanan hari ini.</div>
                  ) : (
                    <ul className="space-y-1.5">
                      {todayBookings.map((b) => (
                        <li
                          key={b.id}
                          className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-semibold text-slate-800">
                              {new Date(b.startTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(b.endTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-slate-500 ml-2">({b.user?.name})</span>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              b.status === "USED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
