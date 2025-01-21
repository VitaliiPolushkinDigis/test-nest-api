import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Session } from './../utils/typeorm/entities/Session';
import { getRepository } from 'typeorm';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/utils/typeorm';
import { INestApplicationContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from 'src/utils/constants';

export class WebsocketAdapter extends IoAdapter {
  private jwtService: JwtService;
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
    this.jwtService = new JwtService({
      secret: jwtConstants.secret, // Use the same secret as JwtModule
    });
  }
  createIOServer(port: number, options?: any) {
    console.log('createdIOServer', this.configService);

    const sessionRepository = getRepository(Session);

    const server = super.createIOServer(port, options);

    return server;
  }
}
