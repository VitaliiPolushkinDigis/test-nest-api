import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    console.log('canActivate', result);

    const request = context.switchToHttp().getRequest();
    console.log('context.switchToHttp().getRequest()', request);

    const login = await super.logIn(request);
    console.log('login operation', login);

    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();

    return req.isAuthenticated();
  }
}
