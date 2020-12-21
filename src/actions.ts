import { constants } from 'fs';
import { readFile, writeFile, copyFile } from 'fs/promises';
import markdownIt from 'markdown-it';
import { FileEntry, rebuildNeeded } from './filetree';
import { compile } from 'handlebars';
import { getLanguage, highlight } from 'highlight.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mdCopy = require('markdown-it-copy');

const mdOptions = {
    highlight: function (str: string, lang: string) {
        if (lang && getLanguage(lang)) {
            return highlight(lang, str).value;
        }

        return ''; // use external default escaping
    },
    linkify: true,
};

const mdCopyOptions = {
    btnText: 'copy', // | button text
    failText: 'copy fail', // | copy-fail text
    successText: 'copy success', // | copy-success text
    successTextDelay: 2000, // | successText show time [ms]
    extraHtmlBeforeBtn: '', // | a html-fragment before <button>
    extraHtmlAfterBtn: '', // | a html-fragment after <button>
    showCodeLanguage: true, // false | show code language before [btn || extraHtmlBeforeBtn] | [add-after-1.1.0]
    attachText: '', // '' | some text append copyText， Such as: copyright | [add-after-1.2.0]
};

const md = markdownIt(mdOptions).use(mdCopy, mdCopyOptions);

md.linkify.set({ fuzzyEmail: false });

export async function renderMarkdown(entry: FileEntry): Promise<boolean> {
    const mdContent = await readFile(entry.src, 'utf-8');
    let htmlContent = md.render(mdContent);

    if (entry.layout !== null) {
        const template = compile(entry.layout);
        htmlContent = template({ content: htmlContent });
    }
    const outFile = entry.out.replace(/\.md$/, '.html');
    entry.out = outFile;
    if (await rebuildNeeded(entry)) {
        await writeFile(outFile, htmlContent);
        return true;
    }
    return false;
}

export async function copyAnyFile(entry: FileEntry): Promise<boolean> {
    await copyFile(entry.src, entry.out, constants.COPYFILE_FICLONE);
    return true;
}

export async function renderHTML(entry: FileEntry): Promise<boolean> {
    const htmlTemplateContent = await readFile(entry.src, 'utf-8');
    const template = compile(htmlTemplateContent);
    let htmlContent = template({});

    if (entry.layout !== null) {
        const layoutTemplate = compile(entry.layout);
        htmlContent = layoutTemplate({ content: htmlContent });
    }
    await writeFile(entry.out, htmlContent);
    return true;
}
