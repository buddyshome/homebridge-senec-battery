import { API, Service } from 'homebridge';

export = (homebridge : API ) => {
    const Service = homebridge.hap.Service;
  
    return class SenecServiceGen extends Service {
      public static readonly UUID: string = '5ef691a0-4121-44a0-86c2-744e851ba357';
      public static readonly DISPLAY_NAME = 'SenecServiceGen';
      constructor() {
        super(SenecServiceGen.DISPLAY_NAME, SenecServiceGen.UUID);
      }
    };
  };