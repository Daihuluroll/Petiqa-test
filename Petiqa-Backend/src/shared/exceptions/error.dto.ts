import { IsOptional } from 'class-validator';

export class ErrorDto {
  statusCode!: number;

  @IsOptional()
  errorCode?: string;

  message!: string;

  @IsOptional()
  details?: unknown;
}
