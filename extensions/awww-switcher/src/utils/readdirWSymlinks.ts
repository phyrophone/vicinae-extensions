import { Dirent } from "fs";
import { readdir, stat } from "fs/promises";
import _path from "path";

// wrapper for readdir() that follows symlinks
export async function readdirWSymlinks(path: string): Promise<Dirent<string>[]> {
  try {
    const entries = await readdir(path, { recursive: true, withFileTypes: true });
    const result: Dirent<string>[] = [];

    for (const entry of entries) {
      const fullpath = _path.join(entry.parentPath, entry.name);
      
      if (entry.isFile()) {
        result.push(entry);
      } else if (entry.isSymbolicLink()) {
        const stats = await stat(fullpath);
        if (stats.isFile()) {
          result.push(entry)
        } else if (stats.isDirectory()) {
          result.push(...await readdirWSymlinks(fullpath)) 
        }
      }
    }
    return result;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get images from provided path");
  }
}