import express from "express";
import morgan from "morgan";
import dotenv from 'dotenv'
import { corsConfig } from "./config/cors";
import cors from 'cors';
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes"



dotenv.config()

connectDB()

const app = express()

app.use(cors(corsConfig))


//Logging
app.use(morgan('dev'))

app.use(express.json())

//Routes
app.use('/api/projects', projectRoutes)

export default app