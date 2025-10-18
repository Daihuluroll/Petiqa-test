import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppId } from '../constants/api-id.enum';

export const GetAppId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppId | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-app-id'];
  },
);
