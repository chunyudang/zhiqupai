import { PrismaClient } from '@prisma/client'
import * as bcryptjs from 'bcryptjs'

export async function seedAdmin(prisma: PrismaClient) {
  console.log('Creating admin...')

  const passwordHash = await bcryptjs.hash('admin123', 10)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'admin',
      status: 'active',
    },
  })

  console.log('  Admin created: admin / admin123')
}
