import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { randomBytes } from 'crypto'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { UserService } from './user.service'
import { UpdateProfileDto, DeleteAccountDto } from './dto/update-profile.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtUserPayload } from '@/common/guards/auth.guard'

@ApiTags('用户 (User)')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取个人信息' })
  async getProfile(@CurrentUser() user: JwtUserPayload) {
    return this.userService.getProfile(user.sub)
  }

  @Put('profile')
  @ApiOperation({ summary: '修改个人信息' })
  async updateProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.sub, dto)
  }

  @Post('upload/avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '头像文件（jpg/png，≤2MB）',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads', 'avatars'),
        filename: (_req, file, callback) => {
          const timestamp = Date.now()
          const randomStr = randomBytes(4).toString('hex')
          const ext = extname(file.originalname).toLowerCase()
          callback(null, `${timestamp}_${randomStr}${ext}`)
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png']
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(new Error('仅支持 jpg/png 格式'), false)
        }
        callback(null, true)
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: JwtUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('文件上传失败')
    }
    const avatarPath = `/uploads/avatars/${file.filename}`
    return this.userService.uploadAvatar(user.sub, avatarPath)
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '注销账号' })
  async deleteAccount(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.userService.deleteAccount(user.sub, dto.confirmPassword)
  }
}
