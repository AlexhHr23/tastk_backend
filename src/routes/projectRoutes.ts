import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auht";
import { TeamMemberController } from "../controllers/TeamController";


const router = Router()

router.use(authenticate)

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

router.get('/',
    ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.getProjectByID
)



router.put('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('Las descripción del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.updateProject
)


router.delete('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.deleteProject
)


/** Rotues for task */
router.param('projectId', projectExist)

router.post('/:projectId/tasks',
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('Las descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)


router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)


router.param('taskId', taskExist)
router.param('taskId', taskBelongsToProject)


router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization, 
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('Las descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)



router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('status')
        .notEmpty().withMessage('EL estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/**Rutes for teams */
router.post('/:projectId/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
        handleInputErrors,
        TeamMemberController.findMemberByEmail
)


router.get('/:projectId/team',
        TeamMemberController.getProjectTeam
)


router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('ID no válido'),
        handleInputErrors,
        TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('ID no válido'),
        handleInputErrors,
        TeamMemberController.removeMemberById
)

export default router