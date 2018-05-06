// partial and incomplete  ¯\_(ツ)_/¯

declare module "vscode-cache" {
  import { ExtensionContext } from "vscode";

  namespace Cache {

  }
  class Cache<T> {
    constructor(context: ExtensionContext, namespace: string);
    all(): { [key: string]: T };
    get(key: string): T;
    put(key: string, thing: T): Promise<void>;
  }

  export = Cache;
}
