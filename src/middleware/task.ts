import { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {

    namespace Express {
        interface Request {
            task: ITask
        }
    }

}

export const taskExist = async(req: Request, res: Response, next: NextFunction) => {

    try {

          const {taskId} = req.params
                    const task = await Task.findById(taskId)
        
                    if (!task) {
                        const error = new Error('Tarea no encontrada')
                        res.status(404).json({ error: error.message })
                        return
                    }
                    
                    req.task = task
                    next()
                    return

    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }

} 