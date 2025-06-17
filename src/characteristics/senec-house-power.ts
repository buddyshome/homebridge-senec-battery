import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecHousePower extends Charact {
    public static readonly UUID: string = 'f80db5ff-f6b8-40fa-8ebe-8443f0d92143';
    public static readonly DISPLAY_NAME = 'House Power';
    constructor() {
      super(SenecHousePower.DISPLAY_NAME, SenecHousePower.UUID, {
        format: Formats.FLOAT,
        unit: 'KW',
        maxValue: 1000,
        minValue: 0,
        minStep: 0.001,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
