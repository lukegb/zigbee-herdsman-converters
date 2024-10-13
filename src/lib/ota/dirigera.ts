import path from 'path';

import {logger} from '../logger';
import {KeyValue, Ota, Zh} from '../types';
import * as common from './common';

const productionURL = 'https://fw.ota.homesmart.ikea.com/check/update/prod';

const NS = 'zhc:ota:dirigera';
const caCertificatePath = path.resolve(__dirname, './dirigera_root.pem');

/**
 * Helper functions
 */
async function getAxios() {
    const caBundle = await common.processCustomCaBundle(caCertificatePath);
    return common.getAxios(caBundle);
}

export async function getImageMeta(current: Ota.ImageInfo, device: Zh.Device): Promise<Ota.ImageMeta> {
    logger.debug(`Call getImageMeta for ${device.modelID}`, NS);
    const url = productionURL;
    const {data: images} = await (await getAxios()).get(url);

    if (!images?.length) {
        throw new Error(`TradfriOTA: Error getting firmware page at ${url}`);
    }

    const image = images.find((i: KeyValue) => i.fw_image_type === current.imageType);

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

export async function downloadImage(meta: Ota.ImageMeta): Promise<{data: Buffer}> {
    return await (await getAxios()).get(meta.url, {responseType: 'arraybuffer'});
}

/**
 * Interface implementation
 */

export async function isUpdateAvailable(device: Zh.Device, requestPayload: Ota.ImageInfo = null) {
    return await common.isUpdateAvailable(device, requestPayload, common.isNewImageAvailable, getImageMeta);
}

export async function updateToLatest(device: Zh.Device, onProgress: Ota.OnProgress) {
    return await common.updateToLatest(device, onProgress, common.getNewImage, getImageMeta, downloadImage);
}

exports.isUpdateAvailable = isUpdateAvailable;
exports.updateToLatest = updateToLatest;
