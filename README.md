# Homebridge Senec Battery Plugin

The **Homebridge Senec Battery Plugin** integrates your **Senec Home Energy Storage System** with Apple's **HomeKit**, allowing you to monitor and manage your energy system directly from the Home app or via Siri.

## Features

- **Battery Monitoring**: View the current charge level of your Senec battery.
- **Energy Flow Insights**: Track live energy flows, including grid, solar, and battery statuses.
- **Custom Notifications**: Set thresholds to receive alerts when battery levels reach certain percentages.
- **Automation Support**: Use HomeKit automations to respond to battery conditions, such as reducing power consumption when the battery is low.
- **Secure Communication**: Supports HTTPS (SSL) for secure connections.

## Prerequisites

- **Homebridge**: Install and configure Homebridge. See [Homebridge Documentation](https://homebridge.io).
- **Senec Home Energy Storage System**: Ensure your Senec battery is configured and accessible on your local network.
- **Node.js**: Requires Node.js version 20 or later.

## Installation

1. Install the plugin using npm:
   ```bash
   npm install -g homebridge-senec-battery
   ```

2. Update your Homebridge `config.json` file with the plugin's configuration (see below).

3. Restart Homebridge to activate the plugin.

## Configuration

Here are the available configuration options for the plugin:

| **Option**        | **Type**  | **Required** | **Description**                                                                                   | **Default**               | **Placeholder**           |
|--------------------|-----------|--------------|---------------------------------------------------------------------------------------------------|---------------------------|---------------------------|
| `platform`        | String    | Yes          | Set to `"SenecBattery"`. Required to identify the plugin.                                         | -                         | -                         |
| `name`            | String    | Yes          | The name shown in the Homebridge logs and used as the default name in HomeKit.                   | -                         | `Senec-Battery-Master`    |
| `host`            | String    | Yes          | The IP address or hostname of your Senec system. Ensure the system is reachable on your network. | -                         | `e.g. 192.168.1.100`      |
| `verbose`         | Boolean   | No           | Enable more detailed output in Homebridge logs for troubleshooting purposes.                     | `false`                   | -                         |
| `ssl`             | Boolean   | No           | Switch to HTTPS for secure communication.                                                        | `false`                   | -                         |
| `sslUnsecure`     | Boolean   | No           | Ignore SSL errors (useful for self-signed certificates or testing environments).                  | `false`                   | -                         |

### Example `config.json`

```json
{
  "platforms": [  
    {  
      "platform": "SenecBattery",  
      "name": "Senec-Battery-Master",  
      "host": "192.168.1.100",  
      "verbose": false,  
      "ssl": false,  
      "sslUnsecure": false  
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

## Contribution

We welcome contributions to improve this plugin! Here's how to get involved:

1. Fork this repository.
2. Create a new branch for your feature or bug fix.
3. Test your changes thoroughly.
4. Submit a pull request with a detailed explanation of your changes.

## Support

If you encounter issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/your-username/homebridge-senec-battery).

## License

This plugin is licensed under the **MIT License**. For details, see the [LICENSE](./LICENSE) file.

---

**Enjoy managing your energy smarter with the Homebridge Senec Battery Plugin!**

