import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfilesService.create(createUserProfileDto);
  }

  @Get()
  findAll() {
    return this.userProfilesService.findAll();
  }

  @Get('me')
  findMyProfile(@Request() req) {
    return this.userProfilesService.findByUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userProfilesService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userProfilesService.findByUserId(userId);
  }

  @Patch('me')
  updateMyProfile(@Request() req, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfilesService.updateByUserId(req.user.id, updateUserProfileDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserProfileDto: UpdateUserProfileDto) {
    return this.userProfilesService.update(id, updateUserProfileDto);
  }

  @Patch('user/:userId')
  updateByUserId(
    @Param('userId') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.updateByUserId(userId, updateUserProfileDto);
  }

  @Patch('me/theme')
  updateMyTheme(@Request() req, @Body('theme') theme: 'light' | 'dark' | 'auto') {
    return this.userProfilesService.updateTheme(req.user.id, theme);
  }

  @Patch('me/language')
  updateMyLanguage(@Request() req, @Body('language') language: string) {
    return this.userProfilesService.updateLanguage(req.user.id, language);
  }

  @Patch('me/timezone')
  updateMyTimezone(@Request() req, @Body('timezone') timezone: string) {
    return this.userProfilesService.updateTimezone(req.user.id, timezone);
  }

  @Patch('me/preferences')
  updateMyPreferences(@Request() req, @Body() preferences: Record<string, any>) {
    return this.userProfilesService.updatePreferences(req.user.id, preferences);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userProfilesService.remove(id);
  }

  @Delete('user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByUserId(@Param('userId') userId: string) {
    return this.userProfilesService.removeByUserId(userId);
  }
}
