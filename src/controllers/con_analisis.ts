import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const analisis = async (request: Request, response: Response) => {
    const { start_date, end_date, group_by } = request.body;

    if (!start_date || !end_date || !group_by) {
        return response.status(400).json({
            status: "error",
            message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response.status(400).json({
            status: "error",
            message: "Format tanggal tidak valid.",
        });
    }

    try {
        let usageReport;
        let additionalInfo: Array<{ id_barang: number; [key: string]: any }> = [];

        // Validasi kriteria pengelompokan
        if (group_by !== "category" && group_by !== "location") {
            return response.status(400).json({
                status: "error",
                message: "Kriteria pengelompokan tidak valid. Gunakan 'category' atau 'location'.",
            });
        }

        // Query grup barang
        usageReport = await prisma.peminjaman.groupBy({
            by: ["id_barang"],
            where: {
                borrow_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id_barang: true,
            },
        });

        const ids = usageReport.map((item) => item.id_barang);
        additionalInfo = await prisma.barang.findMany({
            where: {
                id_barang: { in: ids },
            },
            select: group_by === "category"
                ? { id_barang: true, category: true }
                : { id_barang: true, location: true },
        });

        // Query barang yang sudah dikembalikan
        const returnedItems = await prisma.peminjaman.groupBy({
            by: ["id_barang"],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                return_date: {
                    lte: endDate,
                },
            },
            _count: {
                id_barang: true,
            },
        });

        // Pemrosesan analisis penggunaan
        const usageAnalysis = usageReport.map((item) => {
            const info = additionalInfo.find((info) => info.id_barang === item.id_barang);
            const returnedItem = returnedItems.find((returned) => returned.id_barang === item.id_barang);
            const totalReturned = returnedItem?._count?.id_barang || 0;
            const itemsInUse = item._count.id_barang - totalReturned;

            return {
                group: info ? info[group_by as keyof typeof info] : "Unknown",
                total_borrowed: item._count.id_barang,
                total_returned: totalReturned,
                items_in_use: itemsInUse,
            };
        });

        response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split("T")[0],
                    end_date: endDate.toISOString().split("T")[0],
                },
                usage_analysis: usageAnalysis,
            },
            message: "Laporan penggunaan barang berhasil dihasilkan.",
        });
    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};

  export const borrowAnalysis = async (request: Request, response: Response) => {
      const { start_date, end_date } = request.body;
  
      if (!start_date || !end_date) {
          return response.status(400).json({
              status: "error",
              message: "Tanggal mulai dan tanggal akhir harus diisi.",
          });
      }
  
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return response.status(400).json({
              status: "error",
              message: "Format tanggal tidak valid.",
          });
      }
  
      try {
          const frequentlyBorrowedItems = await prisma.peminjaman.groupBy({
              by: ['id_barang'],
              where: {
                  borrow_date: {
                      gte: startDate,
                  },
                  return_date: {
                      lte: endDate,
                  },
              },
              _count: {
                  id_barang: true,
              },
              orderBy: {
                  _count: {
                      id_barang: 'desc',
                  }
              },
          });
  
          const frequentlyBorrowedItemDetails = await Promise.all(frequentlyBorrowedItems.map(async item => {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: item.id_barang },
                  select: { id_barang: true, nama: true, category: true },
              });
              return barang ? {
                  item_id: item.id_barang,
                  name: barang.nama,
                  category: barang.category,
                  total_borrowed: item._count.id_barang,
              } : null;
          })).then(results => results.filter(item => item !== null)); 
  
          const inefficientItems = await prisma.peminjaman.groupBy({
              by: ['id_barang'],
              where: {
                  borrow_date: {
                      gte: startDate,
                  },
                  return_date: {
                      gt: endDate
                  }
              },
              _count: {
                  id_barang: true,
              },
              _sum: {
                  quantity: true,
              },
              orderBy: {
                  _count: {
                      id_barang: 'desc',
                  }
              },
          });
  
          const inefficientItemDetails = await Promise.all(inefficientItems.map(async item => {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: item.id_barang },
                  select: { id_barang: true, nama: true, category: true },
              });
              return barang ? {
                  item_id: item.id_barang,
                  name: barang.nama,
                  category: barang.category,
                  total_borrowed: item._count.id_barang,
                  total_late_returns: item._sum.quantity ?? 0, 
              } : null;
          })).then(results => results.filter(item => item !== null)); 
  
          response.status(200).json({
              status: "success",
              data: {
                  analysis_period: {
                      start_date: start_date,
                      end_date: end_date
                  },
                  frequently_borrowed_items: frequentlyBorrowedItemDetails,
                  inefficient_items: inefficientItemDetails
              },
              message: "Analisis barang berhasil dihasilkan.",
          });
      } catch (error) {
          response.status(500).json({
              status: "error",
              message: `Terjadi kesalahan. ${(error as Error).message}`,
          });
      }
  };