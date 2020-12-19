import { readFile, writeFile } from 'fs/promises';
import markdownIt from 'markdown-it';
import { FileEntry } from './filetree';
const md = markdownIt();

export async function renderMarkdown(entry: FileEntry): Promise<void> {
    const mdContent = await readFile(entry.src, 'utf-8');
    const htmlContent = md.render(mdContent);
    await writeFile(entry.out, htmlContent);
}

export async function copyFile(entry: FileEntry): Promise<void> {
    console.log(entry);
}
