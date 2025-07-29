import * as Joi from 'joi';

export const RegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'CUSTOMER', 'COURIER').optional(),
});

export class RegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'COURIER';
}