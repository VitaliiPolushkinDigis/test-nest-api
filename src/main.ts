import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormStore } from 'connect-typeorm/out';
import { Session } from './utils/typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { getRepository } from 'typeorm';

async function bootstrap() {
  const { PORT } = process.env;
  const app: any = await NestFactory.create(AppModule);
  const sessionRepository = getRepository(Session);
  app.setGlobalPrefix('api');

  app.use(helmet());
  app.set('trust proxy', 1);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://ans-chat-front.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'COOKIE_SECRET',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 86400000, // cookie expires 1 day later
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
