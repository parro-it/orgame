import { unlink, readFile } from 'fs/promises';
import { renderMarkdown } from '../src/actions';

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
