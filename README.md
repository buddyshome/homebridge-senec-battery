# Homebridge Senec Battery Plugin

The **Homebridge Senec Battery Plugin** integrates your **Senec Home Energy Storage System** with Apple's **HomeKit**, allowing you to monitor and manage your energy system directly from the Home app or via Siri.

## Features

- **Battery Monitoring**: View the current charge level of your Senec battery.
- **Energy Flow Insights**: Track live energy flows, including grid, solar, and battery statuses.
- **Custom Notifications**: Set thresholds to receive alerts when battery levels reach certain percentages.
- **Automation Support**: Use HomeKit automations to respond to battery conditions, such as reducing power consumption when the battery is low.
- **Secure Communication**: Supports HTTPS (SSL) for secure connections.

## Prerequisites

- **Homebridge**: Version 1.6 or later, including Homebridge 2.x (tested with 2.5). See [Homebridge Documentation](https://homebridge.io).
- **Senec Home Energy Storage System**: Ensure your Senec battery is configured and accessible on your local network.
- **Node.js**: Supported versions are 22, 24 and 26. Homebridge 2.5 itself requires Node.js 22.12 or later.

## Installation

1. Install the plugin using npm:
   ```bash
   npm install -g homebridge-senec-battery
   ```

2. Update your Homebridge `config.json` file with the plugin's configuration (see below).

3. Restart Homebridge to activate the plugin.

## Configuration

The plugin is configured as one platform with a list of `devices`, so several Senec batteries (e.g. master and slave) can be added at once. The easiest way is the plugin settings in the Homebridge UI.

### Platform options

| **Option**  | **Type** | **Required** | **Description**                                                     | **Default**                |
|-------------|----------|--------------|---------------------------------------------------------------------|----------------------------|
| `platform`  | String   | Yes          | Set to `"homebridge-senec-battery"`. Required to identify the plugin. | -                          |
| `name`      | String   | Yes          | Plugin name as displayed in the Homebridge log.                     | `homebridge-senec-battery` |
| `devices`   | Array    | Yes          | One entry per Senec battery (see device options below).             | -                          |

### Device options

| **Option**    | **Type** | **Required** | **Description**                                                                                   | **Default** | **Placeholder**        |
|---------------|----------|--------------|---------------------------------------------------------------------------------------------------|-------------|------------------------|
| `name`        | String   | Yes          | The name shown in the Homebridge logs and used as the default name in HomeKit.                   | -           | `Senec-Battery-Master` |
| `host`        | String   | Yes          | IP address or hostname of the Senec battery, optionally with a port. No `http://` or paths.      | -           | `e.g. 192.168.1.100`   |
| `verbose`     | Boolean  | No           | Enable more detailed output in Homebridge logs for troubleshooting purposes.                     | `false`     | -                      |
| `ssl`         | Boolean  | No           | Switch to HTTPS for secure communication.                                                        | `false`     | -                      |
| `sslUnsecure` | Boolean  | No           | Ignore SSL errors (useful for self-signed certificates).                                          | `false`     | -                      |

### Example `config.json`

```json
{
  "platforms": [
    {
      "platform": "homebridge-senec-battery",
      "name": "homebridge-senec-battery",
      "devices": [
        {
          "name": "Senec-Battery-Master",
          "host": "192.168.1.100",
          "verbose": false,
          "ssl": false,
          "sslUnsecure": false
        },
        {
          "name": "Senec-Battery-Slave",
          "host": "192.168.1.101"
        }
      ]
    }
  ]
}
```

### Additional Notes

- **`name`**: Changing this value after the device is added to HomeKit does not update the name within the Home app; it must be manually edited in HomeKit.
- **`host`**: Use a static IP address or hostname for consistent operation.
- **`verbose`**: Set to `true` if you want detailed logs; useful for debugging issues.
- **`ssl` and `sslUnsecure`**: Enable `ssl` if your Senec system uses HTTPS. Set `sslUnsecure` to `true` to bypass certificate errors (e.g., when using self-signed certificates).

## Usage

Once configured, the plugin will expose your Senec battery system to HomeKit.

- **View Battery Level**: Check the charge status of your battery in the Home app.
- **Energy Flow Insights**: Monitor live updates about grid, battery, and solar energy flows.
- **Siri Integration**: Ask Siri about your battery status:
  - Example: *"Hey Siri, what's the battery level of my Senec system?"*  
- **HomeKit Automations**: Create automations based on battery status, such as dimming lights when battery levels are low.

## Troubleshooting

- **No data appears in HomeKit?**  
  Ensure the `host` is correct and that your Senec system is accessible on your local network.

- **Errors in logs?**  
  Enable `verbose` logging for more details and review the logs in Homebridge.

## Development

The project does not install Homebridge as a local dependency. Instead, it builds against a globally installed Homebridge:

1. Install Homebridge globally:
   ```bash
   npm install -g homebridge
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
   A `prebuild` step runs `npm link homebridge`, which links the global Homebridge into `node_modules` so TypeScript can find its type definitions. `npm install` removes this link, but every build recreates it.

To run Homebridge in debug mode with the plugin, use `npm start`.

### Testing with a local `senec-battery`

To test unreleased changes of the [senec-battery](https://github.com/buddyshome/senec-battery) library:

1. In the `senec-battery` folder, build it and register it globally: `npm run build && npm link`
2. In this folder, link both packages and compile with `tsc` directly (`npm run build` would relink only Homebridge and replace the local library with the published one):
   ```bash
   npm link homebridge senec-battery
   npx rimraf dist && npx tsc
   ```
3. Start Homebridge: `homebridge -I -D`

Running `npm install` restores the published `senec-battery`.

## Contribution

We welcome contributions to improve this plugin! Here's how to get involved:

1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Test your changes thoroughly (see [Development](#development)).
4. Submit a pull request with a detailed explanation of your changes.

## Support

If you encounter issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/buddyshome/homebridge-senec-battery/issues).

## License

This plugin is licensed under the **MIT License**. For details, see the [LICENSE](./LICENSE) file.

---

**Enjoy managing your energy smarter with the Homebridge Senec Battery Plugin!**

