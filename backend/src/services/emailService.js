const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendDiscountCode(email, code, qrCode) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: '¡Tu código de descuento está listo!',
                html: `
                    <h1>Tu código de descuento</h1>
                    <p>Código: <strong>${code}</strong></p>
                    <img src="${qrCode}" alt="Código QR"/>
                    <p>Presenta este código en el establecimiento para obtener tu descuento.</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw new Error('Error al enviar el código de descuento por email');
        }
    }

    async sendBusinessCredentials(email, username, password) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Credenciales de acceso al sistema',
                html: `
                    <h1>Bienvenido al Sistema de Descuentos</h1>
                    <p>Sus credenciales de acceso son:</p>
                    <p>Usuario: <strong>${username}</strong></p>
                    <p>Contraseña: <strong>${password}</strong></p>
                    <p>Por favor, cambie su contraseña al iniciar sesión por primera vez.</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw new Error('Error al enviar las credenciales por email');
        }
    }
}

module.exports = new EmailService(); 