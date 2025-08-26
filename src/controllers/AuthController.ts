import type { Request, Response } from 'express'
import bcrypt from "bcrypt"
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEMail } from '../emails/AuthEmails'
import { generateJWT } from '../utils/jwt'



export class AuthController {


    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //Prevenir duplicados
            const userExists = await User.findOne({ email })

            if (userExists) {
                const error = new Error('Ya existe un usuario con ese email')
                res.status(409).json({ error: error.message })
            }

            //Crear usuario
            const user = new User(req.body)
            //Hashear password
            user.password = await hashPassword(password)

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEMail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })


            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada. revisa tu email para confirmarla')
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await Promise.allSettled([
                user.save(),
                tokenExist.deleteOne()
            ])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
            }

            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //Enviar email
                AuthEMail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, hemos un enviado un e-mail de confirmación')
                res.status(401).json({ error: error.message })
            }

            //Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                res.status(404).json({ error: error.message })
            }

            const token = generateJWT({ id: user.id })

            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }



    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Usuario existe
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
            }

            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                res.status(403).json({ error: error.message })
            }


            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEMail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })


            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envio un nuevo token a tu email')
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }



    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Usuario existe
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
            }

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            //Enviar email
            AuthEMail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu e-mail para instrucciones')
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error' })
        }
    }



    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
            }

            res.send('Token válido, define tu nuevo password')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExist = await Token.findOne({ token })
            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            await Promise.allSettled([
                user.save(),
                tokenExist.deleteOne()
            ])
            res.send('La contraseña ha sido cambiado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }



    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    /**Profile */

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExits = await User.findOne({ email })
        if (userExits && userExits.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado')
            res.status(409).json({ error: error.message })
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body()

        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            res.status(401).json({ error: error.message })
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modifó correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }
}