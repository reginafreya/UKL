import { NextFunction,Request,Response } from "express";
import Joi from "joi"

const addDataSchema = Joi.object({
    nama: Joi.string().required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    user: Joi.optional(),
  });

  export const verifyAddBarang = (request: Request, response: Response, next: NextFunction) => {
    const {error} = addDataSchema.validate(request.body,{abortEarly: false})
    
    if (error) {
        
        return response.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join()
        })
    }
    return next()
}

const updateDataSchema = Joi.object({
    nama: Joi.string().optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    quantity: Joi.number().optional(),
    user: Joi.optional(),
  });

  export const verifyUpdateBarang = (request: Request, response: Response, next: NextFunction) => {
    const {error} = updateDataSchema.validate(request.body,{abortEarly: false})
    
    if (error) {
        
        return response.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join()
        })
    }
    return next()
}
