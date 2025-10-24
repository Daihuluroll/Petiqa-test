import { HttpException, Logger } from '@nestjs/common';
import { ErrorDto } from './error.dto';
import { CommonError } from '../errors/common.error';

export class CustomException extends HttpException {
  private readonly logger = new Logger(CustomException.name);

  constructor(private readonly detail: ErrorDto) {
    super(detail, detail.statusCode);

    if (detail.errorCode !== CommonError.PETIQA.INVALID_DOCUMENT.errorCode) {
      this.logger.error(detail);
    }
  }
}
