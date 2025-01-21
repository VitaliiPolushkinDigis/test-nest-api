import { GatewaySessionManager } from './gateway.session';
import { Module } from '@nestjs/common';
import { jwtConstants, Services } from 'src/utils/constants';
import { MessagingGateway } from './gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3 days' },
    }),
  ],
  providers: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
