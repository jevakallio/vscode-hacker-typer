import * as vscode from "vscode";
import * as Cache from "vscode-cache";
import { Buffer } from "./buffers";
import { SerializedBuffer, rehydrateBuffer } from "./rehydrate";

const LISTINGS = "HackerTyper:Listings";
const MACROS = "HackerTyper:Macros";

type Metadata = {
  name: string;
  description: string;
};

type Macro = Metadata & {
  buffers: Buffer[];
};

/*
  Stores macros in a persistent caches, where
  - Metadata is stores in an array under key ${hackerTyperMetadataListing}
  - Individual buffers are stored under keys ${Metadata.name}
*/
export default class Storage {
  // Singleton because we need ExtensionContext to initialize
  // a cache, and we can only do it upon activation, but we also
  // only want to initialize it once  ¯\_(ツ)_/¯
  private static _instance: Storage | undefined;
  public static getInstance(context: vscode.ExtensionContext) {
    if (Storage._instance) {
      return Storage._instance;
    }

    return (Storage._instance = new Storage(context));
  }

  private _listings: Cache<Metadata>;
  private _macros: Cache<SerializedBuffer[]>;

  private constructor(context: vscode.ExtensionContext) {
    this._listings = new Cache(context, LISTINGS);
    this._macros = new Cache(context, MACROS);
  }

  /**
   * List all metadata items
   */
  public list(): Metadata[] {
    const listings = this._listings.all();
    return Object.keys(listings).map(key => listings[key]);
  }

  /**
   * Get full macro metadata and buffers by name
   * @param name Get
   */
  public getByName(name: string): Macro {
    const listing = this._listings.get(name);
    const buffers = this._macros.get(name);
    return {
      ...listing,
      buffers: buffers.map(rehydrateBuffer)
    };
  }

  /**
   * Saves the given macro
   * @param macro Macro metadata and buffers to store
   */
  public save(macro: Macro): Promise<Macro> {
    const { buffers, ...metadata } = macro;
    const operations = [
      this._listings.put(macro.name, metadata),
      // @TODO this might be the dumbest thing ever
      this._macros.put(macro.name, JSON.parse(JSON.stringify(buffers)))
    ];

    return Promise.all(operations).then(() => {
      return macro;
    });
  }
}
