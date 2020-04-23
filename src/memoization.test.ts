import { createKey, memoize } from './memoization'

describe('createKey', () => {
    it('should convert value to string', () => {
        expect(createKey(null)).toEqual('null')
        expect(createKey(undefined)).toEqual('undefined')
        expect(createKey(13)).toEqual('13')
        expect(createKey('foo-bar')).toEqual('"foo-bar"')
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
})
