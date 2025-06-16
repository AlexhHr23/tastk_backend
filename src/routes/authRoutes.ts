import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";


const router = Router()

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('EL nombre no puede ir vacio'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña debe tener minimo 8 caracteres'),
    body('password_confimation').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Las contreñas no son iguales')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.createAccount
)

export default router