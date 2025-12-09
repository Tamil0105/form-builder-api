import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Form } from '../../entities/form.entity';
import { FormResponse } from '../../entities/form-response.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,
  ) {}

  async createForm(userId: string, createFormDto: CreateFormDto) {
    const form = this.formRepository.create({
      ...createFormDto,
      userId: new ObjectId(userId),
      isPublished: false,
    });

    await this.formRepository.save(form);

    return {
      message: 'Form created successfully',
      form: this.formatForm(form),
    };
  }

  async getUserForms(userId: string) {
    const forms = await this.formRepository.find({
      where: { userId: new ObjectId(userId) } as any,
    });

    return {
      message: 'Forms retrieved successfully',
      forms: forms.map(form => this.formatForm(form)),
    };
  }

  async getForm(formId: string, userId: string) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to access this form');
    }

    return {
      message: 'Form retrieved successfully',
      form: this.formatForm(form),
    };
  }

  async updateForm(formId: string, userId: string, updateFormDto: UpdateFormDto) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this form');
    }

    Object.assign(form, updateFormDto);
    await this.formRepository.save(form);

    return {
      message: 'Form updated successfully',
      form: this.formatForm(form),
    };
  }

  async deleteForm(formId: string, userId: string) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to delete this form');
    }

    await this.formRepository.delete({ _id: new ObjectId(formId) } as any);
    
    // Also delete all responses
    await this.formResponseRepository.delete({ formId: new ObjectId(formId) } as any);

    return {
      message: 'Form deleted successfully',
    };
  }

  async publishForm(formId: string, userId: string) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to publish this form');
    }

    if (form.isPublished) {
      throw new BadRequestException('Form is already published');
    }

    form.isPublished = true;
    form.publishedAt = new Date();
    await this.formRepository.save(form);

    return {
      message: 'Form published successfully',
      form: this.formatForm(form),
    };
  }

  async unpublishForm(formId: string, userId: string) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to unpublish this form');
    }

    if (!form.isPublished) {
      throw new BadRequestException('Form is not published');
    }

    form.isPublished = false;
    form.publishedAt = null;
    await this.formRepository.save(form);

    return {
      message: 'Form unpublished successfully',
      form: this.formatForm(form),
    };
  }

  async getPublicForm(formId: string) {
    const form = await this.findFormById(formId);
    
    if (!form.isPublished) {
      throw new NotFoundException('Form not found or not published');
    }

    return {
      message: 'Form retrieved successfully',
      form: {
        id: form._id.toString(),
        title: form.title,
        description: form.description,
        fields: form.fields,
        colorTheme: form.colorTheme || 'purple',
      },
    };
  }

  async submitResponse(formId: string, responses: Record<string, any>, ipAddress?: string) {
    const form = await this.findFormById(formId);
    
    if (!form.isPublished) {
      throw new BadRequestException('Form is not accepting responses');
    }

    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!responses[field.id] || responses[field.id] === '') {
        throw new BadRequestException(`Field "${field.label}" is required`);
      }
    }

    const formResponse = this.formResponseRepository.create({
      formId: new ObjectId(formId),
      responses,
      ipAddress,
    });

    await this.formResponseRepository.save(formResponse);

    return {
      message: 'Response submitted successfully',
      responseId: formResponse._id.toString(),
    };
  }

  async getFormResponses(formId: string, userId: string) {
    const form = await this.findFormById(formId);
    
    if (form.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to view responses for this form');
    }

    const responses = await this.formResponseRepository.find({
      where: { formId: new ObjectId(formId) } as any,
      skip: 0,
      take: 10,
      order: { submittedAt: 'DESC' },
    });

    return {
      message: 'Responses retrieved successfully',
      form: {
        id: form._id.toString(),
        title: form.title,
      },
      responses: responses.map(response => ({
        id: response._id.toString(),
        responses: response.responses,
        submittedAt: response.submittedAt,
        ipAddress: response.ipAddress,
      })),
      totalResponses: responses.length,
    };
  }

  private async findFormById(formId: string): Promise<Form> {
    if (!ObjectId.isValid(formId)) {
      throw new BadRequestException('Invalid form ID');
    }

    const form = await this.formRepository.findOne({
      where: { _id: new ObjectId(formId) } as any,
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  private formatForm(form: Form) {
    return {
      id: form._id.toString(),
      title: form.title,
      description: form.description,
      fields: form.fields,
      isPublished: form.isPublished,
      publishedAt: form.publishedAt,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      colorTheme: form.colorTheme || 'purple',
    };
  }
}
