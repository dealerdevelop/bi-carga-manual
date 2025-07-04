const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Dealer@2025', 10)
  
  await prisma.user.upsert({
    where: { email: 'dealer@dealerauto.com.br' },
    update: {},
    create: {
      email: 'dealer@dealerauto.com.br',
      password: hashedPassword,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
