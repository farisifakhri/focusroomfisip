const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Focus Room FISIP UIN Jakarta database...");

  // 1. Seed Rooms
  const rooms = [
    {
      id: "room-1",
      name: "Focus Room 1 (Lt. 2)",
      capacity: 6,
      description: "Kapasitas 6 orang, Smart TV 55\", Whiteboard, Full AC, High-speed Wi-Fi, Multi Power Plug.",
      isActive: true,
    },
    {
      id: "room-2",
      name: "Focus Room 2 (Lt. 2)",
      capacity: 6,
      description: "Kapasitas 6 orang, Smart TV 55\", Whiteboard, Full AC, High-speed Wi-Fi, Multi Power Plug.",
      isActive: true,
    },
    {
      id: "room-3",
      name: "Focus Room 3 (Lt. 3)",
      capacity: 4,
      description: "Kapasitas 4 orang, Whiteboard Kaca, Full AC, Port Charger Meja, Cocok untuk bimbingan/diskusi intensif.",
      isActive: true,
    },
    {
      id: "room-4",
      name: "Focus Room 4 (Lt. 3)",
      capacity: 4,
      description: "Kapasitas 4 orang, Whiteboard Kaca, Full AC, Port Charger Meja, Cocok untuk riset & persiapan sidang.",
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

  // 2. Seed Admin
  await prisma.user.upsert({
    where: { nim: "ADMIN_FISIP" },
    update: {},
    create: {
      nim: "ADMIN_FISIP",
      name: "Petugas Verifikator FISIP",
      role: "ADMIN",
    },
  });

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
