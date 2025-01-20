import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { User } from 'src/utils/typeorm';
import { IUserService } from '../users/user';
import { Routes, Services } from '../utils/constants';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';
import {
  AuthenticatedGuard,
  JwtAuthGuard,
  LocalAuthGuard,
} from './utils/Guards';
import { AuthenticatedRequest } from 'src/utils/types';
import { AuthGuard } from '@nestjs/passport';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'Ok',
    type: User,
  })
  @ApiBody({ type: CreateUserDto, description: 'CreateUserDto' })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return instanceToPlain(await this.userService.createUser(createUserDto));
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;
    return this.authService.refreshToken(refresh_token);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request, @Res() res: Response) {
    res.send(req.user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    req.logout((err) => {
      return err ? res.send(400) : res.send(200);
    });
  }
}
