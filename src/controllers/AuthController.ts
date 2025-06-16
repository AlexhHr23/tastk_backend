import type {Request, Response} from 'express'
import bcrypt from "bcrypt"
import User from '../models/User'
import { hashPassword } from '../utils/auth'

export class AuthController {
    

    static createAccount = async(req : Request, res: Response) => {
        try {
            const { password, email } = req.body

            //Prevenir duplicados
            const userExists = await User.findOne({email})

            if(userExists) {
                const error = new Error('Ya existe un usuario con ese email')
                res.status(409).json({error: error.message})
            }

            //Crear usuario
            const user = new User(req.body)
            user.password = await hashPassword(password)
            await user.save()
            res.send('Cuenta creada. revisa tu email para confirmarla')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}