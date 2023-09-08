import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes } from 'src/utils/types';
import { Services } from 'src/utils/constants';
import { instanceToPlain } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(Routes.PROFILES)
@Controller(Routes.PROFILES)
export class ProfileController {
  constructor(
    @Inject(Services.PROFILE_SERVICE)
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.createProfile(createProfileDto);
  }

  @Get()
  findAll() {
    return instanceToPlain(this.profileService.findAll());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(+id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
