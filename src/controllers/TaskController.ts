import type { Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";


export class TaskController {
    static createTask = async(req: Request, res: Response) => {
      
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([
                task.save(),
                req.project.save()
            ])
            res.send('Tarea creada correctamente')
            console.log(task);
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTasks = async(req: Request,  res: Response) => {
        try {
            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskById = async( req: Request, res: Response) => {
        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId)
            if(!task) {
                const error = new Error('Tarea no encontrada')
                res.status(404).json({error: error.message})
                return
            }
            if(task.project.toString() !== req.project.id) {
                const error = new Error('Acción no valida')
                res.status(400).json({error: error.message})
                return
            }
            res.json(task)
            return
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async( req: Request, res: Response) => {
        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId, req.body)
            if(!task) {
                const error = new Error('Tarea no encontrada')
                res.status(404).json({error: error.message})
                return
            }
            if(task.project.toString() !== req.project.id) {
                const error = new Error('Acción no valida')
                res.status(400).json({error: error.message})
                return
            }

            task.name = req.body.name
            task.description = req.body.description
            await task.save()
            res.send('Tarea actualizada correctamente')
            return
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }


    static deleteTask = async( req: Request, res: Response) => {
        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId)
            if(!task) {
                const error = new Error('Tarea no encontrada')
                res.status(404).json({error: error.message})
                return
            }
            // if(task.project.toString() !== req.project.id) {
            //     const error = new Error('Acción no valida')
            //     res.status(400).json({error: error.message})
            //     return
            // }
            req.project.tasks = req.project.tasks.filter(
                (task) => task.toString() !== taskId
              );

            await Promise.allSettled([
                task.deleteOne(),
                req.project.save()
            ])
            res.send('Tarea eliminada correctamente')
            return
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateStatus =  async (req: Request, res: Response) => {

        try {
            const {taskId} = req.params
            const task = await Task.findById(taskId)
            if(!task) {
                const error = new Error('Tarea no encontrada')
                res.status(404).json({error: error.message})
                return
            }
            const {status} = req.body
            task.status = status
            await task.save()
            res.send('Tarea actualizada')
            return
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }

    }
}