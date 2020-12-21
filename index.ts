import { filter } from './src/async-utils';
import { getFiles, rebuildNeeded, pickRenderAction } from './src/filetree';
import { relative } from 'path';

async function build(srcDir: string, outDir: string) {
    const allFiles = getFiles(srcDir, outDir);
    const toBeRebuilt = filter(allFiles, rebuildNeeded);
    for await (const entry of toBeRebuilt) {
        const action = pickRenderAction(entry);
        const rebuilt = await action(entry);
        if (rebuilt) {
            const relOut = relative(process.cwd(), entry.out);
            const relSrc = relative(process.cwd(), entry.src);
            console.log(`${relSrc} -> ${relOut}`);
        }
    }
}

async function start() {
    const args = process.argv.slice(2);
    const srcDirs = args.slice(0, args.length - 1);
    const outDir = args[args.length - 1];

    await Promise.all(srcDirs.map((srcDir) => build(srcDir, outDir)));
}

start().catch((err) => console.error(err));
