import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AdminService } from './admin.service'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { AdminAuthController } from './controllers/admin-auth.controller'
import { CategoryManageController } from './controllers/category-manage.controller'
import { LevelManageController } from './controllers/level-manage.controller'
import { QuestionManageController } from './controllers/question-manage.controller'
import { UserManageController } from './controllers/user-manage.controller'
import { MessagePushController } from './controllers/message-push.controller'
import { SystemConfigController } from './controllers/system-config.controller'
import { DashboardController } from './controllers/dashboard.controller'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ADMIN_JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [
    AdminAuthController,
    CategoryManageController,
    LevelManageController,
    QuestionManageController,
    UserManageController,
    MessagePushController,
    SystemConfigController,
    DashboardController,
  ],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService],
})
export class AdminModule {}
