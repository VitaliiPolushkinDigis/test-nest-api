import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../utils/typeorm';
import { Services } from 'src/utils/constants';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [StripeController],
  providers: [
    {
      provide: Services.STRIPE_SERVICE,
      useClass: StripeService,
    },
  ],
})
export class StripeModule {}
