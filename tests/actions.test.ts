import { unlink, readFile } from 'fs/promises';
import { renderHTML, renderMarkdown } from '../src/actions';

test('renderMarkdown transform markdown into html', async () => {
    const outFile = `/tmp/readme.html`;
    const entry = {
        src: `${__dirname}/../fixtures/readme.md`,
        out: outFile,
    };
    await unlink(outFile).catch(() => 0);
    await renderMarkdown(entry);
    const actualOut = await readFile(outFile, 'utf-8');
    expect(actualOut).toBe(`<h1>Static blog engine</h1>
<p>orgame is a static blog engine.</p>
<h2>Features</h2>
<ul>
<li>write articles in markdown</li>
<li>automatically deployed</li>
</ul>
`);
    await unlink(outFile);
});

test('renderMarkdown use a .layout file to use an handlebar layout', async () => {
    const outFile = `/tmp/readme.html`;
    const entry = {
        src: `${__dirname}/../fixtures/readme.md`,
        out: outFile,
        layoutPath: `${__dirname}/../fixtures/alayout`,
    };
    await unlink(outFile).catch(() => 0);
    await renderMarkdown(entry);
    const actualOut = await readFile(outFile, 'utf-8');
    expect(actualOut).toBe(`===<h1>Static blog engine</h1>
<p>orgame is a static blog engine.</p>
<h2>Features</h2>
<ul>
<li>write articles in markdown</li>
<li>automatically deployed</li>
</ul>
===`);
    await unlink(outFile);
});

test('renderHTML transform handlerbars template into html', async () => {
    const outFile = `/tmp/index.html`;
    const entry = {
        src: `${__dirname}/../fixtures/client/index.html`,
        out: outFile,
    };
    await unlink(outFile).catch(() => 0);
    await renderHTML(entry);
    const actualOut = await readFile(outFile, 'utf-8');
    expect(actualOut).toBe(`<h1>ciao</h1>\n`);
    await unlink(outFile);
});

test('renderHTML use layout file', async () => {
    const outFile = `/tmp/index.html`;
    const entry = {
        src: `${__dirname}/../fixtures/client/index.html`,
        out: outFile,
        layoutPath: `${__dirname}/../fixtures/alayout`,
    };
    await unlink(outFile).catch(() => 0);
    await renderHTML(entry);
    const actualOut = await readFile(outFile, 'utf-8');
    expect(actualOut).toBe(`===<h1>ciao</h1>\n===`);
    await unlink(outFile);
});
