import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const qrService = {
  generateToken(): string {
    return uuidv4();
  },

  async generateQRDataUrl(token: string): Promise<string> {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
    return dataUrl;
  }
};
