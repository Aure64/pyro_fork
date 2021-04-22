/**
 * Memoizes an async function.  The `makeMemoKey` function will be called to convert a function's
 * arguments to a string key that will be used to cache the results. The optional `maxCacheLength`
 * will trim the first item from the memoized cache whenever the limit is reached.
 */
export const makeMemoizedAsyncFunction = <Args extends unknown[], Return>(
  originalFunction: (...args: Args) => Promise<Return>,
  makeMemoKey: (...args: Args) => string,
  maxCacheLength?: number
): ((...args: Args) => Promise<Return>) => {
  const cache: Record<string, Return> = {};
  const memoizedFunction = async (...args: Args) => {
    const key = makeMemoKey(...args);
    if (cache[key]) {
      return cache[key];
    } else {
      const response: Return = await originalFunction(...args);
      cache[key] = response;
      if (maxCacheLength !== undefined) {
        // trim old cache entries
        const cacheLength = Object.keys(cache).length;
        if (cacheLength > maxCacheLength) {
          const firstCacheKey = Object.keys(cache)[0];
          delete cache[firstCacheKey];
        }
      }
      return response;
    }
  };
  return memoizedFunction;
};
