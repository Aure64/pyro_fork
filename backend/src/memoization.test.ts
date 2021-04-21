import { makeMemoizedAsyncFunction } from "./memoization";

describe("makeMemoizedFunction", () => {
  it("fetches new data on a first request", async () => {
    const apiCall = jest.fn().mockResolvedValue("result");
    const memoizedFunction = makeMemoizedAsyncFunction(
      apiCall,
      () => "key"
    ) as (arg: string) => Promise<string>;

    const result = await memoizedFunction("data");
    expect(result).toEqual("result");
    expect(apiCall.mock.calls.length).toEqual(1);
  });

  it("returns existing data on a cache hit", async () => {
    const apiCall = jest.fn().mockResolvedValue("result");
    const memoizedFunction = makeMemoizedAsyncFunction(
      apiCall,
      () => "key"
    ) as (arg: string) => Promise<string>;

    const result = await memoizedFunction("data");
    expect(result).toEqual("result");
    const result2 = await memoizedFunction("data");
    expect(result2).toEqual("result");
    expect(apiCall.mock.calls.length).toEqual(1);
  });

  it("flushes old items from the cache", async () => {
    const apiCall = jest.fn().mockResolvedValue("result");
    const memoizedFunction = makeMemoizedAsyncFunction(
      apiCall,
      (k: string) => k,
      1
    ) as (arg: string) => Promise<string>;

    const result = await memoizedFunction("data");
    expect(result).toEqual("result");
    const result2 = await memoizedFunction("data");
    expect(result2).toEqual("result");
    expect(apiCall.mock.calls.length).toEqual(1);

    // now call with a different value, which should cause a new API call
    await memoizedFunction("other_data");
    expect(apiCall.mock.calls.length).toEqual(2);
    // call with the original data, which should also be a cache miss
    await memoizedFunction("data");
    expect(apiCall.mock.calls.length).toEqual(3);
  });
});
