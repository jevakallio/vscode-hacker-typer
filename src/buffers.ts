import * as vscode from "vscode";

let buffers: Buffer[] = [];

export type Buffer = {
  changes: vscode.TextDocumentContentChangeEvent[];
  selections: vscode.Selection[];
  position: number;
};

export function all() {
  return buffers;
}

export function get(position: number) {
  if (position === undefined || position < 0 || position >= buffers.length) {
    throw new Error(`No buffer found at ${position}`);
  }

  return buffers[position];
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
