import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";


const router  = Router()

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('Las descripción del proyecto es obligatoria'),
    
    handleInputErrors,
    ProjectController.createProjects
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.getProjectByID
)

export default router