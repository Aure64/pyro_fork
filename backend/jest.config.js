module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["/dist"],
  setupFiles: ["./setupJest.js"],
};
