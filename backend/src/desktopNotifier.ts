import { notify as desktopNotify } from "node-notifier";

type Config = { enableSound: boolean };

type DesktopNotifier = {
  config: Config;
};

export const create = (config: Config): DesktopNotifier => {
  return { config };
};

// TODO: replace this event with common shared event
type TezosNodeEvent = {
  kind: string;
  message: string;
};

type NotifyResult = "success" | { error: Error };

export const notify = async (
  notifier: DesktopNotifier,
  event: TezosNodeEvent
): Promise<NotifyResult> => {
  return new Promise((resolve) => {
    desktopNotify(
      {
        title: `Kiln Event: ${event.kind}`,
        message: event.message,
        sound: notifier.config.enableSound,
      },
      (error) => {
        if (error) {
          resolve({ error });
        } else {
          resolve("success");
        }
      }
    );
  });
};
