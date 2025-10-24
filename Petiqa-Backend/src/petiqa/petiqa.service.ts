import { Injectable } from '@nestjs/common';
import { LogUtilService } from '../shared/services/log-util.service';

@Injectable()
export class PetiqaService {
  constructor(private readonly logger: LogUtilService) {
    this.logger.setContext(PetiqaService.name);
  }

  getHealth(): string {
    this.logger.log(this.getHealth.name);
    return 'ok';
  }
}
