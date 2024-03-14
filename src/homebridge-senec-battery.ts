import {
    AccessoryPlugin,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes
} from "homebridge";



export class HomebridgeSenecBattery implements AccessoryPlugin {

    private readonly log: Logging;

    // This property must be existent!!
    name: string;

    private readonly BatteryService: Service;
    private readonly informationService: Service;
    private readonly hap:HAP;

    constructor(hap: HAP, log: Logging, name: string) {
        this.log = log;
        this.name = name;
        this.hap = hap;


        this.BatteryService = new hap.Service.Battery(name);

        // create handlers for required characteristics
        this.BatteryService.getCharacteristic(hap.Characteristic.StatusLowBattery)
            .onGet(this.handleStatusLowBatteryGet.bind(this));

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
            .setCharacteristic(hap.Characteristic.Model, "Custom Model");

        log.info("Example switch '%s' created!", name);
    }

    /**
* Handle requests to get the current value of the "Status Low Battery" characteristic
*/
    handleStatusLowBatteryGet() {
        this.log.debug('Triggered GET StatusLowBattery');

        // set this to a valid value for StatusLowBattery
        const currentValue = this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;

        return currentValue;
    }

    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify(): void {
        this.log("Identify!");
    }

    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices(): Service[] {
        return [
            this.informationService,
            this.switchService,
        ];
    }


}