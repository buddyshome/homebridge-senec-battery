import { API, Formats, Perms } from 'homebridge';

export default (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecEnergyState extends Charact {
    public static readonly UUID: string = '43a367de-4059-484f-9bdc-761b60d75fcb';
    public static readonly DISPLAY_NAME = 'Energy State';
    constructor() {
      super(SenecEnergyState.DISPLAY_NAME, SenecEnergyState.UUID, {
        format: Formats.UINT16,
        maxValue: 100,
        minValue: 0,
        minStep: 1,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
