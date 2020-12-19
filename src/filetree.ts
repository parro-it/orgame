import { readdir } from 'fs/promises';
import{ resolve } from 'path';

type FileEntry = {
    src: string,
    out: string
};

export async function* getFiles(srcDir: string, outDir: string): AsyncIterable<FileEntry> {
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