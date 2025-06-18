import { transporter } from '../config/nodemailer'

interface IEmail {
    email:string
    name: string,
    token: string
}


export class AuthEMail {
    static sendConfirmationEmail = async(user: IEmail) => {
         //Enviar el email
            const info = await transporter.sendMail({
                from: 'Uptask <admin@uptask.com>',
                to: user.email,
                subject: 'Uptask - confirma tu cuenta',
                text: 'Uptask - Confirma tu cuenta ',
                html: `
                    <p>Hola ${user.name}, has creado tu cuenta en Uptask, ya casi est todo listo, solo debes de cofirmar tu cuenta</p>
                    <p>Visita el siguiente enlace<p/>
                    <a href="${process.env.FRONTED_URL}/auth/confirm-account">Confirmar cuenta</a>
                    <p>Ingresa el código: <b>${user.token}</b><p/>
                    <p>Este token expira en 10 minutos</p>
                `
            })

            console.log('Mensaje enviado', info.messageId);
    }



    static sendPasswordResetToken = async(user: IEmail) => {
         //Enviar el email
            const info = await transporter.sendMail({
                from: 'Uptask <admin@uptask.com>',
                to: user.email,
                subject: 'Uptask - Restablece tu password',
                text: 'Uptask - Restablece tu password',
                html: `
                    <p>Hola ${user.name}, has solicitado restablecer tu password</p>
                    <p>Visita el siguiente enlace<p/>
                    <a href="${process.env.FRONTED_URL}/auth/new-password">Restablecer contraseña</a>
                    <p>Ingresa el código: <b>${user.token}</b><p/>
                    <p>Este token expira en 10 minutos</p>
                `
            })

            console.log('Mensaje enviado', info.messageId);
    }
}