"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageMeta = getImageMeta;
exports.downloadImage = downloadImage;
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
const path_1 = __importDefault(require("path"));
const logger_1 = require("../logger");
const common = __importStar(require("./common"));
const productionURL = 'https://fw.ota.homesmart.ikea.com/check/update/prod';
const NS = 'zhc:ota:dirigera';
const caCertificatePath = path_1.default.resolve(__dirname, './dirigera_root.pem');
/**
 * Helper functions
 */
async function getAxios() {
    const caBundle = await common.processCustomCaBundle(caCertificatePath);
    return common.getAxios(caBundle);
}
async function getImageMeta(current, device) {
    logger_1.logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const url = productionURL;
    const { data: images } = await (await getAxios()).get(url);
    if (!images?.length) {
        throw new Error(`TradfriOTA: Error getting firmware page at ${url}`);
    }
    const image = images.find((i) => i.fw_image_type === current.imageType);
    if (!image) {
        return null;
    }
    // Most images are fw_type 2, which doesn't include a separate field for the version.
    // Therefore we just grab the version out of the URL.
    if (image.fw_type !== 2) {
        throw new Error(`DirigeraOTA: fw_image_type ${current.imageType} uses unsupported fw_type ${image.fw_type}`);
    }
    let fileVersion = 0;
    const versionBits = image.fw_binary_url.match(/_prod_v([0-9]+)_/);
    if (versionBits) {
        fileVersion = parseInt(versionBits[1], 10);
    }
    return {
        fileVersion: fileVersion,
        url: image.fw_binary_url,
        sha3_256: image.fw_sha3_256,
    };
}
async function downloadImage(meta) {
    return await (await getAxios()).get(meta.url, { responseType: 'arraybuffer' });
}
/**
 * Interface implementation
 */
async function isUpdateAvailable(device, requestPayload = null) {
    return await common.isUpdateAvailable(device, requestPayload, common.isNewImageAvailable, getImageMeta);
}
async function updateToLatest(device, onProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta, downloadImage);
}
exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
//# sourceMappingURL=dirigera.js.map