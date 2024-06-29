import {
    AccessoryPlugin,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    API,
    HAP,
    Logging,
    Service,
    CharacteristicEventTypes,
    PlatformConfig,
    Characteristic
} from "homebridge";

import { SenecAPI, SenecResponse } from "senec-battery";

import ServiceGen = require('./services/senec-service-gen');
import CharBatteryPower = require('./characteristics/senec-battery-power');
import CharGridPower = require('./characteristics/senec-grid-power');
import CharSolarPower = require('./characteristics/senec-solar-power');
import CharHousePower = require('./characteristics/senec-house-power');
import CharEnergyState = require('./characteristics/senec-energy-state');
import CharEnergyStateText = require('./characteristics/senec-energy-state-text');


export class HomebridgeSenecBatteryAssoc implements AccessoryPlugin {

    private log: Logging;

    // This property must be existent!!
    name: string;

    private BatteryService: Service;
    private informationService: Service;
    private hap: HAP;
    private api: API;
    private host: string;
    private SenecApi: SenecAPI;
    private state_trans!: { [key: string]: { [key: number]: number; }; };
    private verbose: boolean;
    private RefreshInterval: number = (1 * 1000 * 60); //10min

    //Services
    private ServiceGen : Service;

    //Characteristics
    private CharBatteryPower: Characteristic;
    private CharGridPower: Characteristic;
    private CharSolarPower: Characteristic;
    private CharHousePower: Characteristic;
    private CharEnergyState: Characteristic;
    private CharEnergyStateText: Characteristic;


    constructor(hap: HAP, api: API, log: Logging, name: string, host: string, verbose: boolean) {
        this.log = log;
        this.name = name;
        this.hap = hap;
        this.api = api;
        this.host = host;
        this.verbose = verbose;

        // Init conversion
        this.init_state();
        this.BatteryService = new hap.Service.Battery(name);

        //Get instance of Service
        this.ServiceGen = new (ServiceGen(this.api))();

        //Get instance to Characteristics
        this.CharBatteryPower = new (CharBatteryPower(this.api))();
        this.CharGridPower = new (CharGridPower(this.api))();
        this.CharSolarPower = new (CharSolarPower(this.api))();
        this.CharHousePower = new (CharHousePower(this.api))();
        this.CharEnergyState = new (CharEnergyState(this.api))(); 
        this.CharEnergyStateText = new (CharEnergyStateText(this.api))(); 

        //Add Characteristics to service        
        this.ServiceGen.addCharacteristic(this.CharBatteryPower);
        this.ServiceGen.addCharacteristic(this.CharGridPower);
        this.ServiceGen.addCharacteristic(this.CharSolarPower);
        this.ServiceGen.addCharacteristic(this.CharHousePower);
        this.ServiceGen.addCharacteristic(this.CharEnergyState);
        this.ServiceGen.addCharacteristic(this.CharEnergyStateText);

        this.SenecApi = new SenecAPI(this.host);

        // create handlers for required characteristics
        this.BatteryService.getCharacteristic(hap.Characteristic.StatusLowBattery)
            .onGet(this.handleStatusLowBatteryGet.bind(this));

        this.BatteryService.getCharacteristic(hap.Characteristic.BatteryLevel)
            .onGet(this.handleBatteryLevelGet.bind(this));


        this.BatteryService.getCharacteristic(hap.Characteristic.ChargingState)
            .onGet(this.handleChargingStateGet.bind(this));

        this.CharBatteryPower.onGet(this.handleBatteryPowerGet.bind(this));
        this.CharGridPower.onGet(this.handleGridPowerGet.bind(this));
        this.CharSolarPower.onGet(this.handleSolarPowerGet.bind(this));
        this.CharHousePower.onGet(this.handleHousePowerGet.bind(this));
        this.CharEnergyState.onGet(this.handleEnergyState.bind(this));
        this.CharEnergyStateText.onGet(this.handleEnergyStateText.bind(this));

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, "Senec")
            .setCharacteristic(hap.Characteristic.Model, "N/A");

        if (this.verbose) this.log.info("'%s' created!", name);

        setInterval(this.updateValues.bind(this), this.RefreshInterval);
    }

    private getChargingState4EnergyState(iStateNbr: number): number {
        return this.state_trans["ENERGY.STAT_STATE"][iStateNbr];
    }
    private init_state() : void {

        // 0: 'INITIALZUSTAND (0)',
        // 1: 'KEINE KOMMUNIKATION LADEGERAET (1)',
        // 2: 'FEHLER LEISTUNGSMESSGERAET (2)',
        // 3: 'RUNDSTEUEREMPFAENGER (3)',
        // 4: 'ERSTLADUNG (4)',
        // 5: 'WARTUNGSLADUNG (5)',
        // 6: 'WARTUNGSLADUNG FERTIG (6)',
        // 7: 'WARTUNG NOTWENDIG (7)',
        // 8: 'MAN. SICHERHEITSLADUNG (8)',
        // 9: 'SICHERHEITSLADUNG FERTIG (9)',
        // 10: 'VOLLLADUNG (10)',
        // 11: 'AUSGLEICHSLADUNG: LADEN (11)',
        // 12: 'SULFATLADUNG: LADEN (12)',
        // 13: 'AKKU VOLL (13)',
        // 14: 'LADEN (14)',
        // 15: 'AKKU LEER (15)',
        // 16: 'ENTLADEN (16)',
        // 17: 'PV + ENTLADEN (17)',
        // 18: 'NETZ + ENTLADEN (18)',
        // 19: 'PASSIV (19)',
        // 20: 'AUSGESCHALTET (20)',
        // 21: 'EIGENVERBRAUCH (21)',
        // 22: 'NEUSTART (22)',
        // 23: 'MAN. AUSGLEICHSLADUNG: LADEN (23)',
        // 24: 'MAN. SULFATLADUNG: LADEN (24)',
        // 25: 'SICHERHEITSLADUNG (25)',
        // 26: 'AKKU-SCHUTZBETRIEB (26)',
        // 27: 'EG FEHLER (27)',
        // 28: 'EG LADEN (28)',
        // 29: 'EG ENTLADEN (29)',
        // 30: 'EG PASSIV (30)',
        // 31: 'EG LADEN VERBOTEN (31)',
        // 32: 'EG ENTLADEN VERBOTEN (32)',
        // 33: 'NOTLADUNG (33)',
        // 34: 'SOFTWAREAKTUALISIERUNG (34)',
        // 35: 'FEHLER: NA-SCHUTZ (35)',
        // 36: 'FEHLER: NA-SCHUTZ NETZ (36)',
        // 37: 'FEHLER: NA-SCHUTZ HARDWARE (37)',
        // 38: 'KEINE SERVERVERBINDUNG (38)',
        // 39: 'BMS FEHLER (39)',
        // 40: 'WARTUNG: FILTER (40)',
        // 41: 'SCHLAFMODUS (41)',
        // 42: 'WARTE AUF ÜBERSCHUSS (42)',
        // 43: 'KAPAZITÄTSTEST: LADEN (43)',
        // 44: 'KAPAZITÄTSTEST: ENTLADEN (44)',
        // 45: 'MAN. SULFATLADUNG: WARTEN (45)',
        // 46: 'MAN. SULFATLADUNG: FERTIG (46)',
        // 47: 'MAN. SULFATLADUNG: FEHLER (47)',
        // 48: 'AUSGLEICHSLADUNG: WARTEN (48)',
        // 49: 'NOTLADUNG: FEHLER (49)',
        // 50: 'MAN: AUSGLEICHSLADUNG: WARTEN (50)',
        // 51: 'MAN: AUSGLEICHSLADUNG: FEHLER (51)',
        // 52: 'MAN: AUSGLEICHSLADUNG: FERTIG (52)',
        // 53: 'AUTO: SULFATLADUNG: WARTEN (53)',
        // 54: 'LADESCHLUSSPHASE (54)',
        // 55: 'BATTERIETRENNSCHALTER AUS (55)',
        // 56: 'PEAK-SHAVING: WARTEN (56)',
        // 57: 'FEHLER LADEGERAET (57)',
        // 58: 'NPU-FEHLER (58)',
        // 59: 'BMS OFFLINE (59)',
        // 60: 'WARTUNGSLADUNG FEHLER (60)',
        // 61: 'MAN. SICHERHEITSLADUNG FEHLER (61)',
        // 62: 'SICHERHEITSLADUNG FEHLER (62)',
        // 63: 'KEINE MASTERVERBINDUNG (63)',
        // 64: 'LITHIUM SICHERHEITSMODUS AKTIV (64)',
        // 65: 'LITHIUM SICHERHEITSMODUS BEENDET (65)',
        // 66: 'FEHLER BATTERIESPANNUNG (66)',
        // 67: 'BMS DC AUSGESCHALTET (67)',
        // 68: 'NETZINITIALISIERUNG (68)',
        // 69: 'NETZSTABILISIERUNG (69)',
        // 70: 'FERNABSCHALTUNG (70)',
        // 71: 'OFFPEAK-LADEN (71)',
        // 72: 'FEHLER HALBBRÜCKE (72)',
        // 73: 'BMS: FEHLER BETRIEBSTEMPERATUR (73)',
        // 74: 'FACOTRY SETTINGS NICHT GEFUNDEN (74)',
        // 75: 'NETZERSATZBETRIEB (75)',
        // 76: 'NETZERSATZBETRIEB AKKU LEER (76)',
        // 77: 'NETZERSATZBETRIEB FEHLER (77)',
        // 78: 'INITIALISIERUNG (78)',
        // 79: 'INSTALLATIONSMODUS (79)',
        // 80: 'NETZAUSFALL (80)',
        // 81: 'BMS UPDATE ERFORDERLICH (81)',
        // 82: 'BMS KONFIGURATION ERFORDERLICH (82)',
        // 83: 'ISOLATIONSTEST (83)',
        // 84: 'SELBSTTEST (84)',
        // 85: 'EXTERNE STEUERUNG (85)',
        // 86: 'TEMPERATUR SENSOR FEHLER (86)',
        // 87: 'NETZBETREIBER: LADEN GESPERRT (87)',
        // 88: 'NETZBETREIBER: ENTLADEN GESPERRT (88)',
        // 89: 'RESERVEKAPAZITÄT (89)',
        // 90: 'SELBSTTEST FEHLER (90)',
        // 91: 'ISOLATIONSFEHLER (91)',
        // 92: 'PV-MODUS (92)',
        // 93: 'FERNABSCHALTUNG NETZBETREIBER (93)',
        // 94: 'FEHLER DRM0 (94)',
        // 95: 'BATTERIEDIAGNOSE (95)',
        // 96: 'BATTERIE BALANCIERUNG (96)',
        // 97: API.Characteristic.ChargingState.NOT_CHARGING

        this.state_trans = {
            'ENERGY.STAT_STATE': {
                0: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                1: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                2: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                3: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                4: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                5: this.hap.Characteristic.ChargingState.CHARGING,
                6: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                7: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                8: this.hap.Characteristic.ChargingState.CHARGING,
                9: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                10: this.hap.Characteristic.ChargingState.CHARGING,
                11: this.hap.Characteristic.ChargingState.CHARGING,
                12: this.hap.Characteristic.ChargingState.CHARGING,
                13: this.hap.Characteristic.ChargingState.CHARGING,
                14: this.hap.Characteristic.ChargingState.CHARGING,
                15: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                16: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                17: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                18: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                19: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                20: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                21: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                22: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                23: this.hap.Characteristic.ChargingState.CHARGING,
                24: this.hap.Characteristic.ChargingState.CHARGING,
                25: this.hap.Characteristic.ChargingState.CHARGING,
                26: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                27: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                28: this.hap.Characteristic.ChargingState.CHARGING,
                29: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                30: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                31: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                32: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                33: this.hap.Characteristic.ChargingState.CHARGING,
                34: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                35: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                36: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                37: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                38: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                39: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                40: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                41: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                42: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                43: this.hap.Characteristic.ChargingState.CHARGING,
                44: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                45: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                46: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                47: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                48: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                49: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                50: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                51: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                52: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                53: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                54: this.hap.Characteristic.ChargingState.CHARGING,
                55: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                56: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                57: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                58: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                59: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                60: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                61: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                62: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                63: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                64: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                65: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                66: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                67: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                68: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                69: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                70: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                71: this.hap.Characteristic.ChargingState.CHARGING,
                72: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                73: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                74: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                75: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                76: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                77: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                78: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                79: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                80: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                81: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                82: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                83: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                84: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                85: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                86: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                87: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                88: this.hap.Characteristic.ChargingState.NOT_CHARGING,
                89: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                90: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                91: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                92: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                93: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                94: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                95: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                96: this.hap.Characteristic.ChargingState.NOT_CHARGEABLE,
                97: this.hap.Characteristic.ChargingState.NOT_CHARGING
            }
        }
    }

    private GetStatusLowBatteryGet(io_SenecResponse: SenecResponse): number {
        if (this.verbose) this.log.info('GET StatusLowBattery');

        let SenecResponse = io_SenecResponse;
        // set this to a valid value for StatusLowBattery
        let currentValue = 0;

        if (this.verbose) this.log.info(`%s - Battery Level is ${SenecResponse.getBatteryLevel()}`, this.name);

        if (SenecResponse.getBatteryLevel() > 0) {

            currentValue = this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        }
        else {
            currentValue = this.hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW;
        }
        return currentValue;
    }


    /**
    * Handle requests to get the current value of the "Status Low Battery" characteristic
    */
    private async handleStatusLowBatteryGet(): Promise<number> {
        if (this.verbose) this.log.info('Triggered GET StatusLowBattery');
        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        return this.GetStatusLowBatteryGet(SenecResponse);
    }

    private async handleBatteryLevelGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered GET BatteryLevel', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`%s - Battery Level is ${SenecResponse.getBatteryLevel()}`, this.name);

        return SenecResponse.getBatteryLevel();
    }

    private async handleBatteryPowerGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered GET Battery Power', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`%s - Battery Power is ${SenecResponse.getBatteryChargingPower()} KW`, this.name);

        return SenecResponse.getBatteryChargingPower();
    }

    private async handleGridPowerGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered GET Grid Power', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`%s - Grid Power is ${SenecResponse.getGridPower()} KW`, this.name);

        return SenecResponse.getGridPower();
    }

    private async handleSolarPowerGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered PV Power', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`%s - PV Power is ${SenecResponse.getPVPower()} KW`, this.name);

        return SenecResponse.getPVPower();
    }

    private async handleHousePowerGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered HousePower', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`%s - House Power is ${SenecResponse.getHousePower()} KW`, this.name);

        return SenecResponse.getHousePower();
    }


    private async handleChargingStateGet(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered GET ChargingState', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();
        // set this to a valid value for StatusLowBattery

        if (this.verbose) this.log.info(`${this.name} - Status is ${SenecResponse.getEnergyStateText()} Code: ${SenecResponse.getEnergyState()}`);

        return this.getChargingState4EnergyState(SenecResponse.getEnergyState());
    }

    private async handleEnergyState(): Promise<number> {
        if (this.verbose) this.log.info('%s - Triggered GET EnergyState', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`${this.name} - Status is ${SenecResponse.getEnergyStateText()} Code: ${SenecResponse.getEnergyState()}`);

        return SenecResponse.getEnergyState();
    }

    private async handleEnergyStateText(): Promise<string> {
        if (this.verbose) this.log.info('%s - Triggered GET EnergyStateText', this.name);

        let SenecResponse = await this.SenecApi.fetchDataBuffered();

        if (this.verbose) this.log.info(`${this.name} - Status is ${SenecResponse.getEnergyStateText()} Code: ${SenecResponse.getEnergyState()}`);

        return SenecResponse.getEnergyStateText();
    }




    private async updateValues(): Promise<void> {
        if (this.verbose) this.log.info(`${this.name} - Update Values triggered`);

        let lo_response = await this.SenecApi.fetchDataBuffered();

        //Display debug information
        if (this.verbose) this.log.info(`${this.name} - Status is ${lo_response.getEnergyStateText()} Code: ${lo_response.getEnergyState()}`);

        //Charging State
        this.BatteryService.getCharacteristic(this.hap.Characteristic.ChargingState)
            .updateValue(this.getChargingState4EnergyState(lo_response.getEnergyState()));
        

        this.BatteryService.getCharacteristic(this.hap.Characteristic.StatusLowBattery)
            .updateValue(this.GetStatusLowBatteryGet(lo_response));

        this.BatteryService.getCharacteristic(this.hap.Characteristic.BatteryLevel)
            .updateValue(lo_response.getBatteryLevel());

        this.CharBatteryPower.sendEventNotification(lo_response.getBatteryChargingPower());
        this.CharGridPower.sendEventNotification(lo_response.getGridPower());
        this.CharSolarPower.sendEventNotification(lo_response.getPVPower());
        this.CharHousePower.sendEventNotification(lo_response.getHousePower());
        this.CharEnergyState.updateValue(lo_response.getEnergyState());
        this.CharEnergyStateText.updateValue(lo_response.getEnergyStateText());
              
    }


    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    public identify(): void {
        this.log("${this.name} - Identify!");
    }

    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    public getServices(): Service[] {
        return [
            this.informationService,
            this.BatteryService,
            this.ServiceGen
        ];
    }


}