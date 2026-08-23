import { describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

describe('AuthController', () => {
  const authService = {
    register: jest.fn<() => Promise<unknown>>(),
    login: jest.fn<() => Promise<unknown>>(),
    changePassword: jest.fn<() => Promise<unknown>>(),
  };
  const controller = new AuthController(
    authService as unknown as AuthService,
  );

  it('delegates registration to the service', () => {
    const dto: RegisterDto = {
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
    };
    authService.register.mockResolvedValue({ accessToken: 'token' });

    void controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('delegates login to the service', () => {
    const dto: LoginDto = {
      email: 'user@example.com',
      password: 'password123',
    };
    authService.login.mockResolvedValue({ accessToken: 'token' });

    void controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('delegates password changes to the service using the current user', () => {
    const user: CurrentUserPayload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    };
    const dto: ChangePasswordDto = {
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
    };
    authService.changePassword.mockResolvedValue({ message: 'ok' });

    void controller.changePassword(user, dto);

    expect(authService.changePassword).toHaveBeenCalledWith('user-1', dto);
  });
});
