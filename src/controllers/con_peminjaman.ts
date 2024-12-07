import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const borrowBarang = async (request: Request, response: Response) => {
    try {
        const { id_user, id_barang, borrow_date, return_date } = request.body;
        const quantity = 1;

        // Validasi: Pastikan tanggal kembali >= tanggal pinjam
        if (new Date(return_date) < new Date(borrow_date)) {
            return response.status(400).json({
                status: false,
                message: "Tanggal kembali tidak boleh lebih awal dari tanggal pinjam",
            });
        }

        // Logika peminjaman (kode sebelumnya tetap sama)
        const findUser = await prisma.user.findFirst({
            where: { id: Number(id_user) },
        });
        if (!findUser) {
            return response.status(404).json({
                status: false,
                message: `User dengan id: ${id_user} tidak ditemukan`,
            });
        }

        const findBarang = await prisma.barang.findFirst({
            where: { id_barang: Number(id_barang) },
        });
        if (!findBarang) {
            return response.status(404).json({
                status: false,
                message: `Barang dengan id: ${id_barang} tidak ditemukan`,
            });
        }

        const barang = await prisma.barang.findUnique({
            where: { id_barang: Number(id_barang) },
            select: { quantity: true },
        });

        if (!barang || barang.quantity === 0) {
            return response.status(400).json({
                status: false,
                message: "Barang kosong",
            });
        }

        const newBorrow = await prisma.peminjaman.create({
            data: {
                id_user: Number(id_user),
                id_barang: Number(id_barang),
                quantity: Number(quantity),
                borrow_date: new Date(borrow_date),
                return_date: new Date(return_date),
            },
        });

        await prisma.barang.update({
            where: {
                id_barang: Number(id_barang),
            },
            data: {
                quantity: {
                    decrement: Number(quantity),
                },
            },
        });

        return response.status(200).json({
            status: true,
            data: newBorrow,
            message: "Peminjaman barang berhasil dicatat",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};


export const returnBarang = async (request: Request, response: Response) => {
    try {
        const { borrow_id, return_date, status } = request.body;

        // Cari data peminjaman berdasarkan borrow_id
        const peminjaman = await prisma.peminjaman.findUnique({
            where: { id_peminjaman: Number(borrow_id) },
            select: { quantity: true, status: true, id_barang: true, return_date: true },
        });

        if (!peminjaman) {
            return response.status(404).json({
                status: false,
                message: "Data peminjaman tidak ditemukan",
            });
        }

        // Validasi jika barang sudah dikembalikan
        if (peminjaman.status === "kembali") {
            return response.status(400).json({
                status: false,
                message: "Barang sudah dikembalikan dan tidak bisa dikembalikan lagi.",
            });
        }

        // Validasi `return_date` agar sama dengan tanggal yang tercatat

        if (new Date(return_date).toISOString() !== new Date(peminjaman.return_date).toISOString()) {
            return response.status(400).json({
                status: false,
                message: "Tanggal pengembalian harus sama dengan tanggal yang sudah tercatat.",
            });
        }
        
        // Update status peminjaman
        const updatedPeminjaman = await prisma.peminjaman.update({
            where: { id_peminjaman: Number(borrow_id) },
            data: {
                return_date: new Date(return_date), // Tidak akan berubah karena validasi di atas
                status: status,
            },
        });

        // Tambahkan stok barang kembali
        const updateBarang = await prisma.barang.update({
            where: { id_barang: Number(peminjaman.id_barang) },
            data: {
                quantity: { increment: peminjaman.quantity },
            },
        });

        return response.status(200).json({
            status: true,
            data: updatedPeminjaman,
            message: "Pengembalian barang berhasil dicatat",
        });
    } catch (error) {
        return response.status(400).json({
            status: false,
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};
