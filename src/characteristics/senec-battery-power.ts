// /**
//  * customCharacteristic allows to observe Air Pressure level in Homebridge Web page
//  * this is not visible in Homebridge application though because Apple does not support AirPressure Characteristic
//  */
import { API, Formats, Perms } from 'homebridge';

export = (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecBatteryPower extends Charact {
    public static readonly UUID: string = '5605d2c5-31b3-40b3-a64e-1f7efb1686cc';
    public static readonly DISPLAY_NAME = 'Battery Power';
    constructor() {
      super(SenecBatteryPower.DISPLAY_NAME, SenecBatteryPower.UUID, {
        format: Formats.FLOAT,
        unit: 'KW',
        maxValue: 10000,
        minValue: -10000,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};

// import { API, Characteristic, Formats, Perms, Service, Units } from 'homebridge';

// /**
//  * Defines the display name of the characteristic.
//  */
// const DISPLAY_NAME = 'Custom Duration';

// /**
//  * Defines the UUID of the characteristic.
//  * @remarks You need to generate a new UUID for each characteristic.
//  */
// const UUID = '5605d2c5-31b3-40b3-a64e-1f7efb1686cc';

// /**
//  * Attaches the 'Custom Duration' characteristic to the service.
//  * @param target The service to which the characteristic should be attached.
//  * @param api The Homebridge {@link API} instance in use for the plug-in.
//  * @returns The {@link Characteristic} instance.
//  */
// export function attachCustomDurationCharacteristic(target: Service, api: API): Characteristic {
//   let result: Characteristic;

//   if (target.testCharacteristic(DISPLAY_NAME)) {
//     result = target.getCharacteristic(DISPLAY_NAME)!;
//   } else {
//     result = target.addCharacteristic(new api.hap.Characteristic(DISPLAY_NAME, UUID, {
//       format: Formats.UINT32,
//       perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
//       unit: Units.SECONDS,
//     }));
//   }

//   return result;
// }