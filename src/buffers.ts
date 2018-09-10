import * as vscode from "vscode";

let buffers: Buffer[] = [];

type WithPosition = {
  position: number;
};

export type StartingPoint = WithPosition & {
  content: string;
  selections: vscode.Selection[];
};

export type StopPoint = WithPosition & {
  stop: {
    name: string | null;
  };
};

export type Frame = WithPosition & {
  changes: vscode.TextDocumentContentChangeEvent[];
  selections: vscode.Selection[];
};

export type Buffer = StartingPoint | StopPoint | Frame;

export function isStartingPoint(buffer: Buffer): buffer is StartingPoint {
  return (
    (<StartingPoint>buffer).content !== undefined &&
    (<StartingPoint>buffer).content !== null
  );
}

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
