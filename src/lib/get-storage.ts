import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import superjson from "superjson";
import { PersistStorage } from "zustand/middleware";

export function getStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      const compressedData = localStorage.getItem(name);
      if (!compressedData) return null;
      const decompressedData =
        decompressFromEncodedURIComponent(compressedData);
      return decompressedData ? superjson.parse(decompressedData) : null;
    },
    removeItem: (name) => localStorage.removeItem(name),
    setItem: (name, value) => {
      const serializedData = superjson.stringify(value);
      const compressedData = compressToEncodedURIComponent(serializedData);
      localStorage.setItem(name, compressedData);
    },
  };
}
