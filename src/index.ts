import express from 'express'
import cors from 'cors'
import userRoute from './routers/rou_user' //buat baru
import barangRoute from './routers/rou_barang'
import peminjamanRoute from './routers/rou_peminjaman'
import analisisRoute from './routers/rou_analisis'

const PORT: number = 8000
const app = express()
app.use(cors())

app.use(`/api`,userRoute)//buat baru
app.use(`/barang`,barangRoute)
app.use(`/borrowreturn`, peminjamanRoute)
app.use('/report', analisisRoute)

app.listen(PORT, () => {
    console.log(`[Server]: Server is running at http://localhost:${PORT}`);
}) 

