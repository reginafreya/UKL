import express from "express"
import {analisis, borrowAnalysis } from "../controllers/con_analisis"
import {validateAnalisis, validateBorrowAnalisis } from "../middlewares/val_analisis"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.post(`/inventory/usage-report`,[verifyToken,verifyRole(["admin"]),validateAnalisis],analisis)
app.post(`/inventory/borrow-analysis`,[verifyToken,verifyRole(["admin"]),validateBorrowAnalisis],borrowAnalysis)

export default app