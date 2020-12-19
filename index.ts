import { readFile, readdir } from 'fs/promises';
import markdownIt from 'markdown-it';
import{ resolve } from 'path';

type FileEntry = {
    src: string,
    out: string
};

async function* getFiles(srcDir: string, outDir: string): AsyncIterable<FileEntry> {
  const dirents = await readdir(srcDir, { withFileTypes: true });
  for (const dirent of dirents) {

    const src = resolve(srcDir, dirent.name);
    const out = resolve(outDir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(src, out);
    } else {
      yield {src,out};
    }
  }
}



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