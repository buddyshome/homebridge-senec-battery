import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecSolarPower extends Charact {
    public static readonly UUID: string = '86a24bb1-adf6-4784-a4e4-e0f27fa1a4ce';
    public static readonly DISPLAY_NAME = 'Solar Power';
    constructor() {
      super(SenecSolarPower.DISPLAY_NAME, SenecSolarPower.UUID, {
        format: Formats.FLOAT,
        unit: 'KW',
        maxValue: 200,
        minValue: 0,
        minStep: 0.05,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
