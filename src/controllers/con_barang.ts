import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllBarang = async (request: Request, response: Response) => {
    try {
      const allBarang = await prisma.barang.findMany();
  
      return response
        .json({
          status: true,
          data: allBarang,
          message: `Mengambil semua data barang`,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

export const addBarang = async (request: Request, response: Response) => {
    try {
      const { nama, category, location,quantity } = request.body;
  
      const newUser = await prisma.barang.create({
        data: { nama,category,location,quantity: parseInt(quantity) },
      });
  
      return response
        .json({
          status: true,
          data: newUser,
          message: `barang berhasil di buat`,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

  export const updateBarang = async (request: Request, response: Response) => {
    try {
      const { id_barang } = request.params;
      const { nama, category, location,quantity } = request.body;
  
      const findBarang = await prisma.barang.findFirst({
        where: { id_barang: Number(id_barang) },
      });
      if (!findBarang)
        return response
          .status(200)
          .json({ status: false, message:`User is not found` });
  
      const updateUser = await prisma.barang.update({
        data: {
          nama: nama || findBarang.nama,
          category: category || findBarang.category,
          location: location || findBarang.location,
          quantity: quantity ? Number(quantity) : findBarang.quantity
        },
        where: { id_barang: Number(id_barang) },
      });
    
      return response
        .json({
          status: true,
          message: `barang berhasil diubah`,
          data: updateUser,
        })
        .status(200);
    } catch (error) {
      return response
        .json({
          status: false,
          message: `There is an error. ${error}`,
        })
        .status(400);
    }
  };

  export const getBarang = async (request: Request, response: Response) => {
    try {
        const { id_barang } = request.params;

        const findBarang = await prisma.barang.findUnique({
            where: { id_barang: Number(id_barang) },
        });

        if (!findBarang) {
            return response
                .status(404)
                .json({ status: false, message: `Barang tidak ditemukan` });
        }

        return response
            .json({
                status: true,
                data: findBarang,
                message: `Data barang berhasil diambil`,
            })
            .status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `Terjadi kesalahan. ${error}`,
            })
            .status(400);
    }
};

export const deleteBarang = async (request: Request, response: Response) => {
  try {
      const { id_barang } = request.params;
      const allBarang = await prisma.barang.findMany({
        where: { is_deleted: false },
    });
    
      // Validasi ID: Pastikan `id_barang` ada dalam request dan merupakan angka
      if (!id_barang || isNaN(Number(id_barang))) {
          return response.status(400).json({
              status: false,
              message: "ID barang tidak valid",
          });
      }

      // Periksa apakah barang dengan ID tersebut ada
      const findBarang = await prisma.barang.findUnique({
          where: { id_barang: Number(id_barang) }, // Sesuaikan nama kolom jika berbeda
      });

      if (!findBarang) {
          return response.status(404).json({
              status: false,
              message: `Barang dengan ID ${id_barang} tidak ditemukan`,
          });
      }

      // Hapus barang dari database
      await prisma.barang.update({
        where: { id_barang: Number(id_barang) },
        data: { is_deleted: true },
    });

      return response.status(200).json({
          status: true,
          message: `Barang dengan ID ${id_barang} berhasil dihapus`,
      });
  } catch (error) {
      return response.status(400).json({
          status: false,
          message: `Terjadi kesalahan. ${(error as Error).message}`,
      });
  }
};
