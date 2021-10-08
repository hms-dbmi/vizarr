import type { AsyncStore } from 'zarr/types/storage/types';
import { KeyError } from 'zarr';

async function getFileHandle(root: FileSystemDirectoryHandle, key: string) {
  const dirs = key.split('/');
  const fname = dirs.pop()!;
  for (const dir of dirs) {
    root = await root.getDirectoryHandle(dir);
  }
  return root.getFileHandle(fname);
}

export class FileSystemStore implements AsyncStore<ArrayBuffer> {
  constructor(public root: FileSystemDirectoryHandle) {}

  static async fromDirectoryPicker() {
    return new FileSystemStore(await window.showDirectoryPicker());
  }

  async getItem(key: string) {
    const fileHandle = await getFileHandle(this.root, key).catch((_) => {
      throw new KeyError(key);
    });
    const file = await fileHandle.getFile();
    return file.arrayBuffer();
  }

  containsItem(key: string) {
    return getFileHandle(this.root, key)
      .then((_) => true)
      .catch((_) => false);
  }

  keys() {
    return Promise.resolve([]);
  }

  deleteItem(key: string): never {
    throw new Error('deleteItem not implemented');
  }

  setItem(key: string, value: ArrayBuffer): never {
    throw new Error('setItem not implemented');
  }
}
