"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sengledLight = sengledLight;
exports.sengledSwitchAction = sengledSwitchAction;
const zigbee_herdsman_1 = require("zigbee-herdsman");
const exposes_1 = require("../lib/exposes");
const modernExtend_1 = require("../lib/modernExtend");
function sengledLight(args) {
    return (0, modernExtend_1.light)({ effect: false, powerOnBehavior: false, ...args });
}
function sengledSwitchAction() {
    const exposes = [exposes_1.presets.action(['on', 'up', 'down', 'off', 'on_double', 'on_long', 'off_double', 'off_long'])];
    const fromZigbee = [
        {
            cluster: 64528,
            type: ['raw'],
            convert: (model, msg, publish, options, meta) => {
                // A list of commands the sixth digit in the raw data can map to
                const lookup = {
                    1: 'on',
                    2: 'up',
                    // Two outputs for long press. The eighth digit outputs 1 for initial press then 2 for each
                    // LED blink (approx 1 second, repeating until release)
                    3: 'down', // Same as above
                    4: 'off',
                    5: 'on_double',
                    6: 'on_long',
                    7: 'off_double',
                    8: 'off_long',
                };
                if (msg.data[7] === 2) {
                    // If the 8th digit is 2 (implying long press)
                    // Append '_long' to the end of the action so the user knows it was a long press.
                    // This only applies to the up and down action
                    return { action: `${lookup[msg.data[5]]}_long` };
                }
                else {
                    return { action: lookup[msg.data[5]] }; // Just output the data from the above lookup list
                }
            },
        },
    ];
    return { exposes, fromZigbee, isModernExtend: true };
}
const definitions = [
    {
        zigbeeModel: ['E13-N11'],
        model: 'E13-N11',
        vendor: 'Sengled',
        description: 'Flood light with motion sensor light outdoor',
        extend: [sengledLight(), (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'occupancy', zoneAttributes: ['alarm_1'] }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E21-N13A'],
        model: 'E21-N13A',
        vendor: 'Sengled',
        description: 'Smart LED (A19)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E21-N1EA'],
        model: 'E21-N1EA',
        vendor: 'Sengled',
        description: 'Smart LED multicolor A19 bulb',
        extend: [
            (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }),
            sengledLight({ colorTemp: { range: [154, 500] }, color: { modes: ['xy'] } }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E22-N1E'],
        model: 'E22-N1E',
        vendor: 'Sengled',
        description: 'Smart LED multicolor BR30 bulb',
        extend: [
            (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }),
            sengledLight({ colorTemp: { range: [154, 500] }, color: { modes: ['xy'] } }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E12-N1E'],
        model: 'E12-N1E',
        vendor: 'Sengled',
        description: 'Smart LED multicolor (BR30)',
        extend: [
            (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }),
            sengledLight({ colorTemp: { range: [154, 500] }, color: { modes: ['xy'] } }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E1G-G8E'],
        model: 'E1G-G8E',
        vendor: 'Sengled',
        description: 'Multicolor light strip (2M)',
        extend: [sengledLight({ colorTemp: { range: undefined }, color: { modes: ['xy'] } }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-U21U31'],
        model: 'E11-U21U31',
        vendor: 'Sengled',
        description: 'Element touch (A19)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-G13'],
        model: 'E11-G13',
        vendor: 'Sengled',
        description: 'Element classic (A19)',
        extend: [(0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }), sengledLight(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-G23', 'E11-G33'],
        model: 'E11-G23/E11-G33',
        vendor: 'Sengled',
        description: 'Element classic (A60)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-N13', 'E11-N13A', 'E11-N14', 'E11-N14A'],
        model: 'E11-N13/E11-N13A/E11-N14/E11-N14A',
        vendor: 'Sengled',
        description: 'Element extra bright (A19)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['Z01-CIA19NAE26'],
        model: 'Z01-CIA19NAE26',
        vendor: 'Sengled',
        description: 'Element touch (A19)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['Z01-A19NAE26'],
        model: 'Z01-A19NAE26',
        vendor: 'Sengled',
        description: 'Element plus (A19)',
        extend: [sengledLight({ colorTemp: { range: [154, 500] } }), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['Z01-A60EAE27'],
        model: 'Z01-A60EAE27',
        vendor: 'Sengled',
        description: 'Element Plus (A60)',
        extend: [sengledLight({ colorTemp: { range: undefined } }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-N1EA'],
        model: 'E11-N1EA',
        vendor: 'Sengled',
        description: 'Element plus color (A19)',
        extend: [
            (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }),
            sengledLight({ colorTemp: { range: [154, 500] }, color: { modes: ['xy'] } }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E11-U2E'],
        model: 'E11-U2E',
        vendor: 'Sengled',
        description: 'Element color plus E27',
        extend: [sengledLight({ colorTemp: { range: undefined }, color: { modes: ['xy'] } }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-U3E'],
        model: 'E11-U3E',
        vendor: 'Sengled',
        description: 'Element color plus B22',
        extend: [sengledLight({ colorTemp: { range: undefined }, color: { modes: ['xy'] } }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E1F-N5E'],
        model: 'E1F-N5E',
        vendor: 'Sengled',
        description: 'Element color plus E12',
        extend: [
            (0, modernExtend_1.forcePowerSource)({ powerSource: 'Mains (single phase)' }),
            sengledLight({ colorTemp: { range: [154, 500] }, color: { modes: ['xy'] } }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E12-N14'],
        model: 'E12-N14',
        vendor: 'Sengled',
        description: 'Element Classic (BR30)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E1A-AC2'],
        model: 'E1ACA4ABE38A',
        vendor: 'Sengled',
        description: 'Element downlight smart LED bulb',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E1D-G73'],
        model: 'E1D-G73WNA',
        vendor: 'Sengled',
        description: 'Smart window and door sensor',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ voltage: true, voltageReporting: true }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E2D-G73'],
        model: 'E2D-G73',
        vendor: 'Sengled',
        description: 'Smart window and door sensor G2',
        extend: [
            (0, modernExtend_1.iasZoneAlarm)({ zoneType: 'contact', zoneAttributes: ['alarm_1', 'tamper', 'battery_low'] }),
            (0, modernExtend_1.battery)({ voltage: true, voltageReporting: true }),
            (0, modernExtend_1.ota)(),
        ],
    },
    {
        zigbeeModel: ['E1C-NB6'],
        model: 'E1C-NB6',
        vendor: 'Sengled',
        description: 'Smart plug',
        extend: [(0, modernExtend_1.onOff)(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E1C-NB7'],
        model: 'E1C-NB7',
        vendor: 'Sengled',
        description: 'Smart plug with energy tracker',
        extend: [(0, modernExtend_1.onOff)({ powerOnBehavior: false }), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' })],
    },
    {
        zigbeeModel: ['E1E-G7F'],
        model: 'E1E-G7F',
        vendor: 'Sengled',
        description: 'Smart switch',
        extend: [sengledSwitchAction(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E11-N1G'],
        model: 'E11-N1G',
        vendor: 'Sengled',
        description: 'Vintage LED edison bulb (ST19)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E1F-N9G'],
        model: 'E1F-N9G',
        vendor: 'Sengled',
        description: 'Smart LED filament candle (E12)',
        extend: [sengledLight(), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E21-N14A'],
        model: 'E21-N14A',
        vendor: 'Sengled',
        description: 'Smart light bulb, dimmable 5000K, E26/A19',
        extend: [sengledLight(), (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }), (0, modernExtend_1.ota)()],
    },
    {
        zigbeeModel: ['E13-A21'],
        model: 'E13-A21',
        vendor: 'Sengled',
        description: 'Flood light with motion sensor light outdoor',
        extend: [
            (0, modernExtend_1.identify)(),
            sengledLight({ color: false }),
            (0, modernExtend_1.electricityMeter)({ cluster: 'metering' }),
            (0, modernExtend_1.ota)(),
            (0, modernExtend_1.deviceAddCustomCluster)('manuSpecificSengledMotionSensor', {
                ID: 0xfc01,
                manufacturerCode: zigbee_herdsman_1.Zcl.ManufacturerCode.SENGLED_CO_LTD,
                attributes: {
                    triggerCondition: { ID: 0x0000, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    enableAutoOnOff: { ID: 0x0001, type: zigbee_herdsman_1.Zcl.DataType.BOOLEAN },
                    motionStatus: { ID: 0x0003, type: zigbee_herdsman_1.Zcl.DataType.UINT8 },
                    offDelay: { ID: 0x0004, type: zigbee_herdsman_1.Zcl.DataType.UINT16 },
                },
                commands: {},
                commandsResponse: {},
            }),
            (0, modernExtend_1.enumLookup)({
                name: 'trigger_condition',
                lookup: { dark: 0, weak_light: 1 },
                cluster: 'manuSpecificSengledMotionSensor',
                attribute: 'triggerCondition',
                description: 'Choose whether the PAR38 bulb comes on when motion is detected under weak light conditions or dark conditions',
                zigbeeCommandOptions: { manufacturerCode: 0x1160 },
                access: 'STATE_SET',
            }),
            (0, modernExtend_1.binary)({
                name: 'enable_auto_on_off',
                cluster: 'manuSpecificSengledMotionSensor',
                attribute: 'enableAutoOnOff',
                description: 'Enable the PAR38 bulb to turn on automatically when motion is detected',
                valueOn: [true, 0x01],
                valueOff: [false, 0x00],
                zigbeeCommandOptions: { manufacturerCode: 0x1160 },
                access: 'STATE_SET',
            }),
            (0, modernExtend_1.binary)({
                name: 'motion_status',
                cluster: 'manuSpecificSengledMotionSensor',
                attribute: 'motionStatus',
                reporting: { attribute: 'motionStatus', min: '1_SECOND', max: 'MAX', change: 1 },
                description: 'Whether the PAR38 bulb has detected motion',
                valueOn: [true, 0x01],
                valueOff: [false, 0x00],
                zigbeeCommandOptions: { manufacturerCode: 0x1160 },
                access: 'STATE_GET',
            }),
            (0, modernExtend_1.numeric)({
                name: 'off_delay',
                cluster: 'manuSpecificSengledMotionSensor',
                attribute: 'offDelay',
                description: 'How long the light stays on once the motion sensor is triggered',
                valueMin: 30,
                valueMax: 14400,
                valueStep: 1,
                unit: 'seconds',
                zigbeeCommandOptions: { manufacturerCode: 0x1160 },
                access: 'STATE_SET',
            }),
        ],
    },
];
exports.default = definitions;
module.exports = definitions;
//# sourceMappingURL=sengled.js.map