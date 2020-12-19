import { filter } from './src/async-utils';
import { getFiles, rebuildNeeded, pickRenderAction } from './src/filetree';

async function build(srcDir: string, outDir: string) {
    const allFiles = getFiles(srcDir, outDir);
    const toBeRebuilt = filter(allFiles, rebuildNeeded);
    for await (const entry of toBeRebuilt) {
        const action = pickRenderAction(entry);
        await action(entry);
        console.log({ entry, action });
    }
}

build(process.argv[2], process.argv[3]).catch((err) => console.error(err));
