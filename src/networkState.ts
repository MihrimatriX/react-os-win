/** Simulated network / radio defaults for the Win11 OS UI. */

export const WIFI_SSID = "SPACE-X" as const;

/** Bluetooth radio on by default; no paired/connected devices. */
export const BLUETOOTH_CONNECTED_DEVICES: readonly string[] = [];

export function wifiStatusLabel(wifiOn: boolean, airplaneMode: boolean): string {
  if (airplaneMode || !wifiOn) return "Wi-Fi";
  return WIFI_SSID;
}

export function bluetoothStatusLabel(
  bluetoothOn: boolean,
  airplaneMode: boolean,
): string {
  if (airplaneMode || !bluetoothOn) return "Bluetooth";
  return BLUETOOTH_CONNECTED_DEVICES.length > 0
    ? BLUETOOTH_CONNECTED_DEVICES[0]!
    : "Bağlı değil";
}
