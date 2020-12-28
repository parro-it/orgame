import { filter } from './src/async-utils';
import { getFiles, rebuildNeeded, pickRenderAction } from './src/filetree';
import { join, relative } from 'path';
import { metaRegistry } from './src/actions';
import { readFile, writeFile } from 'fs/promises';

async function build(srcDir: string, outDir: string) {
    const allFiles = getFiles(srcDir, outDir);
    const toBeRebuilt = filter(allFiles, rebuildNeeded);
    for await (const entry of toBeRebuilt) {
        const action = pickRenderAction(entry);
        const rebuilt = await action(entry);
        if (rebuilt) {
            const relOut = relative(metaRegistry.root, entry.out);
            const relSrc = relative(metaRegistry.root, entry.src);
            console.log(`${relSrc} -> ${relOut}`);
        }
    }
}

async function start() {
    const args = process.argv.slice(2);
    const srcDirs = args.slice(0, args.length - 1);
    const outDir = args[args.length - 1];
    metaRegistry.root = process.cwd();
    const metaFilePath = join(metaRegistry.root, 'meta.json');
    const meta = await readFile(metaFilePath, 'utf-8');
    metaRegistry.entries = JSON.parse(meta);
    await Promise.all(srcDirs.map((srcDir) => build(srcDir, outDir)));
    const updatedMeta = JSON.stringify(metaRegistry.entries, null, 4);
    await writeFile(metaFilePath, updatedMeta);
}

start().catch((err) => console.error(err));
