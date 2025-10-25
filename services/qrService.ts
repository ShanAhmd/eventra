
// This would typically be an import from an NPM package
// In this environment, we assume it's available globally or via a script tag.
// For the purpose of this file, we'll declare it to satisfy TypeScript.
declare const QRCode: {
    toDataURL(text: string, options?: any): Promise<string>;
};

import { QrCodeData } from '../types';

export const generateQRCode = async (data: QrCodeData): Promise<string> => {
    try {
        const dataString = JSON.stringify(data);
        const qrCodeUrl = await QRCode.toDataURL(dataString, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000FF',
                light: '#FFFFFFFF',
            },
        });
        return qrCodeUrl;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to generate QR code.');
    }
};
