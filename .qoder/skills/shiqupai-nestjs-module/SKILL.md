---
name: shiqupai-nestjs-module
description: 快速生成符合识趣派规范的 NestJS 业务模块代码，包含完整的 Module/Controller/Service/DTO 四件套和 PrismaService 依赖注入。当用户说"生成xxx模块"或"创建xxx模块"时触发，自动分析 AGENTS.md 中的模块划分信息。
---

# 识趣派 NestJS 模块生成器

## 使用方式

用户输入示例：
- "生成 AuthModule"
- "创建 UserModule"
- "生成 QuizModule 模块"

## 模块生成规范

### 目录结构模板

```
src/modules/{moduleName}/
├── {module-name}.module.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   └── update-{entity}.dto.ts
└── {module-name}.controller.spec.ts
```

### 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 模块目录 | 小写英文 | `auth/`、`quiz/` |
| 文件名 | kebab-case | `auth.module.ts`、`user.controller.ts` |
| 类名 | PascalCase + 后缀 | `AuthModule`、`AuthController`、`AuthService` |
| DTO类名 | PascalCase + Dto | `RegisterDto`、`LoginDto` |

### Module 模板

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { XxxController } from './xxx.controller';
import { XxxService } from './xxx.service';

@Module({
  imports: [PrismaModule],
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService],
})
export class XxxModule {}
```

### Controller 模板

```typescript
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { XxxService } from './xxx.service';
import { CreateXxxDto } from './dto/create-xxx.dto';

@ApiTags('xxx')
@Controller('xxx')
export class XxxController {
  constructor(private readonly xxxService: XxxService) {}

  @Post()
  @ApiOperation({ summary: '创建xxx' })
  async create(@Body() dto: CreateXxxDto) {
    return this.xxxService.create(dto);
  }
}
```

### Service 模板

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class XxxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    // 业务逻辑
  }

  async findAll() {
    return this.prisma.xxx.findMany();
  }
}
```

### DTO 模板

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateXxxDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateXxxDto {
  @ApiProperty({ description: '名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
```

## 特殊说明

1. C端 API 路由前缀 `/api/v1/` 由全局配置处理，Controller 中只需写相对路径
2. 后台 API 路由前缀 `/api/admin/v1/` 同理
3. 所有接口的 `@ApiBearerAuth()` 装饰器用于 JWT 鉴权
4. auth/register 和 auth/login 除外（不需要鉴权）
5. 所有 DTO 必须使用 class-validator 装饰器做输入校验
6. 使用 @nestjs/swagger 的 @ApiProperty 装饰器标注字段说明
