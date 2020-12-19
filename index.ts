import { readFile, readdir } from 'fs/promises';
import markdownIt from 'markdown-it';

const md = markdownIt();
const result = md.render('# markdown-it rulezz!');
console.log(result)

async function renderIndex() {
    const mdContent = await readFile('readme.md', 'utf-8');
    console.log(md.render(mdContent));
}

walkSrc().catch(err => console.error(err));

async function walkSrc() {
    for await (const file of getFiles('./fixtures/docs', './fixtures/out')) {
        console.log(file.src, '-->', file.out);
    }
}