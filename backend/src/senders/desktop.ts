import { notify } from "node-notifier";
import format from "../format";

import { Event, Sender } from "../events";

export type DesktopConfig = {
  enableSound: boolean;
  enabled: boolean;
  emoji: boolean;
  short_address: boolean;
};

const post = async (message: string, sound: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    notify(
      {
        title: "Pyrometer",
        message,
        sound,
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

export const create = (config: DesktopConfig): Sender => {
  return async (events: Event[]) => {
    //doesn't support multiline messages, must post one by one
    const lines = format(events, config.emoji, config.short_address);
    for (const line of lines) {
      await post(line, config.enableSound);
    }
  };
};
