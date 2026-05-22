/**
 * Database seed – creates default roles only.
 * Staff users must be added via the admin panel; no names are ever seeded here.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default staff roles...");

  const roles = [
    { role_name: "Caretaker",       permission_level: 1 },
    { role_name: "Event Lead",      permission_level: 2 },
    { role_name: "Branch Manager",  permission_level: 3 },
  ];

  for (const role of roles) {
    await prisma.staffRole.upsert({
      where: { role_name: role.role_name },
      update: { permission_level: role.permission_level },
      create: role,
    });
    console.log(`  ✓ Role: ${role.role_name} (level ${role.permission_level})`);
  }

  console.log("Seed complete. Add staff users via the admin panel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
