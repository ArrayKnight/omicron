import { createKey, memoize } from './memoization'

describe('createKey', () => {
    it('should convert value to string', () => {
        expect(createKey(null)).toEqual('null')
        expect(createKey(undefined)).toEqual('undefined')
        expect(createKey(13)).toEqual('13')
        expect(createKey('foo-bar')).toEqual('foo-bar')
        expect(createKey([13, 'foo', 'bar'])).toEqual('[13,"foo","bar"]')
        expect(createKey({ foo: 'bar' })).toEqual('{"foo":"bar"}')
        expect(createKey([{ foo: 'bar' }, { bar: 'foo' }])).toEqual(
            '[{"foo":"bar"},{"bar":"foo"}]',
        )
        expect(createKey([{ foo: 'bar' }, 27, null])).toEqual(
            '[{"foo":"bar"},27,null]',
        )
    })
})

describe('memoization', () => {
    const id = 'c544d3ae-a72d-4755-8ce5-d25db415b776'
    let now = 0

    jest.spyOn(Date, 'now').mockImplementation(() => now)

    beforeEach(() => {
        now = 0
    })

    it('should memoize function result', () => {
        let value = 5
        const timeout = 1000
        const memoized = memoize(() => value, undefined, timeout)

        expect(memoized(id)).toEqual(5)

        value = 10

        expect(memoized(id)).toEqual(5)

        // Move forward in time to after timeout
        now += timeout

        expect(memoized(id)).toEqual(10)

        // Move forward in time to after timeout
        now += timeout

        expect(memoized(id)).toEqual(10)
    })

    it('should create memoized functions with unique caches', () => {
        const valueOne = 'foo'
        const memoizedOne = memoize(() => valueOne)
        const valueTwo = 'bar'
        const memoizedTwo = memoize(() => valueTwo)

        expect(memoizedOne(id)).toEqual(valueOne)
        expect(memoizedTwo(id)).toEqual(valueTwo)
    })

    it('should only call function if timeout has expired', () => {
        const funcOne = jest.fn()
        const memoizedOne = memoize(funcOne)
        const funcTwo = jest.fn()
        const timeout = 1000
        const memoizedTwo = memoize(funcTwo, undefined, timeout)
        const assertions = [
            { ms: 0, funcOneTimes: 0, funcTwoTimes: 0 },
            { ms: timeout, funcOneTimes: 1, funcTwoTimes: 1 },
            { ms: timeout / 2, funcOneTimes: 1, funcTwoTimes: 2 },
            { ms: timeout, funcOneTimes: 1, funcTwoTimes: 2 },
            { ms: 0, funcOneTimes: 1, funcTwoTimes: 3 },
        ]

        assertions.forEach(({ ms, funcOneTimes, funcTwoTimes }) => {
            expect(funcOne).toHaveBeenCalledTimes(funcOneTimes)
            expect(funcTwo).toHaveBeenCalledTimes(funcTwoTimes)

            // Move forward in time
            now += ms

            memoizedOne()
            memoizedTwo()
        })
    })

    it('should allow resolver to determine cache key', () => {
        const foo = 'foo'
        const bar = 'bar'
        const memoized = memoize(
            (i: number) => (i % 2 === 0 ? foo : bar),
            (i: number) => (i % 2 === 0 ? foo : bar),
        )

        for (let i = 0; i < 10; i++) {
            expect(memoized(i)).toEqual(i % 2 === 0 ? foo : bar)
        }
    })
})
