import { mkdir, readdir, stat } from 'fs/promises';
import { resolve, extname, join } from 'path';
import { copyAnyFile, renderMarkdown, renderHTML } from './actions';

export type FileEntry = {
    src: string;
    out: string;
    layoutPath?: string;
};

type RenderAction = (entry: FileEntry) => Promise<boolean>;

export async function* getFiles(srcDir: string, outDir: string): AsyncIterable<FileEntry> {
    const dirents = await readdir(srcDir, { withFileTypes: true });
    const layoutMaybePath = join(srcDir, '.layout');
    const hasLayout = await stat(layoutMaybePath)
        .then(() => true)
        .catch(() => false);
    const layoutPath = hasLayout ? layoutMaybePath : undefined;
    await mkdir(outDir, { recursive: true }).catch(() => null);

    for (const dirent of dirents) {
        if (dirent.name == '.layout') {
            continue;
        }
        const src = resolve(srcDir, dirent.name);
        const out = resolve(outDir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(src, out);
        } else {
            yield { src, out, layoutPath };
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
        case '.html':
            return renderHTML;
        default:
            return copyAnyFile;
    }
}
