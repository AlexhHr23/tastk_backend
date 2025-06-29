import type { Request, Response } from "express"
import Project from "../models/Project"


export class ProjectController {

    static createProjects = async (req: Request, res: Response) => {

        const project = new Project(req.body)

        //Asigna un manager
        project.manager = req.user.id

        try {

            await project.save()
            res.send('Proyecto creado correctamente')

        } catch (error) {
            console.log(error);
        }

    }

    static getAllProjects = async (req: Request, res: Response) => {

        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error);
        }

    }
    static getProjectByID = async (req: Request, res: Response) => {

        const { id } = req.params
        try {
            const project = await Project.findById(id).populate('tasks')
            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
                 const error = new Error('Acción no valida')
                res.status(404).json({ error: error.message })
                return
            }
            res.json(project)
        } catch (error) {
            console.log(error);
        }

    }


    static updateProject = async (req: Request, res: Response) => {

        const { id } = req.params
        try {
            const project = await Project.findById(id)

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if(project.manager.toString() !== req.user.id.toString()){
                 const error = new Error('Solo el manager puede actualizar un proyecto')
                res.status(404).json({ error: error.message })
                return
            }

            project.projectName = req.body.projectName
            project.clientName = req.body.clientName
            project.description = req.body.description
            await project.save()
            res.send('Proyecto actualizado')
        } catch (error) {
            console.log(error);
        }

    }
    static deleteProject = async (req: Request, res: Response) => {

        const { id } = req.params
        try {
            const project = await Project.findById(id)
            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if(project.manager.toString() !== req.user.id.toString()){
                 const error = new Error('Solo el manager elimiar un proyecto')
                res.status(404).json({ error: error.message })
                return
            }
            await project.deleteOne()
            res.send('Proyecto elimnadio ')
        } catch (error) {
            console.log(error);
        }

    }

}