import { API, Formats, Perms } from 'homebridge';

export = (homebridge : API ) => {
  const Charact = homebridge.hap.Characteristic;

  return class SenecEnergyStateText extends Charact {
    public static readonly UUID: string = '43a367de-4059-484f-9bdc-761b60d75fcb';
    public static readonly DISPLAY_NAME = 'Energy State';
    constructor() {
      super(SenecEnergyStateText.DISPLAY_NAME, SenecEnergyStateText.UUID, {
        format: Formats.STRING,
        perms: [Perms.PAIRED_READ, Perms.NOTIFY]
      });
      this.value = this.getDefaultValue();
    }
  };
};
