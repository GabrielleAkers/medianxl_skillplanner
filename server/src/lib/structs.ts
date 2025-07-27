import { bp, StrutInfer } from "binparse";

export const MpqHeader = bp.object("MpqHeader", {
    magic: bp.string(4),
    headerSize: bp.lu32,
    archivedSize: bp.lu32,
    formatVersion: bp.lu16,
    sectorSizeShift: bp.lu16,
    hashTableOffset: bp.lu32,
    blockTableOffset: bp.lu32,
    hashTableEntries: bp.lu32,
    blockTableEntries: bp.lu32,
});

export type MpqHeader = StrutInfer<typeof MpqHeader>;

export const MpqHashTableEntry = bp.object("MpqHashTableEntry", {
    hashA: bp.lu32,
    hashB: bp.lu32,
    locale: bp.lu16,
    platform: bp.lu16,
    blockTableIndex: bp.lu32,
});

export type MpqHashTableEntry = StrutInfer<typeof MpqHashTableEntry>;

export const MpqBlockTableEntry = bp.object("MpqBlockTableEntry", {
    offset: bp.lu32,
    archivedSize: bp.lu32,
    size: bp.lu32,
    flags: bp.lu32,
});

export type MpqBlockTableEntry = StrutInfer<typeof MpqBlockTableEntry>;

export const D2SkillDesc = bp.object("D2SkillDesc", {
    index: bp.lu16,
    page: bp.u8,
    row: bp.u8,
    column: bp.u8,
    nameIndex: bp.at(0x08, bp.lu16),
    shortNameIndex: bp.at(0x0A, bp.lu16),
    longNameIndex: bp.at(0x0C, bp.lu16),
    iconIndex: bp.at(0x16, bp.lu16), // PK shows this as a byte at 0x07 but median uses 2 bytes at 0x16
});

export type D2SkillDesc = StrutInfer<typeof D2SkillDesc>;

export const D2Skills = bp.object("D2Skills", {
    index: bp.lu32,
    classID: bp.at(0x0C, bp.lu32),
    reqSkill1Index: bp.at(0x17E, bp.lu16),
    reqSkill2Index: bp.at(0x180, bp.lu16),
    reqSkill3Index: bp.at(0x182, bp.lu16),
    skillDescIndex: bp.at(0x194, bp.lu32),
    skPointsIndex: bp.at(0x170, bp.lu32)
});

export type D2Skills = StrutInfer<typeof D2Skills>;

const HashNode = bp.object("HashNode", {
    active: bp.u8,
    index: bp.lu16,
    hash: bp.lu32,
    key: bp.offset(bp.lu32, bp.string()),
    value: bp.offset(bp.lu32, bp.string()),
    valueLength: bp.lu16
});

export const D2Tbl = bp.object("D2Tbl", {
    crc: bp.lu16,
    count: bp.lu16,
    countHash: bp.lu32,
    version: bp.u8,
    dataOffset: bp.lu32,
    maxTries: bp.lu32,
    fileSize: bp.lu32,
    indexes: bp.array("HashIndex", bp.lu16, "count"),
    hashTable: bp.array("HashTable", HashNode, "countHash")
});

export type D2Tbl = StrutInfer<typeof D2Tbl>;

export const D2SkillTabs = bp.object("D2SkillTabs", {
    classCode: bp.u8,
    page: bp.u8,
    tabDescIndex: bp.lu16,
});

export type D2SkillTabs = StrutInfer<typeof D2SkillTabs>;

export const D2SkillsCode = bp.object("D2SkillsCode", {
    expTxt: bp.array("ExpTxt", bp.u8, 10240),
    expBin: bp.array("ExpBin", bp.u8, 10240),
    binLen: bp.lu32
});

export type D2SkillsCode = StrutInfer<typeof D2SkillsCode>;