// setup jest-fetch-mock to use cross-fetch instead of a polyfill
const customGlobal = global;
customGlobal.fetch = require("jest-fetch-mock");
customGlobal.fetchMock = customGlobal.fetch;

jest.setMock("cross-fetch", fetch); // Use this to mock your ponyfilled fetch module
