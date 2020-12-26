/* eslint-disable @typescript-eslint/no-var-requires */
import { constants } from 'fs';
import { readFile, writeFile, copyFile } from 'fs/promises';
import markdownIt from 'markdown-it';
import { FileEntry, rebuildNeeded } from './filetree';
import { Environment, FileSystemLoader } from 'nunjucks';
import { getLanguage, highlight } from 'highlight.js';

const mdCopy = require('markdown-it-copy');
const mdTaskLists = require('markdown-it-task-lists');
const MarkdownItOEmbed = require('markdown-it-oembed');
const implicitFigures = require('markdown-it-implicit-figures');

const mdOptions = {
    highlight: function (str: string, lang: string) {
        if (lang === 'njk') {
            return `<pre>\n${str}\n</pre>`;
        }
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

const mdFiguresOptions = {
    dataType: false, // <figure data-type="image">, default: false
    figcaption: true, // <figcaption>alternative text</figcaption>, default: false
    tabindex: false, // <figure tabindex="1+n">..., default: false
    link: false, // <a href="img.png"><img src="img.png"></a>, default: false
};

const md = markdownIt(mdOptions)
    //.use(mdCopy, mdCopyOptions)
    .use(mdTaskLists)
    .use(MarkdownItOEmbed)
    .use(implicitFigures, mdFiguresOptions);

md.linkify.set({ fuzzyEmail: false });
const root = `${process.cwd()}/src/layouts`;
console.log(`configure nunjucks root to ${root}`);

class MyLoader {
    fs: FileSystemLoader;
    layout: string;
    layoutPath: string;

    constructor(root: string) {
        this.fs = new FileSystemLoader(root);
        this.layout = '';
        this.layoutPath = '';
    }

    getSource(name: string) {
        if (name == '.layout') {
            return {
                src: this.layout,
                path: this.layoutPath,
                noCache: true,
            };
        }
        return this.fs.getSource(name);
    }
}

export async function renderMarkdown(entry: FileEntry): Promise<boolean> {
    let needRebuild = true;
    const out = entry.out.replace(/\.md$/, '.html');
    const myEnv = new MyLoader(root);
    const env = new Environment(myEnv, {});

    const mdSourceNeedRebuild = await rebuildNeeded({ src: entry.src, out });

    if (entry.layoutPath) {
        needRebuild = mdSourceNeedRebuild || (await rebuildNeeded({ src: entry.layoutPath, out }));
    }

    if (needRebuild) {
        if (entry.layoutPath) {
            myEnv.layout = await readFile(entry.layoutPath, 'utf-8');
            myEnv.layoutPath = entry.layoutPath;
        } else {
            myEnv.layout = '.layout file not found.';
        }

        const mdContent = await readFile(entry.src, 'utf-8');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const njkContent = await (md as any).renderAsync(mdContent);

        const htmlContent = env.renderString(njkContent, {});

        await writeFile(out, htmlContent);
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
    const env = new Environment(new MyLoader(root), {});

    let htmlContent = env.renderString(htmlTemplateContent, {});

    if (entry.layoutPath) {
        const layoutContent = await readFile(entry.layoutPath, 'utf-8');
        htmlContent = env.renderString(layoutContent, { content: htmlContent });
    }
    await writeFile(entry.out, htmlContent);
    return true;
}
