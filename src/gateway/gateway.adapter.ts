import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Session } from './../utils/typeorm/entities/Session';
import { getRepository } from 'typeorm';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/utils/typeorm';

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    console.log('options', options);

    const sessionRepository = getRepository(Session);

    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next) => {
      const { cookie: clientCookie } = socket.handshake.headers;
      if (!clientCookie) {
        console.log('Client has no cookies');
        return next(new Error('Not Authenticated, no cookies were sent !!!'));
      }

      console.log('clientCookie', clientCookie);

      const parsedCookie = cookie.parse(clientCookie);

      const CHAT_APP_SESSION_ID = parsedCookie.CHAT_APP_SESSION_ID;
      if (!CHAT_APP_SESSION_ID) {
        console.log('CHAT_APP_SESSION_ID DOES NOT EXIST');
        return next(new Error('Not Authenticated'));
      }

      const signedCookie = cookieParser.signedCookie(
        CHAT_APP_SESSION_ID,
        'COOKIE_SECRET',
      );

      if (!signedCookie) return next(new Error('Error signing cookie'));
      const sessionDB = await sessionRepository.findOne({ id: signedCookie });
      if (!sessionDB) return next(new Error('No session found'));

      const userFromJson = JSON.parse(sessionDB.json);

      console.log('userFromJson', userFromJson);

      if (!userFromJson.passport || !userFromJson.passport.user)
        return next(new Error('Passport or User object does not exist.'));

      const userDB = plainToInstance(
        User,
        JSON.parse(sessionDB.json).passport.user,
      );
      socket.user = userDB;
      next();
    });

    return server;
  }
}
