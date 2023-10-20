import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  public async createCustomer(name: string, email: string) {
    return this.stripe.customers.create({
      name,
      email,
    });
  }

  public async charge(amount: number, paymentMethodId: string, userData: User) {
    let customer: Stripe.Customer;
    if (userData && !userData.stripeCustomerId) {
      const stripeCustomer = await this.createCustomer(
        `${userData.firstName} ${userData.lastName}`,
        userData.email,
      );
      customer = stripeCustomer;

      const findUser = await this.userRepository.findOne(userData.id);

      if (!findUser) {
        throw new HttpException('', HttpStatus.BAD_REQUEST);
      }

      await this.userRepository.save({
        ...findUser,
        stripeCustomerId: stripeCustomer.id,
      });
    }

    return this.stripe.paymentIntents.create({
      amount,
      customer: customer.id,
      payment_method: paymentMethodId,
      currency: 'usd',
      confirm: true,
    });
  }
}
