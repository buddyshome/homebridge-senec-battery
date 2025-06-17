
import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecGridPower extends Charact {
    public static readonly UUID: string = '8a586a43-9cd7-458e-9686-a7d3e2c10915';
    public static readonly DISPLAY_NAME = 'Grid Power';
    constructor() {
      super(SenecGridPower.DISPLAY_NAME, SenecGridPower.UUID, {
        format: Formats.FLOAT,
        unit: 'KW',
        maxValue: 1000,
        minValue: -1000,
        minStep: 0.001,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
