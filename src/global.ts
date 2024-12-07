import path from "path"
/** define path (adress) of root folder */
export const BASE_URL = `${path.join(__dirname, "../")}`
export const PORT = process.env.PORT //opsional
export const SECRET = process.env.SECRET
