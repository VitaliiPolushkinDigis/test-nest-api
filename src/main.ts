import { WebsocketAdapter } from './gateway/gateway.adapter';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormStore } from 'connect-typeorm/out';
import { Session } from './utils/typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { getRepository } from 'typeorm';
import { NestExpressApplication } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet');

async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://ans-chat-front.vercel.app',
        'https://front-react-359f97dc238f.herokuapp.com',
        'https://front-react-359f97dc238f.herokuapp.com/',
      ],
      credentials: true,
      optionsSuccessStatus: 200,
    },
  });
  const sessionRepository = getRepository(Session);

  const adapter = new WebsocketAdapter(app);
  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');

  app.use(helmet());
  app.set('trust proxy', 1);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://ans-chat-front.vercel.app',
      'https://front-react-359f97dc238f.herokuapp.com',
      'https://front-react-359f97dc238f.herokuapp.com/',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'COOKIE_SECRET',
      saveUninitialized: false,
      resave: false,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 3 * 86400000, // cookie expires 1 day later
        sameSite: 'none',
        secure: true,
        httpOnly: false,
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await app.listen(PORT, () => console.log(`Running on Port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
