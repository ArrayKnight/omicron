/**
 * Creates a function that memoizes the result of func. If resolver is provided,
 * it determines the cache key for storing the result based on the arguments provided to the memorized function.
 * By default, the first argument provided to the memorized function is used as the map cache key. The memorized values
 * timeout after the timeout exceeds. The timeout is in defined in milliseconds.
 *
 * Example:
 * function addToTime(year, month, day) {
 *  return Date.now() + Date(year, month, day);
 * }
 *
 * const memoized = memoization.memoize(addToTime, (year, month, day) => year + month + day, 5000)
 *
 * // call the provided function cache the result and return the value
 * const result = memoized(1, 11, 26); // result = 1534252012350
 *
 * // because there was no timeout this call should return the memorized value from the first call
 * const secondResult = memoized(1, 11, 26); // secondResult = 1534252012350
 *
 * // after 5000 ms the value is not valid anymore and the original function should be called again
 * const thirdResult = memoized(1, 11, 26); // thirdResult = 1534252159271
 *
 * @param func      the function for which the return values should be cached
 * @param resolver  if provided gets called for each function call with the exact same set of parameters as the
 *                  original function, the resolver function should provide the memoization key.
 * @param timeout   timeout for cached values in milliseconds
 */

interface Dictionary<T = unknown> {
    [key: string]: T
}

interface CacheEntry {
    result: unknown
    timestamp: number
}

export function memoize(
    func: (...args: unknown[]) => unknown,
    resolver: (...args: unknown[]) => unknown = (...args) => args,
    timeout = 0,
): (...args: unknown[]) => unknown {
    // Create a unique cache for this instance of the function
    const cache: Dictionary<CacheEntry> = {}

    return (...args) => {
        // Convert args into a string key, identical args should create the same key
        // There are rare edge cases where args that are technically the same could create a different key, ex:
        // [{foo: 'foo', bar: 'bar'}] !== [{bar: 'bar', foo: 'foo'}] but skip this edge case (for now) for simplicity
        const key = createKey(resolver(...args))
        // Rather than create potentially long running timers that delete cache entries a timestamp is stored
        // along with the previous result as the cache entry. This has the potential of eating up more memory
        // in the long run, though having a bunch of concurrent timers does the same.
        const useCached =
            Object.prototype.hasOwnProperty.call(cache, key) &&
            Date.now() - cache[key].timestamp < timeout
        // If the cached result hasn't expired use it, otherwise get a new result
        const result = useCached ? cache[key].result : func(...args)

        // (Re)set the cache entry with the most recent result + timestamp
        if (!useCached) {
            cache[key] = {
                result,
                timestamp: timeout > 0 ? Date.now() : Infinity,
            }
        }

        return result
    }
}

export function createKey(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    try {
        // Be sure to convert undefined to string
        return `${JSON.stringify(value)}`
    } catch {
        return `${value}`
    }
}
