import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createForm(
    @CurrentUser() user: any,
    @Body() createFormDto: CreateFormDto,
  ) {
    return this.formsService.createForm(user.userId, createFormDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserForms(@CurrentUser() user: any) {
    return this.formsService.getUserForms(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getForm(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.getForm(id, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateForm(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.updateForm(id, user.userId, updateFormDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteForm(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.deleteForm(id, user.userId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publishForm(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.publishForm(id, user.userId);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublishForm(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.unpublishForm(id, user.userId);
  }

  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  async getFormResponses(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formsService.getFormResponses(id, user.userId);
  }

  // Public endpoints
  @Get('public/:id')
  async getPublicForm(@Param('id') id: string) {
    return this.formsService.getPublicForm(id);
  }

  @Post('public/:id/submit')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async submitResponse(
    @Param('id') id: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.formsService.submitResponse(id, submitResponseDto.responses, ipAddress);
  }
}
