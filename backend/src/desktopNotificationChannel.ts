import { notify as desktopNotify } from "node-notifier";
import { Notify } from "./types";

export const channelName = "desktop";

export type Config = { enableSound: boolean };

export type DesktopNotificationChannel = {
  config: Config;
};

export const create = (config: Config): DesktopNotificationChannel => {
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
