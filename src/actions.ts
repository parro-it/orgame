import { constants } from 'fs';
import { readFile, writeFile, copyFile } from 'fs/promises';
import markdownIt from 'markdown-it';
import { FileEntry } from './filetree';
const md = markdownIt();

export async function renderMarkdown(entry: FileEntry): Promise<void> {
    const mdContent = await readFile(entry.src, 'utf-8');
    const htmlContent = md.render(mdContent);
    await writeFile(entry.out, htmlContent);
}

export function copyAnyFile(entry: FileEntry): Promise<void> {
    return copyFile(entry.src, entry.out, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL);
}
