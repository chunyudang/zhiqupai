import { PrismaClient } from '@prisma/client'

const levelNames: Record<string, string[]> = {
  science: ['物理入门', '化学探秘', '生物世界', '天文宇宙', '科学前沿'],
  society: ['经济基础', '社会结构', '法律常识', '国际关系', '当代议题'],
  logic: ['数学思维', '逻辑推理', '编程基础', '概率统计', '算法初步'],
  life: ['健康养生', '美食烹饪', '居家生活', '旅行地理', '安全急救'],
  humanities: ['古代文学', '世界历史', '哲学思想', '艺术鉴赏', '文化比较'],
}

const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard']

export async function seedLevels(prisma: PrismaClient) {
  console.log('Creating levels...')

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  let levelCount = 0

  for (const cat of categories) {
    const names = levelNames[cat.nameEn] || []

    for (let i = 0; i < names.length; i++) {
      await prisma.level.create({
        data: {
          categoryId: cat.id,
          levelNo: i + 1,
          name: names[i],
          difficulty: difficulties[i],
          passScore: 4,
          status: 'active',
        },
      })
      levelCount++
    }
  }

  console.log(`  ${levelCount} levels created`)
}
