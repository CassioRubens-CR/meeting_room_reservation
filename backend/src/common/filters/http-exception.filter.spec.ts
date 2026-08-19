import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, HttpException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  const createHost = (url: string) => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { url };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('preserves the status and response from an HttpException', () => {
    const { host, status, json } = createHost('/rooms');

    filter.catch(new BadRequestException('Payload inválido'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        path: '/rooms',
        message: 'Payload inválido',
      }),
    );
  });

  it('returns a generic 500 response for unexpected errors', () => {
    const { host, status, json } = createHost('/reservations');

    filter.catch(new Error('database failure'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        path: '/reservations',
        message: 'Erro interno do servidor',
      }),
    );
  });

  it('supports structured HttpException responses', () => {
    const { host, json } = createHost('/auth/login');
    const exception = new HttpException(
      { message: ['email inválido'], error: 'Bad Request' },
      400,
    );

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['email inválido'],
        error: 'Bad Request',
      }),
    );
  });
});
