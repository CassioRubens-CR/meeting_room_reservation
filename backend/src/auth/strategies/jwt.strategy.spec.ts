import { describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('reads the JWT secret from the config service', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(configService as unknown as ConfigService);

    expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('returns the payload as the validated user', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };
    const strategy = new JwtStrategy(configService as unknown as ConfigService);
    const payload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'USER' as const,
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });
});
