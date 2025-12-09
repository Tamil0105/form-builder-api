import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { Form } from '../../entities/form.entity';
import { FormResponse } from '../../entities/form-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormResponse])],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
