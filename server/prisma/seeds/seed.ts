import { PrismaClient } from '@prisma/client'
import { seedAdmin } from './seed-admin'
import { seedCategories } from './seed-categories'
import { seedLevels } from './seed-levels'
import { seedQuestions } from './seed-questions'

const prisma = new PrismaClient()

async function seedSystemConfigs(prisma: PrismaClient) {
  console.log('Creating system configs...')

  const configs = [
    {
      configKey: 'checkin_rules',
      configValue: JSON.stringify({
        maxMakeupPerMonth: 5,
        makeupCost: 50,
      }),
      description: '签到规则配置：每月最大补签次数和补签消耗积分',
    },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { configKey: config.configKey },
      update: { configValue: config.configValue },
      create: config,
    })
  }

  console.log('  System configs created')
}

async function main() {
  console.log('🌱 Starting seed...\n')

  await seedAdmin(prisma)
  await seedCategories(prisma)
  await seedLevels(prisma)
  await seedQuestions(prisma)
  await seedSystemConfigs(prisma)

  // Count stats
  const userCount = await prisma.user.count()
  const adminCount = await prisma.admin.count()
  const categoryCount = await prisma.category.count()
  const levelCount = await prisma.level.count()
  const questionCount = await prisma.question.count()

  console.log('\n✅ Seed completed!')
  console.log('\n📊 Stats:')
  console.log(`   Users: ${userCount}`)
  console.log(`   Admins: ${adminCount}`)
  console.log(`   Categories: ${categoryCount}`)
  console.log(`   Levels: ${levelCount}`)
  console.log(`   Questions: ${questionCount}`)
  console.log('\n🔑 Admin login: admin / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
