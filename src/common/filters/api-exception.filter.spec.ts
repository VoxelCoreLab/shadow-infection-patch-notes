import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ApiExceptionFilter } from './api-exception.filter.js';

function hostWithResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  };
  return { host, status, json };
}

describe('ApiExceptionFilter', () => {
  it('keeps a string message', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(new NotFoundException('Patch note unknown'), host as never);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Patch note unknown',
      error: 'Not Found',
    });
  });

  it('flattens validation message arrays', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(
      new BadRequestException({
        message: ['version must be a string', 'title should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      }),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'version must be a string; title should not be empty',
      error: 'Bad Request',
    });
  });

  it('maps unexpected errors to 500', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(new Error('boom'), host as never);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });

  it('preserves unauthorized status', () => {
    const filter = new ApiExceptionFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(new UnauthorizedException(), host as never);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
      }),
    );
  });
});
