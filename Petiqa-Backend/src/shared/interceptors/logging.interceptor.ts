import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Observable, tap } from 'rxjs';
import { LogUtilService } from '../services/log-util.service';

const REF_ALPHABET =
  '1234567890ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';
const REF_LENGTH = 12;

const generateRefCode = (): string => {
  const bytes = randomBytes(REF_LENGTH);
  let result = '';
  for (let i = 0; i < REF_LENGTH; i++) {
    const index = bytes[i] % REF_ALPHABET.length;
    result += REF_ALPHABET[index];
  }
  return result;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LogUtilService) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    const refCode = generateRefCode();
    const prefix = `${refCode} ${method} ${url}`;

    request.refCode = refCode;

    this.logger.log(`START -> ${prefix}`);

    const started = Date.now();
    return next.handle().pipe(
      tap(() =>
        this.logger.log(`END -> ${prefix} [${Date.now() - started}ms]`),
      ),
    );
  }
}
