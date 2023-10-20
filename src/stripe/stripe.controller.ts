import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import CreateChargeDto from './dtos/createCharge.dto';
import { User } from 'src/utils/typeorm';
import { AuthUser } from 'src/utils/decorators';
import { Routes } from 'src/utils/types';
import { ApiTags } from '@nestjs/swagger';
import { Services } from 'src/utils/constants';

@ApiTags(Routes.CHARGE)
@Controller(Routes.CHARGE)
export class StripeController {
  constructor(
    @Inject(Services.STRIPE_SERVICE)
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createCharge(@AuthUser() user: User, @Body() charge: CreateChargeDto) {
    await this.stripeService.charge(
      charge.amount,
      charge.paymentMethodId,
      user,
    );
  }
}
