import { API, Formats, Perms } from 'homebridge';

export = (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecEnergyStateText extends Charact {
    public static readonly UUID: string = '5a96070c-d0ef-4dc6-ad1d-118a6b5c6147';
    public static readonly DISPLAY_NAME = 'Energy State Text';
    constructor() {
      super(SenecEnergyStateText.DISPLAY_NAME, SenecEnergyStateText.UUID, {
        format: Formats.STRING,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
