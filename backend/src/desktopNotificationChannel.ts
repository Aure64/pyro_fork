import { notify as desktopNotify } from "node-notifier";
import { Notify } from "./types";
import { error } from "loglevel";

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
  { title }
) =>
  new Promise((resolve) => {
    desktopNotify(
      {
        title: "Pyrometer",
        message: title,
        sound: notifier.config.enableSound,
      },
      (err) => {
        if (err) {
          error(err);
          resolve({ kind: "ERROR", error: err, channelName });
        } else {
          resolve({ kind: "SUCCESS" });
        }
      }
    );
  });
