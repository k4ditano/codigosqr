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
            },
            tls: {
                rejectUnauthorized: false // Para desarrollo, ajustar en producción
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
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Credenciales de acceso a su negocio',
                html: `
                    <h1>Bienvenido al sistema</h1>
                    <p>Sus credenciales de acceso son:</p>
                    <ul>
                        <li><strong>Usuario:</strong> ${usuario}</li>
                        <li><strong>Contraseña:</strong> ${password}</li>
                    </ul>
                    <p>Acceda al sistema en: <a href="http://145.223.100.119">http://145.223.100.119</a></p>
                    <p>Por favor, cambie su contraseña después del primer inicio de sesión.</p>
                `
            });
            return info;
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw error;
        }
    }

    async notificarNuevoFormulario({ emailNegocio, nombreNegocio, datosFormulario }) {
        try {
            console.log('Iniciando envío de notificación por email - Datos:', {
                destino: emailNegocio,
                negocio: nombreNegocio,
                remitente: process.env.EMAIL_USER
            });

            const info = await this.transporter.sendMail({
                from: `"Sistema de Descuentos" <${process.env.EMAIL_USER}>`,
                to: emailNegocio,
                subject: `Nuevo Formulario de Contacto - ${nombreNegocio}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2c3e50; text-align: center;">Nuevo Formulario de Contacto</h1>
                        <p style="font-size: 16px;">Has recibido un nuevo formulario de contacto para <strong>${nombreNegocio}</strong>.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h2 style="color: #34495e; margin-top: 0;">Datos del formulario:</h2>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 10px;"><strong>Nombre:</strong> ${datosFormulario.nombre}</li>
                                <li style="margin-bottom: 10px;"><strong>Email:</strong> ${datosFormulario.email}</li>
                                <li style="margin-bottom: 10px;"><strong>Teléfono:</strong> ${datosFormulario.telefono}</li>
                                <li style="margin-bottom: 10px;"><strong>Mensaje:</strong> ${datosFormulario.mensaje}</li>
                            </ul>
                        </div>
                        
                        <p style="color: #7f8c8d; font-size: 14px;">Fecha y hora de recepción: ${new Date().toLocaleString('es-ES')}</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="margin-bottom: 5px;">Accede a tu panel para ver más detalles:</p>
                            <a href="http://145.223.100.119/business" 
                               style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Ir al Panel de Administración
                            </a>
                        </div>
                    </div>
                `
            });

            console.log('Email enviado exitosamente:', {
                messageId: info.messageId,
                response: info.response
            });

            return true;
        } catch (error) {
            console.error('Error al enviar email de notificación:', {
                error: error.message,
                stack: error.stack,
                emailDestinatario: emailNegocio
            });
            return false;
        }
    }
}

module.exports = EmailService;
