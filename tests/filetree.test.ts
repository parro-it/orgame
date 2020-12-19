import { resolve } from 'path';
import { getFiles, pickRenderAction, rebuildNeeded } from '../src/filetree';
const fixtures = resolve(__dirname, '../fixtures');

test('getFiles walks all file in source directory', async () => {
    const result = [];
    for await (const file of getFiles('./fixtures/docs', './fixtures/out')) {
        result.push(file);
    }

    expect(result).toStrictEqual([
        {
            out: `${fixtures}/out/classes/class1.md`,
            src: `${fixtures}/docs/classes/class1.md`,
        },
        {
            out: `${fixtures}/out/classes/class2.md`,
            src: `${fixtures}/docs/classes/class2.md`,
        },
        {
            out: `${fixtures}/out/readme.md`,
            src: `${fixtures}/docs/readme.md`,
        },
    ]);
});

test('pickRenderAction choose a RenderAction suitable for the source file', async () => {
    const action = pickRenderAction({ src: 'tsts.anyextension', out: 'tsts.anyextension' });
    expect(action.name).toBe('copyFile');

    const action2 = pickRenderAction({ src: 'test.md', out: '' });
    expect(action2.name).toBe('renderMarkdown');
});

test('rebuildNeeded', async () => {
    let needed = await rebuildNeeded({
        src: `${fixtures}/xp/dirty.src`,
        out: `${fixtures}/xp/dirty.bin`,
    });

    expect(needed).toBe(true);

    needed = await rebuildNeeded({
        src: `${fixtures}/xp/uptodate.src`,
        out: `${fixtures}/xp/uptodate.bin`,
    });

    expect(needed).toBe(false);

    needed = await rebuildNeeded({
        src: `${fixtures}/xp/nobin.src`,
        out: `${fixtures}/xp/nobin.bin`,
    });

    expect(needed).toBe(true);
});
