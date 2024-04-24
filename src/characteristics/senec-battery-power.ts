
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
        maxValue: 1000,
        minValue: -1000,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
