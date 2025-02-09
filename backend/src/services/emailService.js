const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async enviarCredenciales({ email, nombre, usuario, password, loginUrl }) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Bienvenido - Credenciales de acceso',
            html: `
                <h1>Bienvenido ${nombre}</h1>
                <p>Se ha creado una cuenta para tu negocio en nuestro sistema.</p>
                <p>Tus credenciales de acceso son:</p>
                <ul>
                    <li><strong>Usuario:</strong> ${usuario}</li>
                    <li><strong>Contraseña:</strong> ${password}</li>
                </ul>
                <p>Puedes acceder al sistema desde: <a href="${loginUrl}">${loginUrl}</a></p>
                <p>Te recomendamos cambiar tu contraseña al primer inicio de sesión.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async enviarCodigoDescuento(email, codigo) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Sistema de Descuentos" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Tu Código de Descuento',
                html: `
                    <h1>¡Tu código de descuento está listo!</h1>
                    <p>Aquí tienes tu código de descuento:</p>
                    <h2 style="color: #4CAF50; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                        ${codigo}
                    </h2>
                    <p>Puedes usar este código en cualquiera de nuestros establecimientos participantes.</p>
                    <p>¡Gracias por tu preferencia!</p>
                `
            });
            console.log('Email enviado:', info);
            return true;
        } catch (error) {
            console.error('Error al enviar email:', error);
            return false;
        }
    }

    async sendBusinessCredentials(email, usuario, password) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Credenciales de acceso a su cuenta de negocio',
                html: `
                    <h1>Bienvenido a nuestro sistema</h1>
                    <p>Sus credenciales de acceso son:</p>
                    <p><strong>Usuario:</strong> ${usuario}</p>
                    <p><strong>Contraseña:</strong> ${password}</p>
                    <p>Por favor, cambie su contraseña después del primer inicio de sesión.</p>
                    <p>Acceda al sistema en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}</p>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw error;
        }
    }
}

module.exports = new EmailService(); 