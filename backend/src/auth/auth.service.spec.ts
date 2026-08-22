import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn<() => Promise<unknown>>(),
    findById: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    updatePassword: jest.fn<() => Promise<unknown>>(),
  };
  const jwtService = {
    signAsync: jest.fn<() => Promise<unknown>>(),
  };
  const hashMock = bcrypt.hash as unknown as {
    mockResolvedValue: (value: string) => void;
  };
  const compareMock = bcrypt.compare as unknown as {
    mockResolvedValue: (value: boolean) => void;
  };
  const service = new AuthService(
    usersService as unknown as UsersService,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hashes the password and returns a token when registering', async () => {
    hashMock.mockResolvedValue('hashed-password');
    usersService.create.mockResolvedValue({
      id: 'user-1',
      name: 'Cassio',
      email: 'cassio@example.com',
      role: 'USER',
      passwordHash: 'hashed-password',
    });
    jwtService.signAsync.mockResolvedValue('access-token');

    const dto: RegisterDto = {
      name: 'Cassio',
      email: 'cassio@example.com',
      password: 'password123',
    };

    await expect(service.register(dto)).resolves.toMatchObject({
      accessToken: 'access-token',
      user: { id: 'user-1', email: 'cassio@example.com' },
    });
    expect(usersService.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      passwordHash: 'hashed-password',
    });
  });

  it('rejects login when the user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    const dto: LoginDto = {
      email: 'unknown@example.com',
      password: 'password123',
    };

    await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects login when the password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'stored-hash',
      name: 'User',
      role: 'USER',
    });
    compareMock.mockResolvedValue(false);

    await expect(
      service.login({ email: 'user@example.com', password: 'wrongpass' }),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('returns a token when the credentials are valid', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'stored-hash',
      name: 'User',
      role: 'USER',
    });
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access-token');

    await expect(
      service.login({ email: 'user@example.com', password: 'password123' }),
    ).resolves.toMatchObject({ accessToken: 'access-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER',
    });
  });

  it('rejects a password change when the current password is invalid', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'stored-hash',
    });
    compareMock.mockResolvedValue(false);

    const dto: ChangePasswordDto = {
      currentPassword: 'wrongpass',
      newPassword: 'newpassword123',
    };

    await expect(service.changePassword('user-1', dto)).rejects.toThrow(
      'A senha atual está incorreta',
    );
    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });

  it('hashes and saves a new password', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'stored-hash',
    });
    compareMock.mockResolvedValue(true);
    hashMock.mockResolvedValue('new-hashed-password');
    usersService.updatePassword.mockResolvedValue({ id: 'user-1' });

    const dto: ChangePasswordDto = {
      currentPassword: 'currentpass',
      newPassword: 'newpassword123',
    };

    await expect(service.changePassword('user-1', dto)).resolves.toEqual({
      message: 'Senha alterada com sucesso',
    });
    expect(usersService.updatePassword).toHaveBeenCalledWith(
      'user-1',
      'new-hashed-password',
    );
  });
});
