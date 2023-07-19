import Joi from '@hapi/joi';

// Validatsiya uchun schema (tasnif)
export const dataValidation = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
});