import * as vscode from "vscode";
import dummy from "./test/data";
import { rehydrateBuffer } from "./rehydrate";

let buffers: Buffer[] = dummy.map(rehydrateBuffer);

export type StopPoint = {
  position: number;
  stop: {
    name: string | null;
  };
};

export type Frame = {
  changes: vscode.TextDocumentContentChangeEvent[];
  selections: vscode.Selection[];
  position: number;
};

export type Buffer = StopPoint | Frame;

export function isStopPoint(buffer: Buffer): buffer is StopPoint {
  return (
    (<StopPoint>buffer).stop !== undefined && (<StopPoint>buffer).stop !== null
  );
}

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
