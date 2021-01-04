export const start = (): NodeJS.Timeout => {
  // dummy timer to keep process alive.  Will replace in future once server is implemented.
  return setInterval(() => {
    console.log("Polling...");
  }, 1000 * 60 * 60);
};

export const halt = (timeout: NodeJS.Timeout): void => {
  clearInterval(timeout);
};

export default { start, halt };
