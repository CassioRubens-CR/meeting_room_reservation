import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export function getCurrentUser(
  _data: unknown,
  context: ExecutionContext,
): CurrentUserPayload {
  const request = context.switchToHttp().getRequest<{
    user: CurrentUserPayload;
  }>();

  return request.user;
}

export const CurrentUser = createParamDecorator(getCurrentUser);
