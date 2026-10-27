const { PrismaClient } = require("./generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Focus Room FISIP UIN Syarif Hidayatullah Jakarta...");

  const rooms = [
    {
      id: "room-1",
      name: "Focus Room 1 (Khusus Dosen / Rapat Besar)",
      capacity: 20, // > 15 orang
      description: "Ruang rapat dan pertemuan skala besar, biasa digunakan oleh Dosen dan Rapat Struktural FISIP. Akses umum tertutup kecuali diaktifkan oleh Admin.",
      facilities: "2 Unit Komputer (PC Desktop), Port Charger Meja di setiap sisi, Whiteboard Kaca Besar, Full AC.",
      isActive: false, // Default mati / nonaktif
    },
    {
      id: "room-2",
      name: "Focus Room 2",
      capacity: 10, // Maksimal 10 orang
      description: "Ruang diskusi kelompok menengah, riset kolaboratif, dan persiapan bimbingan.",
      facilities: "Port Charger Meja, Whiteboard Kaca, Full AC, Meja Konferensi.",
      isActive: true,
    },
    {
      id: "room-3",
      name: "Focus Room 3",
      capacity: 6, // Maksimal 6 orang
      description: "Ruang diskusi kelompok fokus, bimbingan tugas akhir, dan riset intensif.",
      facilities: "Port Charger Meja, Whiteboard Kaca, Full AC.",
      isActive: true,
    },
    {
      id: "room-4",
      name: "Focus Room 4",
      capacity: 6, // Maksimal 6 orang
      description: "Ruang belajar kelompok fokus, persiapan ujian komprehensif / sidang skripsi.",
      facilities: "Port Charger Meja, Whiteboard Kaca, Full AC.",
      isActive: true,
    },
  ];

  for (const r of rooms) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }

  // Seed default admin
  await prisma.user.upsert({
    where: { nim: "ADMIN_FISIP" },
    update: {},
    create: {
      nim: "ADMIN_FISIP",
      name: "Admin & Verifikator FISIP",
      email: "verifikator.fisip@uinjkt.ac.id",
      phone: "081298765432",
      prodi: "Sekretariat Dekanat FISIP",
      role: "ADMIN",
    },
  });

  console.log("Seeding data FISIP selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
