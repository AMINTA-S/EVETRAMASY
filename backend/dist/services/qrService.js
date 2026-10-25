"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
exports.qrService = {
    generateToken() {
        return (0, uuid_1.v4)();
    },
    async generateQRDataUrl(token) {
        const dataUrl = await qrcode_1.default.toDataURL(token, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' }
        });
        return dataUrl;
    }
};
//# sourceMappingURL=qrService.js.map