import { PrismaClient } from '@prisma/client'
import * as bcryptjs from 'bcryptjs'
import * as crypto from 'crypto'

export async function seedUser(prisma: PrismaClient) {
  console.log('Creating test user...')

  const passwordHash = await bcryptjs.hash('dcy1234', 10)

  const testUsers = [
    { phone: '13800000000', nickname: '测试用户' },
    { phone: '18659168150', nickname: '测试用户2' },
  ]

  for (const user of testUsers) {
    const hashedPhone = crypto.createHash('sha256').update(user.phone).digest('hex')

    await prisma.user.upsert({
      where: { phone: hashedPhone },
      update: {},
      create: {
        phone: hashedPhone,
        phoneLastFour: user.phone.slice(-4),
        nickname: user.nickname,
        passwordHash,
        status: 'active',
        pointsBalance: 0,
      },
    })

    console.log(`  Test user created: ${user.phone} / dcy1234`)
  }
}
