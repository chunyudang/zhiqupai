import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { VersioningType } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // API 版本控制
  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
  })

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // 静态文件托管 /uploads
  const uploadsPath = join(__dirname, '..', 'uploads')
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true })
  }
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  })

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('识趣派 API')
    .setDescription('轻学习+强激励的答题闯关娱乐APP')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`🚀 识趣派服务已启动: http://localhost:${port}`)
  console.log(`📖 Swagger 文档: http://localhost:${port}/api/docs`)
}

bootstrap()
