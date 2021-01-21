import { notify as desktopNotify } from "node-notifier";
import { Notify } from "./types";

export type Config = { enableSound: boolean };

export type DesktopNotifier = {
  config: Config;
};

export const create = (config: Config): DesktopNotifier => {
  return { config };
};

export const notify: Notify<DesktopNotifier> = async (notifier, event) =>
  new Promise((resolve) => {
    desktopNotify(
      {
        title: `Kiln Event: ${event.kind}`,
        message: event.message,
        sound: notifier.config.enableSound,
      },
      (error) => {
        if (error) {
          resolve({ kind: "ERROR", error });
        } else {
          resolve({ kind: "SUCCESS" });
        }
      }
    );
  });
