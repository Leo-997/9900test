import * as Joi from 'joi';

export const dbConfigSchema = Joi.object({
  database: Joi.string().required(),
  host: Joi.string().required(),
  password: Joi.string().required(),
  port: Joi.number().required(),
  user: Joi.string().required(),
  ssl: Joi.object({
    ca: Joi.optional(),
    cert: Joi.optional(),
    key: Joi.optional(),
  }).optional(),
});
