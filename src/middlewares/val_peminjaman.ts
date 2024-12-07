import { Prisma, PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const prisma = new PrismaClient

// Schema untuk validasi peminjaman
const borrowSchema = Joi.object({
    id_user: Joi.number().required().messages({
        "any.required": "ID user wajib diisi.",
        "number.base": "ID user harus berupa angka.",
    }),
    id_barang: Joi.number().required().messages({
        "any.required": "ID barang wajib diisi.",
        "number.base": "ID barang harus berupa angka.",
    }),
    borrow_date: Joi.date().iso().required().messages({
        "any.required": "Tanggal peminjaman wajib diisi.",
        "date.base": "Tanggal peminjaman harus berupa format tanggal yang valid.",
        "date.format": "Gunakan format ISO untuk tanggal peminjaman.",
    }),
    return_date: Joi.date().iso().required().messages({
        "any.required": "Tanggal pengembalian wajib diisi.",
        "date.base": "Tanggal pengembalian harus berupa format tanggal yang valid.",
        "date.format": "Gunakan format ISO untuk tanggal pengembalian.",
    }),
    user: Joi.optional(), // Field opsional
});

// Middleware untuk validasi peminjaman
export const validateBorrow = (req: Request, res: Response, next: NextFunction) => {
    const { error } = borrowSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join("\n"), // Rapi per baris
        });
    }
    next();
};

// Schema untuk validasi pengembalian
const returnSchema = Joi.object({
    borrow_id: Joi.number().required().messages({
        "any.required": "Borrow ID wajib diisi.",
        "number.base": "Borrow ID harus berupa angka.",
    }),
    return_date: Joi.date().iso().required().messages({
        "any.required": "Tanggal pengembalian wajib diisi.",
        "date.base": "Tanggal pengembalian harus berupa format tanggal yang valid.",
        "date.format": "Gunakan format ISO untuk tanggal pengembalian.",
    }),
    status: Joi.string()
        .valid("kembali", "hilang")
        .required()
        .messages({
            "any.required": "Status wajib diisi.",
            "string.base": "Status harus berupa string.",
            "any.only": "Status hanya bisa berupa 'kembali' atau 'hilang'.",
        }),
    user: Joi.optional(), // Field opsional
});

// Middleware untuk validasi pengembalian
export const validateReturnDate = async (req: Request, res: Response, next: NextFunction) => {
    const { borrow_id, return_date } = req.body;

    try {
        // Ambil data peminjaman berdasarkan borrow_id
        const peminjaman = await prisma.peminjaman.findUnique({
            where: { id_peminjaman: Number(borrow_id) },
            select: { return_date: true },
        });

        if (!peminjaman || new Date(return_date).toISOString() !== new Date(peminjaman.return_date).toISOString()) {
            return res.status(400).json({
                status: false,
                message: peminjaman
                    ? "Tanggal pengembalian harus sama dengan tanggal yang sudah tercatat."
                    : "Data peminjaman tidak ditemukan",
            });
        }        

        next();
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(500).json({
                status: false,
                message: `Kesalahan database: ${error.message}`,
            });
        }
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan validasi. ${(error as Error).message}`,
        });
    }    
};
