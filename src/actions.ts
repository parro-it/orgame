import { constants } from 'fs';
import { readFile, writeFile, copyFile } from 'fs/promises';
import markdownIt from 'markdown-it';
import { FileEntry } from './filetree';
import { compile } from 'handlebars';

const md = markdownIt();

export async function renderMarkdown(entry: FileEntry): Promise<void> {
    const mdContent = await readFile(entry.src, 'utf-8');
    let htmlContent = md.render(mdContent);

    if (entry.layout !== null) {
        const template = compile(entry.layout);
        htmlContent = template({ content: htmlContent });
    }
    const outFile = entry.out.replace(/\.md$/, '.html');
    console.log(outFile);
    await writeFile(outFile, htmlContent);
}

export function copyAnyFile(entry: FileEntry): Promise<void> {
    return copyFile(entry.src, entry.out, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL);
}

export async function renderHTML(entry: FileEntry): Promise<void> {
    const htmlTemplateContent = await readFile(entry.src, 'utf-8');
    const template = compile(htmlTemplateContent);
    let htmlContent = template({});

    if (entry.layout !== null) {
        const layoutTemplate = compile(entry.layout);
        htmlContent = layoutTemplate({ content: htmlContent });
    }
    await writeFile(entry.out, htmlContent);
}
