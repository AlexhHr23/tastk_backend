import express from "express";
import dotenv from 'dotenv'
import { corsConfig } from "./config/cors";
import cors from 'cors';
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes"



dotenv.config()

connectDB()

const app = express()

app.use(cors(corsConfig))

app.use(express.json())

//Routes
app.use('/api/projects', projectRoutes)

export default app