import { StrutAny, StrutInfer, } from "binparse";

import logger from "./logger";

import * as fs from "fs/promises";

export default class CodeBinFile<T extends StrutAny> {
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
        const reader = new CodeBinFile(parser);
        await reader.readFile(file);
        if (!reader._buf || reader._buf.length <= 0) throw new Error("Unable to load file");
        // first 4 bytes are length of file in rows
        logger.info(`Loaded code bin: ${file}, length: ${reader._buf.length}`);
        return reader;
    }

    async read<K = StrutInfer<T>>(): Promise<K> {
        return this._parser.parse(this._buf, {offset: 0, startOffset: 0});
    }
}