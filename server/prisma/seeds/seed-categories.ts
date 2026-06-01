import { PrismaClient } from '@prisma/client'

const categories = [
  {
    name: '科学',
    nameEn: 'science',
    icon: '🔬',
    description: '自然科学、物理、化学、生物等基础知识',
    sortOrder: 1,
  },
  {
    name: '社会',
    nameEn: 'society',
    icon: '🌍',
    description: '社会学、经济学、政治学等人文社科知识',
    sortOrder: 2,
  },
  {
    name: '逻辑',
    nameEn: 'logic',
    icon: '🧠',
    description: '逻辑推理、数学思维、编程基础等',
    sortOrder: 3,
  },
  {
    name: '生活',
    nameEn: 'life',
    icon: '🏠',
    description: '生活常识、健康、饮食、旅行等实用知识',
    sortOrder: 4,
  },
  {
    name: '人文',
    nameEn: 'humanities',
    icon: '📚',
    description: '文学、历史、哲学、艺术等人文素养',
    sortOrder: 5,
  },
]

export async function seedCategories(prisma: PrismaClient) {
  console.log('Creating categories...')

  // 先清空已有关联数据，确保幂等
  await prisma.question.deleteMany()
  await prisma.level.deleteMany()
  await prisma.category.deleteMany()

  for (const cat of categories) {
    await prisma.category.create({
      data: cat,
    })
  }

  console.log(`  ${categories.length} categories created`)
}
