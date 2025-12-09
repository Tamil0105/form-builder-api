import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { FormField } from './form-field.interface';

@Entity('forms')
export class Form {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  userId: ObjectId;

  @Column('json')
  fields: FormField[];

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  publishedAt: Date | null;

  @Column({ default: 'purple' })
  colorTheme: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
