const QRCode = require('qrcode');

class QRService {
    async generateQR(data) {
        try {
            console.log('Generando QR para:', data);
            const qrCode = await QRCode.toDataURL(data);
            return qrCode;
        } catch (error) {
            console.error('Error al generar QR:', error);
            throw new Error('Error al generar el código QR');
        }
    }

    async generateBusinessQR(businessId, baseUrl) {
        try {
            if (!businessId) {
                throw new Error('ID de negocio es requerido');
            }
            console.log('Generando QR para negocio:', businessId);
            const formUrl = `${baseUrl}/formulario/${businessId}`;
            console.log('URL del formulario:', formUrl);
            return await this.generateQR(formUrl);
        } catch (error) {
            console.error('Error al generar QR de negocio:', error);
            throw error;
        }
    }

    async generateDiscountQR(discountCode, negocioId) {
        try {
            // Generamos la URL para validar el código
            const validationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/validar/${discountCode}`;
            return await this.generateQR(validationUrl);
        } catch (error) {
            console.error('Error al generar QR de descuento:', error);
            throw new Error('Error al generar el código QR del descuento');
        }
    }
}

module.exports = new QRService(); 