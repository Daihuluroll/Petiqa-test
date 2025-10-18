import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LogUtilService extends Logger {
  private contextLogger: Logger;

  constructor() {
    super();
    this.contextLogger = new Logger(LogUtilService.name);
  }

  setContext(context: string) {
    this.contextLogger = new Logger(context);
  }

  log(message: any, ...optionalParams: any[]): void {
    const sanitizedParams = optionalParams.map((param) => {
      if (param && typeof param === 'object') {
        const clone = { ...(param as Record<string, unknown>) };
        if ('password' in clone) {
          delete clone.password;
        }
        return JSON.stringify(clone);
      }
      return param;
    });

    this.contextLogger.log(message, ...sanitizedParams);
  }
}
