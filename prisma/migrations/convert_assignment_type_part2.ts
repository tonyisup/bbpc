import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //drop the homework column from the assignment table
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