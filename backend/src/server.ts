console.log("Server started");

// dummy timer to keep process alive.  Will replace in future once server is implemented.
setInterval(() => {
  console.log("Polling...");
}, 1000 * 60 * 60);
