import express from "express";
import {  validateBorrow, validateReturnDate} from "../middlewares/val_peminjaman";
import { borrowBarang, returnBarang } from "../controllers/con_peminjaman"
import { verifyRole, verifyToken } from "../middlewares/authorization";
import { validateAnalisis, validateBorrowAnalisis } from "../middlewares/val_analisis";
import { analisis, borrowAnalysis } from "../controllers/con_analisis";



const app = express()
app.use(express.json())

app.post("/inventory/borrow",[verifyToken,verifyRole(["admin","user"]),validateBorrow], borrowBarang)
app.post("/inventory/return",[verifyToken,verifyRole(["admin","user"]),validateReturnDate],returnBarang )

export default app;