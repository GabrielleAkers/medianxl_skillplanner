import { StrutAny, StrutInfer, } from "binparse";

import * as assert from "assert/strict";
import * as fs from "fs/promises";

export default class BinFile<T extends StrutAny> {
    private _buf: Buffer<ArrayBufferLike> = Buffer.from(new Uint8Array());
    private _parser = {} as T;
    private _row_length = -1 // bytes;
    private _num_rows = -1;

    get rowLength() {
        return this._row_length;
    }

    get numRows() {
        return this._num_rows;
    }

    get size() {
        return this._buf.length;
    }

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
        const reader = new BinFile(parser);
        await reader.readFile(file);
        if (!reader._buf || reader._buf.length <= 0) throw new Error("Unable to load file");
        // first 4 bytes are length of file in rows
        reader._num_rows = reader._buf.readUintLE(0, 4);
        reader._row_length = (reader._buf.length - 4) / reader._num_rows;
        assert.equal(reader._row_length, Math.floor(reader._row_length), `Malformed file, calculated row length: ${reader._row_length}, expected: ${Math.floor(reader._row_length)}`);
        return reader;
    }

    async readRow<K = StrutInfer<T>>(rowNum: number): Promise<K> {
        if (rowNum < 0) rowNum = 0;
        if (rowNum > this._num_rows - 1) rowNum = this._num_rows - 1;
        return this._parser.parse(this._buf, {offset: rowNum * this._row_length + 4, startOffset: rowNum * this._row_length + 4});
    }

    async readAllRows<K = StrutInfer<T>>(): Promise<K[]> {
        const rows = [] as K[];
        for (let i = 0; i < this._num_rows; i++) {
            rows.push(await this.readRow(i));
        }
        const total_len = rows.length * this._row_length + 4;
        assert.equal(total_len, this._buf.length, `Number of bytes read: ${total_len} does not match expected ${this._buf.length}`);
        return rows;
    }
}