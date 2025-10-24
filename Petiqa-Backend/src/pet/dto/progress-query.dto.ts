import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional } from 'class-validator';

export const PROGRESS_SECTIONS = [
  'status',
  'wallet',
  'inventory',
  'tasks',
  'achievements',
] as const;

export type ProgressSection = (typeof PROGRESS_SECTIONS)[number];

export class ProgressQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    return value;
  })
  @IsArray()
  @IsIn(PROGRESS_SECTIONS, { each: true })
  include?: ProgressSection[];
}
