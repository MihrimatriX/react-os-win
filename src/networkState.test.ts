import { describe, expect, it } from "vitest";
import {
  WIFI_SSID,
  BLUETOOTH_CONNECTED_DEVICES,
  wifiStatusLabel,
  bluetoothStatusLabel,
} from "./networkState";

describe("networkState", () => {
  it("uses SPACE-X as the connected Wi-Fi SSID", () => {
    expect(WIFI_SSID).toBe("SPACE-X");
    expect(wifiStatusLabel(true, false)).toBe("SPACE-X");
    expect(wifiStatusLabel(false, false)).toBe("Wi-Fi");
    expect(wifiStatusLabel(true, true)).toBe("Wi-Fi");
  });

  it("keeps Bluetooth on with no connected devices", () => {
    expect(BLUETOOTH_CONNECTED_DEVICES).toEqual([]);
    expect(bluetoothStatusLabel(true, false)).toBe("Bağlı değil");
    expect(bluetoothStatusLabel(false, false)).toBe("Bluetooth");
    expect(bluetoothStatusLabel(true, true)).toBe("Bluetooth");
  });
});
