import axios from "axios"

const base =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

const api = axios.create({
  baseURL: `${base}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

export default api
