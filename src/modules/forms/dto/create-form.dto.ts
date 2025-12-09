import { IsString, IsArray, ValidateNested, IsOptional, MinLength, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { FormField, RoutingRule } from '../../../entities/form-field.interface';

class RoutingRuleDto implements RoutingRule {
  @IsString()
  sourceQuestionId: string;

  @IsString()
  @IsIn(['equals', 'notEquals', 'contains'])
  condition: 'equals' | 'notEquals' | 'contains';

  @IsString()
  value: string;
}

class FormFieldDto implements FormField {
  @IsString()
  id: string;

  @IsString()
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingRuleDto)
  routingRule?: RoutingRuleDto;

  @IsOptional()
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export class CreateFormDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @IsOptional()
  @IsString()
  @IsIn(['purple', 'blue', 'green', 'orange', 'pink'])
  colorTheme?: string;
}
