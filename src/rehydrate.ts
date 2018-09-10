import * as vscode from "vscode";
import * as buffers from "./buffers";

type SerializedPosition = {
  line: number;
  character: number;
};

type SerializedRange = SerializedPosition[];

interface SerializedChangeEvent {
  range: SerializedRange;
  rangeOffset: number;
  rangeLength: number;
  text: string;
}

interface SerializedSelection {
  start: SerializedPosition;
  end: SerializedPosition;
  active: SerializedPosition;
  anchor: SerializedPosition;
}

export interface SerializedStartingPoint {
  content: string;
  language: string;
  position: number;
  selections: SerializedSelection[];
}
export interface SerializedStopPoint {
  stop: { name: string | null };
  position: number;
}
export interface SerializedFrame {
  changes: SerializedChangeEvent[];
  selections: SerializedSelection[];
  position: number;
}

export type SerializedBuffer =
  | SerializedFrame
  | SerializedStopPoint
  | SerializedStartingPoint;

function isStartingPoint(
  buffer: SerializedBuffer
): buffer is SerializedStartingPoint {
  return (<SerializedStartingPoint>buffer).content !== undefined;
}

function isStopPoint(buffer: SerializedBuffer): buffer is SerializedStopPoint {
  return (<SerializedStopPoint>buffer).stop !== undefined;
}

function rehydratePosition(serialized: SerializedPosition): vscode.Position {
  return new vscode.Position(serialized.line, serialized.character);
}

function rehydrateRange([start, stop]: SerializedRange): vscode.Range {
  return new vscode.Range(rehydratePosition(start), rehydratePosition(stop));
}

function rehydrateSelection(serialized: SerializedSelection): vscode.Selection {
  return new vscode.Selection(
    rehydratePosition(serialized.anchor),
    rehydratePosition(serialized.active)
  );
}

function rehydrateChangeEvent(
  serialized: SerializedChangeEvent
): vscode.TextDocumentContentChangeEvent {
  return {
    ...serialized,
    range: rehydrateRange(serialized.range)
  };
}

export function rehydrateBuffer(serialized: SerializedBuffer): buffers.Buffer {
  if (isStopPoint(serialized)) {
    return {
      position: serialized.position,
      stop: {
        name: serialized.stop.name || null
      }
    };
  }

  if (isStartingPoint(serialized)) {
    return {
      position: serialized.position,
      content: serialized.content,
      language: serialized.language,
      selections: serialized.selections.map(rehydrateSelection)
    };
  }

  return {
    position: serialized.position,
    changes: serialized.changes.map(rehydrateChangeEvent),
    selections: serialized.selections.map(rehydrateSelection)
  };
}
