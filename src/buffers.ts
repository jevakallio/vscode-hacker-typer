import * as vscode from "vscode";
import dummy from "./test/data";
import { rehydrateBuffer } from "./rehydrate";

let buffers: Buffer[] = dummy.map(rehydrateBuffer);

export type Buffer = {
  changes: vscode.TextDocumentContentChangeEvent[];
  selections: vscode.Selection[];
  position: number;
};

export function all() {
  return buffers;
}

export function get(position: number) {
  return buffers[position];
}

// @TODO LOL delete this shit
export function inject(_buffers: Buffer[]) {
  buffers = _buffers;
}

export function insert(buffer: Buffer) {
  buffers.push(buffer);
}

export function clear() {
  buffers = [];
}

export function count() {
  return buffers.length;
}
