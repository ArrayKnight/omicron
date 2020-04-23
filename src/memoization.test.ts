import { memoize } from './memoization'

describe('memoization', () => {
    let now = 0

    jest.spyOn(Date, 'now').mockImplementation(() => now)

    beforeEach(() => {
        now = 0
    })

    it('should memoize function result', async () => {
        let returnValue = 5
        const timeout = 1000
        const id = 'c544d3ae-a72d-4755-8ce5-d25db415b776'
        const testFunction = (): number => returnValue
        const memoized = memoize(testFunction, (key) => key, timeout)

        expect(memoized(id)).toEqual(5)

        returnValue = 10

        expect(memoized(id)).toEqual(5)

        // Move forward in time to after timeout
        now += timeout

        expect(memoized(id)).toEqual(10)

        // Move forward in time to after timeout
        now += timeout

        expect(memoized(id)).toEqual(10)
    })
})
