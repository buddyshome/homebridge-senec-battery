import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecBatteryTemp extends Charact {
    public static readonly UUID: string = '9f644d5f-5a5a-424a-b89f-a56ecc1156c8';
    public static readonly DISPLAY_NAME = 'Battery Temperature';
    constructor() {
      super(SenecBatteryTemp.DISPLAY_NAME, SenecBatteryTemp.UUID, {
        format: Formats.FLOAT,
        unit:  homebridge.hap.Units.CELSIUS,
        maxValue: 100,
        minValue: 0,
        minStep: 0.1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
