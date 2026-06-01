import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { QuizModule } from './modules/quiz/quiz.module'
import { PointsModule } from './modules/points/points.module'
import { CheckinModule } from './modules/checkin/checkin.module'
import { MessageModule } from './modules/message/message.module'
import { AdminModule } from './modules/admin/admin.module'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AuthGuard } from './common/guards/auth.guard'
import { RateLimitGuard } from './common/guards/rate-limit.guard'
import { ValidationPipe } from './common/pipes/validation.pipe'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 托管 admin SPA 构建产物
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'admin', 'dist'),
      serveRoot: '/admin',
      exclude: ['/api/*'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    QuizModule,
    PointsModule,
    CheckinModule,
    MessageModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
