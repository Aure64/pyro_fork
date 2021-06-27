import { notify } from "node-notifier";
import { toString } from "../format2";

import { Event, Sender } from "../types2";

export type DesktopConfig = { enableSound: boolean; enabled: boolean };

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
    const messages = events.map(toString);
    for (const m of messages) {
      await post(m, config.enableSound);
    }
  };
};
