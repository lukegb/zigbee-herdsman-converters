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
const fromZigbee_1 = __importDefault(require("../converters/fromZigbee"));
const toZigbee_1 = __importDefault(require("../converters/toZigbee"));
const exposes = __importStar(require("../lib/exposes"));
const globalStore = __importStar(require("../lib/store"));
const e = exposes.presets;
const ea = exposes.access;
const poll = async (device) => {
    try {
        const endpoint = device.getEndpoint(6);
        const options = { transactionSequenceNumber: 0, srcEndpoint: 8, disableResponse: true, disableRecovery: true };
        await endpoint.command('genOnOff', 'toggle', {}, options);
    }
    catch {
        // device is lost, need to permit join
    }
};
const definitions = [
    {
        zigbeeModel: ['TI0001          '],
        model: 'TI0001',
        description: 'Zigbee switch (1, 2, 3, 4 gang)',
        vendor: 'Livolo',
        exposes: [
            e.switch().withEndpoint('left'),
            e.switch().withEndpoint('right'),
            e.switch().withEndpoint('bottom_left'),
            e.switch().withEndpoint('bottom_right'),
        ],
        fromZigbee: [fromZigbee_1.default.livolo_switch_state, fromZigbee_1.default.livolo_switch_state_raw, fromZigbee_1.default.livolo_new_switch_state_4gang],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off],
        endpoint: (device) => {
            return { left: 6, right: 6, bottom_left: 6, bottom_right: 6 };
        },
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => await poll(device), 300 * 1000);
                    globalStore.putValue(device, 'interval', interval);
                }
            }
            if (data.cluster === 'genPowerCfg' && data.type === 'raw') {
                const dp = data.data[10];
                if (data.data[0] === 0x7a && data.data[1] === 0xd1) {
                    const endpoint = device.getEndpoint(6);
                    if (dp === 0x01) {
                        const options = {
                            manufacturerCode: 0x1ad2,
                            disableDefaultResponse: true,
                            disableResponse: true,
                            reservedBits: 3,
                            direction: 1,
                            writeUndiv: true,
                        };
                        const payload = { 0x2002: { value: [0, 0, 0, 0, 0, 0, 0], type: 0x0e } };
                        await endpoint.readResponse('genPowerCfg', 0xe9, payload, options);
                    }
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-switch'],
        model: 'TI0001-switch',
        description: 'Zigbee switch 1 gang',
        vendor: 'Livolo',
        fromZigbee: [fromZigbee_1.default.livolo_new_switch_state, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off, toZigbee_1.default.power_on_behavior],
        exposes: [e.switch()],
        configure: poll,
        endpoint: (device) => {
            return { left: 6, right: 6 };
        },
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => {
                        await poll(device);
                    }, 300 * 1000); // Every 300 seconds
                    globalStore.putValue(device, 'interval', interval);
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-switch-2gang'],
        model: 'TI0001-switch-2gang',
        description: 'Zigbee Switch 2 gang',
        vendor: 'Livolo',
        fromZigbee: [fromZigbee_1.default.livolo_new_switch_state_2gang],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off],
        exposes: [e.switch().withEndpoint('left'), e.switch().withEndpoint('right')],
        configure: poll,
        endpoint: (device) => {
            return { left: 6, right: 6 };
        },
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => {
                        await poll(device);
                    }, 300 * 1000); // Every 300 seconds
                    globalStore.putValue(device, 'interval', interval);
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-curtain-switch'],
        model: 'TI0001-curtain-switch',
        description: 'Zigbee curtain switch (can only read status, control does not work yet)',
        vendor: 'Livolo',
        fromZigbee: [fromZigbee_1.default.livolo_curtain_switch_state],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off],
        // toZigbee: [tz.livolo_curtain_switch_on_off],
        exposes: [e.switch().withEndpoint('left'), e.switch().withEndpoint('right')],
        configure: poll,
        endpoint: (device) => {
            return { left: 6, right: 6 };
        },
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => {
                        await poll(device);
                    }, 300 * 1000); // Every 300 seconds
                    globalStore.putValue(device, 'interval', interval);
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-socket'],
        model: 'TI0001-socket',
        description: 'Zigbee socket',
        vendor: 'Livolo',
        exposes: [e.switch()],
        fromZigbee: [fromZigbee_1.default.livolo_socket_state, fromZigbee_1.default.power_on_behavior],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off, toZigbee_1.default.power_on_behavior],
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => {
                        await poll(device);
                    }, 300 * 1000); // Every 300 seconds
                    globalStore.putValue(device, 'interval', interval);
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-dimmer'],
        model: 'TI0001-dimmer',
        description: 'Zigbee dimmer',
        vendor: 'Livolo',
        fromZigbee: [fromZigbee_1.default.livolo_dimmer_state],
        toZigbee: [toZigbee_1.default.livolo_socket_switch_on_off, toZigbee_1.default.livolo_dimmer_level],
        exposes: [e.light_brightness()],
        configure: poll,
        endpoint: (device) => {
            return { left: 6, right: 6 };
        },
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (!globalStore.hasValue(device, 'interval')) {
                await poll(device);
                const interval = setInterval(async () => {
                    await poll(device);
                }, 300 * 1000); // Every 300 seconds
                globalStore.putValue(device, 'interval', interval);
            }
        },
    },
    {
        zigbeeModel: ['TI0001-cover'],
        model: 'TI0001-cover',
        description: 'Zigbee roller blind motor',
        vendor: 'Livolo',
        fromZigbee: [fromZigbee_1.default.livolo_cover_state, fromZigbee_1.default.command_off],
        toZigbee: [toZigbee_1.default.livolo_cover_state, toZigbee_1.default.livolo_cover_position, toZigbee_1.default.livolo_cover_options],
        exposes: [
            e.cover_position().setAccess('position', ea.STATE_SET),
            e
                .composite('options', 'options', ea.STATE_SET)
                .withDescription('Motor options')
                .withFeature(e.numeric('motor_speed', ea.STATE_SET).withValueMin(20).withValueMax(40).withDescription('Motor speed').withUnit('rpm'))
                .withFeature(e.enum('motor_direction', ea.STATE_SET, ['FORWARD', 'REVERSE']).withDescription('Motor direction')),
            e.binary('moving', ea.STATE, true, false).withDescription('Motor is moving'),
        ],
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (!globalStore.hasValue(device, 'interval')) {
                await poll(device);
                const interval = setInterval(async () => {
                    await poll(device);
                }, 300 * 1000); // Every 300 seconds
                globalStore.putValue(device, 'interval', interval);
            }
            // This is needed while pairing in order to let the device know that the interview went right and prevent
            // it from disconnecting from the Zigbee network.
            if (data.cluster === 'genPowerCfg' && data.type === 'raw') {
                const dp = data.data[10];
                if (data.data[0] === 0x7a && data.data[1] === 0xd1) {
                    const endpoint = device.getEndpoint(6);
                    if (dp === 0x02) {
                        const options = {
                            manufacturerCode: 0x1ad2,
                            disableDefaultResponse: true,
                            disableResponse: true,
                            reservedBits: 3,
                            direction: 1,
                            writeUndiv: true,
                        };
                        const payload = { 0x0802: { value: [data.data[3], 0, 0, 0, 0, 0, 0], type: data.data[2] } };
                        await endpoint.readResponse('genPowerCfg', 0xe9, payload, options);
                    }
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-pir'],
        model: 'TI0001-pir',
        description: 'Zigbee motion Sensor',
        vendor: 'Livolo',
        exposes: [e.occupancy()],
        fromZigbee: [fromZigbee_1.default.livolo_pir_state],
        toZigbee: [],
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => await poll(device), 300 * 1000);
                    globalStore.putValue(device, 'interval', interval);
                }
            }
            if (data.cluster === 'genPowerCfg' && data.type === 'raw') {
                const dp = data.data[10];
                if (data.data[0] === 0x7a && data.data[1] === 0xd1) {
                    const endpoint = device.getEndpoint(6);
                    if (dp === 0x01) {
                        const options = {
                            manufacturerCode: 0x1ad2,
                            disableDefaultResponse: true,
                            disableResponse: true,
                            reservedBits: 3,
                            direction: 1,
                            writeUndiv: true,
                        };
                        const payload = { 0x2002: { value: [0, 0, 0, 0, 0, 0, 0], type: 0x0e } };
                        await endpoint.readResponse('genPowerCfg', 0xe9, payload, options);
                    }
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-hygrometer'],
        model: 'TI0001-hygrometer',
        description: 'Zigbee Digital Humidity and Temperature Sensor',
        vendor: 'Livolo',
        exposes: [e.humidity(), e.temperature()],
        fromZigbee: [fromZigbee_1.default.livolo_hygrometer_state],
        toZigbee: [],
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => await poll(device), 300 * 1000);
                    globalStore.putValue(device, 'interval', interval);
                }
            }
            if (data.cluster === 'genPowerCfg' && data.type === 'raw') {
                const dp = data.data[10];
                if (data.data[0] === 0x7a && data.data[1] === 0xd1) {
                    const endpoint = device.getEndpoint(6);
                    if (dp === 0x02) {
                        const options = {
                            manufacturerCode: 0x1ad2,
                            disableDefaultResponse: true,
                            disableResponse: true,
                            reservedBits: 3,
                            direction: 1,
                            writeUndiv: true,
                        };
                        const payload = { 0x2002: { value: [data.data[3], 0, 0, 0, 0, 0, 0], type: data.data[2] } };
                        await endpoint.readResponse('genPowerCfg', 0xe9, payload, options);
                    }
                }
            }
        },
    },
    {
        zigbeeModel: ['TI0001-illuminance'],
        model: 'TI0001-illuminance',
        description: 'Zigbee digital illuminance and sound sensor',
        vendor: 'Livolo',
        exposes: [
            e.noise_detected(),
            e.illuminance().withUnit('%').withValueMin(0).withValueMax(100),
            e.enum('noise_level', ea.STATE, ['silent', 'normal', 'lively', 'noisy']).withDescription('Detected noise level'),
        ],
        fromZigbee: [fromZigbee_1.default.livolo_illuminance_state],
        toZigbee: [],
        configure: poll,
        onEvent: async (type, data, device) => {
            if (type === 'stop') {
                clearInterval(globalStore.getValue(device, 'interval'));
                globalStore.clearValue(device, 'interval');
            }
            if (['start', 'deviceAnnounce'].includes(type)) {
                await poll(device);
                if (!globalStore.hasValue(device, 'interval')) {
                    const interval = setInterval(async () => await poll(device), 300 * 1000);
                    globalStore.putValue(device, 'interval', interval);
                }
            }
            if (data.cluster === 'genPowerCfg' && data.type === 'raw') {
                const dp = data.data[10];
                if (data.data[0] === 0x7a && data.data[1] === 0xd1) {
                    const endpoint = device.getEndpoint(6);
                    if (dp === 0x02) {
                        const options = {
                            manufacturerCode: 0x1ad2,
                            disableDefaultResponse: true,
                            disableResponse: true,
                            reservedBits: 3,
                            direction: 1,
                            writeUndiv: true,
                        };
                        const payload = { 0x2002: { value: [data.data[3], 0, 0, 0, 0, 0, 0], type: data.data[2] } };
                        await endpoint.readResponse('genPowerCfg', 0xe9, payload, options);
                    }
                }
            }
        },
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=livolo.js.map