import type {Request, Response} from 'express'
import bcrypt from "bcrypt"
import User from '../models/User'
import { hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'

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
            //Hashear password
            user.password = await hashPassword(password)

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada. revisa tu email para confirmarla')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}