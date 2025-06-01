import type { Request, Response } from "express";


export class TaskController {
    static createTask = async(req: Request, res: Response) => {
        try {
            
            const {projectId} = req.params
            console.log(projectId);
        } catch (error) {
            console.log(error);
        }
    }
}