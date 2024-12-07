import { NextFunction,Request,Response } from "express";
import Joi from "joi"

const analisisSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
    group_by: Joi.string().valid("category","location").required(),
    user: Joi.optional(),
});

export const validateAnalisis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analisisSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};

const analisisBorrowSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
    user: Joi.optional(),
});

export const validateBorrowAnalisis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analisisBorrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};