import { create } from "./failureHandler";
import { NotifyResult, TezosNodeEvent } from "../types";

describe("create", () => {
  const event: TezosNodeEvent = {
    type: "PEER",
    kind: "NODE_BEHIND",
    message: "Node is behind",
    node: "some_node",
  };
  const channelName = "some_channel";
  const errorResult: NotifyResult = {
    kind: "ERROR",
    error: new Error(),
    channelName,
  };
  const successResult: NotifyResult = {
    kind: "SUCCESS",
  };

  const notifyErrorResult = {
    channelName: "some_channel",
    message: "Error sending some_channel notification",
    type: "NOTIFIER",
  };

  it("dispatches event on first failure", async () => {
    const notify = jest.fn();
    const notifierFunction = jest.fn().mockResolvedValue(errorResult);
    const wrappedNotify = create(channelName, notify)(notifierFunction);
    const result = await wrappedNotify(event);
    expect(result).toEqual(errorResult);
    expect(notify).toBeCalledWith(notifyErrorResult);
  });

  it("doesn't dispatch event on second failure", async () => {
    const notify = jest.fn();
    const notifierFunction = jest.fn().mockResolvedValue(errorResult);
    const wrappedNotify = create(channelName, notify)(notifierFunction);
    const result = await wrappedNotify(event);
    expect(result).toEqual(errorResult);
    expect(notify).toBeCalledWith(notifyErrorResult);
    expect(notify).toHaveBeenCalledTimes(1);

    // call middleware again.  we expect it to not dispatch an event for subsequent failure
    await wrappedNotify(event);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("doesn't dispatch event on success", async () => {
    const notify = jest.fn();
    const notifierFunction = jest.fn().mockResolvedValue(successResult);
    const wrappedNotify = create(channelName, notify)(notifierFunction);
    const result = await wrappedNotify(event);
    expect(result).toEqual(successResult);
    expect(notify).toHaveBeenCalledTimes(0);
  });

  it("dispatches event on failure after a success", async () => {
    const notify = jest.fn();
    const notifierFunction = jest.fn().mockResolvedValue(errorResult);
    const wrappedNotify = create(channelName, notify)(notifierFunction);
    const result = await wrappedNotify(event);
    expect(result).toEqual(errorResult);
    expect(notify).toBeCalledWith(notifyErrorResult);
    expect(notify).toHaveBeenCalledTimes(1);

    // change wrapped function to succeed this time
    notifierFunction.mockResolvedValue(successResult);
    await wrappedNotify(event);
    // notify shouldn't have been called for the success
    expect(notify).toHaveBeenCalledTimes(1);

    // change wrapped function to fail again
    notifierFunction.mockResolvedValue(errorResult);
    await wrappedNotify(event);
    // notify should have been called again
    expect(notify).toHaveBeenCalledTimes(2);
  });
});
