export type Predicate<EntryType> = (entry: EntryType) => boolean;

export async function* filter<EntryType>(
    source: AsyncIterable<EntryType>,
    predicate: Predicate<EntryType>,
): AsyncIterable<EntryType> {
    for await (const entry of source) {
        if (predicate(entry)) {
            yield entry;
        }
    }
}

export async function* range(start: number, end: number): AsyncIterable<number> {
    for (let i = start; i < end; i++) {
        yield i;
    }
}
