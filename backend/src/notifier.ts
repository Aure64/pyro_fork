import { TezosNodeEvent } from "./types";

export const notify = (event: TezosNodeEvent): void => {
  console.log(`Event received: ${event}`);
};

export default { notify };
