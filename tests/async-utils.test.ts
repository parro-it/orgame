import { filter, range } from '../src/async-utils';

test('range return an iterable of n numbers', async () => {
    let idx = 2;
    let lastNumber = 0;
    for await (const n of range(2, 4)) {
        expect(n).toBe(idx);
        idx++;
        lastNumber = idx;
    }
    expect(lastNumber).toBe(4);
});

test('filter filters entries on a predicate', async () => {
    const result = [];
    for await (const n of filter(range(2, 10), async (n) => n % 2 == 0)) {
        result.push(n);
    }
    expect(result).toStrictEqual([2, 4, 6, 8]);
});
