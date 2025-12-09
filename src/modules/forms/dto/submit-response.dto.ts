import { IsObject } from 'class-validator';

export class SubmitResponseDto {
  @IsObject()
  responses: Record<string, any>;
}
