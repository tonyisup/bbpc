import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, add the type column if it doesn't exist
  await prisma.$executeRaw`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[bbpc].[Assignment]') AND name = 'type')
    BEGIN
      ALTER TABLE [bbpc].[Assignment] ADD type NVARCHAR(50) DEFAULT 'HOMEWORK'
    END
  `;

  // Then update all existing assignments
  await prisma.$executeRaw`
    UPDATE [bbpc].[Assignment]
    SET type = CASE 
      WHEN homework = 1 THEN 'HOMEWORK'
      ELSE 'EXTRA_CREDIT'
    END
  `;

  // Finally, drop the homework column
  await prisma.$executeRaw`
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[bbpc].[Assignment]') AND name = 'homework')
    BEGIN
      ALTER TABLE [bbpc].[Assignment] DROP COLUMN homework
    END
  `;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 