import { BakerNodeEvent } from "./types";
import {
  notify,
  EndpointNotificationChannel,
} from "./endpointNotificationChannel";
import "jest-fetch-mock";

const notifier: EndpointNotificationChannel = {
  url: "http://localhost:4000",
};

describe("notify", () => {
  test("posts JSON notification", () => {
    const event: BakerNodeEvent = {
      type: "BAKER",
      kind: "MISSED_BAKE",
      baker: "some_baker",
      message: "Missed bake",
    };
    notify(notifier, event);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(notifier.url);
    expect(fetchMock.mock.calls[0][1].body).toEqual(JSON.stringify(event));
  });

  test("resolves to success string when successful", () => {
    fetchMock.mockResponse("true");

    const event: BakerNodeEvent = {
      type: "BAKER",
      kind: "MISSED_BAKE",
      baker: "some_baker",
      message: "Missed bake",
    };
    const result = notify(notifier, event);
    return expect(result).resolves.toEqual({ kind: "SUCCESS" });
  });

  test("resolves to error object when unsuccessful", () => {
    const event: BakerNodeEvent = {
      type: "BAKER",
      kind: "MISSED_BAKE",
      baker: "some_baker",
      message: "Missed bake",
    };
    fetchMock.mockResponse("Error", { status: 401 });
    const result = notify(notifier, event);
    return expect(result).resolves.toMatchObject({
      kind: "ERROR",
      error: expect.objectContaining({
        message: "Error posting event to endpoint",
      }),
      channelName: "endpoint",
    });
  });
});