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
  const { PORT, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } =
    process.env;

  const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://ans-chat-front.vercel.app',
        'https://front-react-359f97dc238f.herokuapp.com',
        'https://front-react-359f97dc238f.herokuapp.com/',
        'https://blind-talk-a887ce0cffca.herokuapp.com',
        'https://blind-talk-a887ce0cffca.herokuapp.com/',
        'https://chat-nextjs-a5df84e059d6.herokuapp.com/',
        'https://chat-nextjs-a5df84e059d6.herokuapp.com',
        'https://nextjs-chat-app-vxuo.vercel.app',
      ],
      credentials: true,
      optionsSuccessStatus: 200,
    },
  });
  const sessionRepository = getRepository(Session);

  const configService = app.get(ConfigService);
  const adapter = new WebsocketAdapter(app, configService);
  app.useWebSocketAdapter(adapter);
  app.setGlobalPrefix('api');

  app.use(helmet());
  app.set('trust proxy', 1);

  const production: any = { sameSite: 'none', secure: true, httpOnly: false };

  const isProd = process.env.NODE_ENV === 'production';

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'COOKIE_SECRET',
      saveUninitialized: false,
      resave: true,
      name: 'CHAT_APP_SESSION_ID',
      cookie: {
        maxAge: 3 * 86400000, // cookie expires 1 day later
        ...(isProd ? production : {}),
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  app.use(cookieParser());
  app.use(passport.initialize());

  const config = new DocumentBuilder()
    .setTitle('Blind Talk')
    .setDescription('Blind Talk API description')
    .setVersion('1.0')
    .addTag('dev')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(passport.session());

  try {
    const currentPort = isProd ? process.env.PORT : PORT;
    await app.listen(currentPort, () =>
      console.log(`Running on Port ${currentPort}`),
    );
  } catch (err) {
    console.log(err);
  }
}
bootstrap();
