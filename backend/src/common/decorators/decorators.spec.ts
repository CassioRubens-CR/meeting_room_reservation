import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  CurrentUserPayload,
  getCurrentUser,
} from './current-user.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';
import { ROLES_KEY, Roles } from './roles.decorator';

describe('getCurrentUser', () => {
  it('extracts the user from the request', () => {
    const user: CurrentUserPayload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;

    expect(getCurrentUser(undefined, context)).toEqual(user);
  });
});

describe('Public decorator', () => {
  it('marks a method as public via metadata', () => {
    class TestController {
      @Public()
      handler() {}
    }

    const isPublic = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      TestController.prototype.handler,
    );

    expect(isPublic).toBe(true);
  });
});

describe('Roles decorator', () => {
  it('attaches the required roles via metadata', () => {
    class TestController {
      @Roles(Role.ADMIN)
      handler() {}
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestController.prototype.handler,
    );

    expect(roles).toEqual([Role.ADMIN]);
  });
});
