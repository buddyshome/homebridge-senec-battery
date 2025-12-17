import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecCaseTemp extends Charact {
    public static readonly UUID: string = 'f64b9a75-bbfc-457a-b404-a0ffb0774217';
    public static readonly DISPLAY_NAME = 'Case Temperature';
    constructor() {
      super(SenecCaseTemp.DISPLAY_NAME, SenecCaseTemp.UUID, {
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
