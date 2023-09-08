import { GatewaySessionManager } from './gateway.session';
import { Module } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { MessagingGateway } from './gateway';

@Module({
  providers: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
