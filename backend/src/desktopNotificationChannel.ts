import { notify as desktopNotify } from "node-notifier";
import { Notify } from "./types";

export const channelName = "desktop";

export type DesktopConfig = { enableSound: boolean; enabled: boolean };

export type DesktopNotificationChannel = {
  config: DesktopConfig;
};

export const create = (config: DesktopConfig): DesktopNotificationChannel => {
  return { config };
};

export const notify: Notify<DesktopNotificationChannel> = async (
  notifier,
  message
) =>
  new Promise((resolve) => {
    desktopNotify(
      {
        title: `Kiln Event`,
        message: message,
        sound: notifier.config.enableSound,
      },
      (error) => {
        if (error) {
          resolve({ kind: "ERROR", error, channelName });
        } else {
          resolve({ kind: "SUCCESS" });
        }
      }
    );
  });
