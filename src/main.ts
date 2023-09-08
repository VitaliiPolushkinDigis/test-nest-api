import 'reflect-metadata';
import { WebsocketAdapter } from './gateway/gateway.adapter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeormStore } from 'connect-typeorm/out';
import { Session } from './utils/typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { getRepository } from 'typeorm';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger/dist';
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

  const configService = app.get(ConfigService);
  const adapter = new WebsocketAdapter(app, configService);
  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');

  app.use(helmet());
  app.set('trust proxy', 1);

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

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Blind Talk')
    .setDescription('Blind Talk API description')
    .setVersion('1.0')
    .addTag('dev')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await app.listen(PORT, () => console.log(`Running on Port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
