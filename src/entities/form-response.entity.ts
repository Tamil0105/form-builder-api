import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('form_responses')
export class FormResponse {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  formId: ObjectId;

  @Column('json')
  responses: Record<string, any>;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;
}
