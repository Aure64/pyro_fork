import setPath from "./setPath";

describe("setPath", () => {
  const data = {};
  const result = setPath("a:b:c", data, 1);

  it("sets path", async () => {
    expect(result).toEqual({ a: { b: { c: 1 } } });
  });

  it("does not mutate data", async () => {
    expect(data).toEqual({});
  });
});
