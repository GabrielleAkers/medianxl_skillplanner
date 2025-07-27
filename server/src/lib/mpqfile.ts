import * as fs from "fs/promises";
import * as assert from "assert/strict";

import implode from "implode-decoder";

import { MpqBlockTableEntry, MpqHashTableEntry, MpqHeader } from "./structs";

const MpqEncryptionTable: number[] = [];
let encryptionSeed = 0x00100001;
for (let i = 0; i < 0x100; i++) {
    let k = i;
    for (let j = 0; j < 5; j++) {
        encryptionSeed = (encryptionSeed * 125 + 3) % 0x2aaaab;
        const t1 = (encryptionSeed & 0xffff) << 0x10;

        encryptionSeed = (encryptionSeed * 125 + 3) % 0x2aaaab;
        const t2 = encryptionSeed & 0xffff;
        MpqEncryptionTable[k] = t1 | t2;
        k += 0x100;
    }
}

const charA = 'a'.charCodeAt(0);
const charZ = 'z'.charCodeAt(0);

const upperCaseChange = charA - 'A'.charCodeAt(0);

export enum MpqHashType {
    TableOffset = 0,
    HashA = 1,
    HashB = 2,
    Table = 3,
}

export enum MpqFlags {
  Implode = 0x00000100,
  Compressed = 0x00000200,
  Encrypted = 0x00010000,
  EncryptionFix = 0x00020000,
  SingleUnit = 0x01000000,
  Crc = 0x04000000,
  Exists = 0x80000000,
}

export async function decompressPkWare(sector: Buffer, offset: number, size: number): Promise<Buffer> {
  const buf = sector.slice(offset, offset + size);

  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const decode = new implode();
    decode.push = (buffer: Buffer): unknown => buffers.push(buffer);
    decode.on('error', reject);
    decode._transform(buf, null, () => {
      decode._flush(() => resolve(Buffer.concat(buffers)));
    });
  });
}

let id = 1;
export default class MpqFile {
    private _id: number;
    private _name: string;
    private _file_name: string = "";
    private _file_handle: Promise<fs.FileHandle> | null = null;
    private _hash_table: Map<string, MpqHashTableEntry> = new Map();
    private _block_table: MpqBlockTableEntry[] = [];
    private _header: Promise<MpqHeader> | null = null;
    
    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get fileHandle() {
        if (this._file_handle === null) this._file_handle = fs.open(this._file_name, "r");
        return this._file_handle;
    }

    get header() {
        if (this._header === null) this._header = this.readHeader();
        return this._header;
    }

    private constructor(file: string, name?: string) {
        this._file_name = file;
        this._id = id++;
        this._name = name ?? `Mpq-${this._id}`;
    }

    private async read(offset: number, numBytes: number) {
        const buf = Buffer.allocUnsafe(numBytes);
        const f = await this.fileHandle;
        await f.read(buf, 0, numBytes, offset);
        return buf;
    }

    private async readHeader() {
        const headerBuf = await this.read(0, 32);
        const header = MpqHeader.raw(headerBuf);

        if (header.magic !== 'MPQ\x1a') throw new Error('Only MPQ.magic 0x1a is supported');
        if (header.formatVersion !== 0) throw new Error('Only MPQ.format 0x00 is supported');

        const hashTableSize = header.hashTableEntries * 16;
        const hashTableBuf = await this.read(header.hashTableOffset, hashTableSize);
        MpqFile.decrypt(hashTableBuf, MpqFile.hash(`(hash table)`, MpqHashType.Table));

        const blockTableSize = header.blockTableEntries * 16;
        const blockTableBuf = await this.read(header.blockTableOffset, blockTableSize);
        MpqFile.decrypt(blockTableBuf, MpqFile.hash(`(block table)`, MpqHashType.Table));

        const ctx = { offset: 0, startOffset: 0 };
        const blockTable: MpqBlockTableEntry[] = [];
        for (let i = 0; i < header.blockTableEntries; i++) blockTable.push(MpqBlockTableEntry.parse(blockTableBuf, ctx));
        this._block_table = blockTable;

        ctx.offset = 0;
        ctx.startOffset = 0;
        const hashTable: Map<string, MpqHashTableEntry> = new Map();
        for (let i = 0; i < header.hashTableEntries; i++) {
            const entry = MpqHashTableEntry.parse(hashTableBuf, ctx);
            const hashKey = `${entry.hashB}.${entry.hashA}`;
            hashTable.set(hashKey, entry);
        }
        this._hash_table = hashTable;

        return header;
    }

    private async getFileEntry(file: string) {
        await this.header;
        const hA = MpqFile.hash(file, MpqHashType.HashA);
        const hB = MpqFile.hash(file, MpqHashType.HashB);
        return this._hash_table.get(`${hB}.${hA}`);
    }

    static hash(str: string, hashType: MpqHashType) {
        if (str.includes('/') && !str.includes('\\')) str = str.replace(/\//g, '\\');
        let seed1 = 0x7fed7fed;
        let seed2 = 0xeeeeeeee;
        for (let i = 0; i < str.length; i++) {
            let ch = str.charCodeAt(i);
            if (ch >= charA && ch < charZ) ch -= upperCaseChange;
            const value = MpqEncryptionTable[(hashType << 8) + ch];
            seed1 = value ^ (seed1 + seed2);
            seed2 = ch + seed1 + seed2 + (seed2 << 5) + 3;
        }
        return seed1 >>> 0;
    }

    static decrypt(data: Buffer, key: number, offset = 0, size = data.length) {
        let hash = key;
        let seed = 0xeeeeeeee;

        for (let i = 0; i < size; i += 4) {
            seed += MpqEncryptionTable[0x400 + (hash & 0xff)];
            let value = data.readUInt32LE(offset);
            value = (value ^ (hash + seed)) >>> 0;

            data.writeUInt32LE(value, offset);
            offset += 4;

            hash = ((~hash << 0x15) + 0x11111111) | (hash >>> 0x0b);
            seed = value + seed + (seed << 5) + 3;
        }
    }

    static decryptionKey(str: string) {
        let lastIndex = str.length - 1;
        for (; lastIndex >= 0; lastIndex--) {
            const c = str.charAt(lastIndex);
            if (c === "\\") break;
            if (c === "/") break;
        }
        return MpqFile.hash(str.slice(lastIndex + 1), MpqHashType.Table);
    }

    static async open(file: string, name?: string) {
        const mpq = new MpqFile(file, name);
        await mpq.fileHandle;
        return mpq;
    }

    async close() {
        if (this._file_handle) (await this._file_handle).close();
    }

    async has(file: string) {
        return await this.getFileEntry(file) !== undefined;
    }

    async extract(file: string) {
        const header = await this.header;
        const hashEntry = await this.getFileEntry(file);
        if (hashEntry === undefined) return null;

        const blockEntry = this._block_table[hashEntry.blockTableIndex];

        if (blockEntry === undefined) return null;
        if ((blockEntry.flags & MpqFlags.Exists) === MpqFlags.Exists) return null;
        if (blockEntry.archivedSize === 0) return Buffer.alloc(0);

        const isEncrypted = (blockEntry.flags & MpqFlags.Encrypted) === MpqFlags.Encrypted;
        const isEncryptionFix = (blockEntry.flags & MpqFlags.EncryptionFix) === MpqFlags.EncryptionFix;

        let decryptKey = -1;
        if (isEncrypted) {
            decryptKey = MpqFile.decryptionKey(file);
            if (isEncryptionFix) {
                const fkey = (BigInt(decryptKey) + BigInt(blockEntry.offset)) ^ BigInt(blockEntry.size);
                decryptKey = Number(fkey);
            }
        }

        const isImplode = (blockEntry.flags & MpqFlags.Implode) === MpqFlags.Implode;

        const sectorSize = 512 << header.sectorSizeShift;
        const sectors = Math.ceil(blockEntry.size / sectorSize);

        const fileData = await this.read(blockEntry.offset, blockEntry.archivedSize);
        if (isEncrypted) MpqFile.decrypt(fileData, decryptKey - 1, 0, (sectors + 1) * 4);

        const outBuf = Buffer.allocUnsafe(blockEntry.size);
        for (let i = 0; i < sectors; i++) {
            const currOffset = fileData.readUInt32LE(i * 4);
            const nextOffset = fileData.readUInt32LE(i * 4 + 4);
            if (nextOffset < currOffset) throw new Error(`Invalid sectors detected in MPQ ${this._file_name}`);

            const currSectorSize = nextOffset - currOffset;
            if (currSectorSize > sectorSize) throw new Error(`Current sector size > sector size in MPQ ${this._file_name}`);
            if (currOffset > blockEntry.archivedSize) throw new Error(`Sector overflow in MPQ ${this._file_name}`);

            if (isEncrypted) MpqFile.decrypt(fileData, decryptKey + i, currOffset, currSectorSize);

            if (currSectorSize === sectorSize) {
                fileData.copy(outBuf, i * sectorSize, currOffset, currOffset + sectorSize);
                continue;
            }

            if (isImplode) {
                const decompBytes = await decompressPkWare(fileData, currOffset, currSectorSize);
                decompBytes.copy(outBuf, i * sectorSize, 0, decompBytes.length);
            } else {
                const decompBytes = await decompressPkWare(fileData, currOffset + 1, currSectorSize - 1);
                decompBytes.copy(outBuf, i * sectorSize, 0, decompBytes.length);
            }
        }
        blockEntry.flags = blockEntry.flags & ~MpqFlags.Encrypted;
        assert.equal(outBuf.length, blockEntry.size, `Decode failed for MPQ ${this._file_name}, got size: ${outBuf.length}, expected: ${blockEntry.size}`);
        return outBuf;
    }
}