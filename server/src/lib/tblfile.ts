import { StrutAny, StrutInfer, } from "binparse";

import * as fs from "fs/promises";

export default class TblFile<T extends StrutAny> {
    private _buf: Buffer<ArrayBufferLike> = Buffer.from(new Uint8Array());
    private _parser = {} as T;

    private constructor(parser: T) {
        this._parser = parser;
    }

    private async readFile(file: Buffer | string) {
        if (typeof(file) === "string")
            this._buf = await fs.readFile(file);
        else
            this._buf = file;
    }

    static async open<T extends StrutAny>(file: Buffer | string, parser: T) {
        const reader = new TblFile(parser);
        await reader.readFile(file);
        if (!reader._buf || reader._buf.length <= 0) throw new Error("Unable to load file");
        return reader;
    }

    async read<K = StrutInfer<T>>(): Promise<K> {
        return this._parser.parse(this._buf, {offset: 0, startOffset: 0});
    }
}