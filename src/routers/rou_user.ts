import express from "express";
import { getAlluser, createUser, updateUser, authentification, deleteUser } from "../controllers/con_user";
import { verifyAddAdmin, verifyAddUser, verifyAuthentification, verifyUpdateUser } from "../middlewares/val_user";
// import uploadFileUser from "../middlewares/userUpload";
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/`,getAlluser)
app.post(`/create/user`,[verifyAddUser],createUser);
app.post(`/create/admin`,[verifyAddAdmin],createUser);
app.put(`/update/:id`,[verifyUpdateUser],updateUser)
app.post(`/login`,[verifyAuthentification],authentification)
app.delete(`/delete/:id`,deleteUser)


export default app;