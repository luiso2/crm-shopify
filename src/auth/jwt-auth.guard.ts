import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // For now, we'll allow all requests in development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return super.canActivate(context);
  }
}
