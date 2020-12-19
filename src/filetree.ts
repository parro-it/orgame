import { readdir, stat } from 'fs/promises';
import { resolve, extname } from 'path';
import { copyFile, renderMarkdown } from './actions';

export type FileEntry = {
    src: string;
    out: string;
};

type RenderAction = (entry: FileEntry) => Promise<void>;

export async function* getFiles(srcDir: string, outDir: string): AsyncIterable<FileEntry> {
    const dirents = await readdir(srcDir, { withFileTypes: true });
    for (const dirent of dirents) {
        const src = resolve(srcDir, dirent.name);
        const out = resolve(outDir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(src, out);
        } else {
            yield { src, out };
        }
    }
}

export async function rebuildNeeded(entry: FileEntry): Promise<boolean> {
    const srcInfo = await stat(entry.src).catch(() => null);
    const outInfo = await stat(entry.out).catch(() => null);

    if (srcInfo == null || outInfo == null) {
        return true;
    }

    if (outInfo.ctimeMs < srcInfo.ctimeMs) {
        return true;
    }

    return false;
}

export function pickRenderAction(entry: FileEntry): RenderAction {
    const ext = extname(entry.src);
    switch (ext) {
        case '.md':
            return renderMarkdown;
        default:
            return copyFile;
    }
}
