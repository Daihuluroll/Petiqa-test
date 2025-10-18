import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PetiqaService } from './petiqa.service';

@ApiTags('petiqa')
@Controller()
export class PetiqaController {
  constructor(private readonly petiqaService: PetiqaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  @ApiOkResponse({ description: 'Service status' })
  health(): string {
    return this.petiqaService.getHealth();
  }
}
