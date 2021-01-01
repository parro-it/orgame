/* eslint-disable @typescript-eslint/no-var-requires */
import { constants } from 'fs';
import { readFile, writeFile, copyFile } from 'fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'path';

import markdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-toc-done-right';
import { getLanguage, highlight } from 'highlight.js';

const mdCopy = require('markdown-it-copy');
const mdTaskLists = require('markdown-it-task-lists');
const MarkdownItOEmbed = require('markdown-it-oembed');
const implicitFigures = require('markdown-it-implicit-figures');

import { FileEntry, rebuildNeeded } from './filetree';
import { Environment, FileSystemLoader } from 'nunjucks';

const mdOptions = {
    highlight: function (str: string, lang: string) {
        if (lang === 'njk') {
            return `<pre style="display:none">\n${str}\n</pre>`;
        }
        if (lang && getLanguage(lang)) {
            return highlight(lang, str).value;
        }

        return ''; // use external default escaping
    },
    break: true,
    linkify: false,
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

const anchorOptyions = {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '',
};

const md = markdownIt(mdOptions)
    .use(mdCopy, mdCopyOptions)
    .use(mdTaskLists)
    .use(MarkdownItOEmbed)
    .use(implicitFigures, mdFiguresOptions)
    .use(anchor, anchorOptyions)
    .use(toc);

//md.linkify.set({ fuzzyEmail: false });
const root = process.cwd();
const env = new Environment(new FileSystemLoader(root), {});

console.log(`configure nunjucks root to ${root}`);

type MetaType = {
    title: string;
    subtitle: string;
    srcPath: string;
    outPath: string;
    url: string;
    published: Date;
    draft: boolean;
    tags: Array<string>;
    categories: Array<string>;
};

export const metaRegistry: {
    entries: Record<string, MetaType>;
    root: string;
} = { entries: {}, root: '' };

function defaultMeta(entry: FileEntry, out: string): MetaType {
    return {
        title: '',
        subtitle: '',
        published: new Date(),
        draft: true,
        tags: ['untagged'],
        categories: ['uncategorised'],
        srcPath: entry.src,
        outPath: out,
        url: relative(metaRegistry.root, out).replace(/^docs\//, ''),
    };
}
export async function renderMarkdown(entry: FileEntry): Promise<boolean> {
    let needRebuild = true;
    const out = entry.out.replace(/\.md$/, '.html');
    const mdSourceNeedRebuild = await rebuildNeeded({ src: entry.src, out });

    if (entry.layoutPath) {
        needRebuild = mdSourceNeedRebuild || (await rebuildNeeded({ src: entry.layoutPath, out }));
    }

    if (needRebuild) {
        const mdContent = await readFile(entry.src, 'utf-8');
        let metaVal: MetaType;
        if (metaRegistry.entries.hasOwnProperty(entry.src)) {
            metaVal = metaRegistry.entries[entry.src] || defaultMeta(entry, out);
        } else {
            metaVal = defaultMeta(entry, out);
        }
        const ctx = {
            layout: '',
            meta: metaVal,
            registry: metaRegistry,

            useLayout(path: string) {
                //console.log('NEW LAYOUT', path);
                ctx.layout = path;
            },
            title(text: string) {
                ctx.meta.title = text;
            },
            subtitle(text: string) {
                ctx.meta.subtitle = text;
            },
            published(on: Date) {
                ctx.meta.published = on;
            },

            draft(is: boolean) {
                ctx.meta.draft = is;
            },

            tags(list: Array<string>) {
                ctx.meta.tags = list;
            },

            categories(list: Array<string>) {
                ctx.meta.categories = list;
            },
        };

        //console.log('LAYOUT BEFORE', ctx.layout);
        const htmlContent = env.renderString(mdContent, ctx);
        //console.log('LAYOUT AFTER', ctx.layout);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content = await (md as any).renderAsync(htmlContent);

        if (ctx.layout !== '') {
            if (!isAbsolute(ctx.layout)) {
                ctx.layout = resolve(dirname(entry.src), ctx.layout);
            }
            const layoutCtx = { content, meta: ctx.meta };
            content = env.render(ctx.layout, layoutCtx);
        }
        await writeFile(out, content);
        metaRegistry.entries[relative(metaRegistry.root, entry.src)] = ctx.meta;
        return true;
    }
    return false;
}

export async function copyAnyFile(entry: FileEntry): Promise<boolean> {
    await copyFile(entry.src, entry.out, constants.COPYFILE_FICLONE);
    return true;
}

export async function renderHTML(entry: FileEntry): Promise<boolean> {
    const htmlContent = env.render(entry.src, {});
    await writeFile(entry.out, htmlContent);
    return true;
}
