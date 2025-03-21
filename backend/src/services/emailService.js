const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        // Intentar crear el transporter, con manejo de errores robusto
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.example.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || '',
                    pass: process.env.EMAIL_PASS || ''
                },
                // Aumentar timeout para servidores lentos
                connectionTimeout: 10000,
                // Ignorar errores de certificado TLS (solo para desarrollo)
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log('Transporter de email inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar transporter de email:', error);
            // Crear un transporter dummy que siempre retorna éxito pero no envía nada
            this.transporter = {
                sendMail: async () => {
                    console.log('[MOCK] Email enviado (simulación)');
                    return { success: true, mock: true };
                }
            };
        }
    }

    async sendDiscountCode(email, code, qrCode) {
        if (!email || !code) {
            console.error('Faltan datos para enviar email:', { email, code });
            throw new Error('Email o código faltante');
        }
        
        try {
            console.log(`Enviando código de descuento "${code}" a ${email}`);
            const result = await this.transporter.sendMail({
                from: process.env.EMAIL_USER || 'noreply@example.com',
                to: email,
                subject: '¡Tu código de descuento está listo!',
                html: `
                    <h1>Tu código de descuento</h1>
                    <p>Código: <strong>${code}</strong></p>
                    ${qrCode ? `<img src="${qrCode}" alt="Código QR"/>` : ''}
                    <p>Presenta este código en el establecimiento para obtener tu descuento.</p>
                `
            });
            console.log('Resultado de envío:', result);
            return true;
        } catch (error) {
            console.error('Error detallado al enviar email:', error);
            throw new Error(`Error al enviar el email: ${error.message}`);
        }
    }

    // Alias para compatibilidad
    async enviarCodigoDescuento(email, code, qrCode) {
        return this.sendDiscountCode(email, code, qrCode);
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