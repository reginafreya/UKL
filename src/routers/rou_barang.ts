import express from "express";
import { verifyAddBarang, verifyUpdateBarang } from "../middlewares/val_barang";
import { getAllBarang, getBarang, addBarang, updateBarang, deleteBarang } from "../controllers/con_barang";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express()
app.use(express.json())

app.post(`/inventory`,[verifyToken,verifyRole(["admin"]),verifyAddBarang],addBarang)
app.put(`/update/:id_barang`,[verifyToken,verifyRole(["admin"]),verifyUpdateBarang],updateBarang)
app.get(`/inventory/:id_barang`,[verifyToken,verifyRole(["admin"])],getBarang)
app.get(`/getallinven`,[verifyToken,verifyRole(["admin"])],getAllBarang)
app.delete('/delete/:id_barang', [verifyToken, verifyRole(["admin"]), deleteBarang])

export default app;