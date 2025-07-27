import BinFile from "./lib/binfile";
import SkillDB from "./lib/skilldb";
import { ClassNames, type Skill } from "@/shared/types";
import SkillTabDB from "./lib/skilltabdb";
import StringDB from "./lib/stringdb";
import { D2SkillDesc, D2Skills, D2SkillTabs, D2Tbl } from "./lib/structs";
import TblFile from "./lib/tblfile";

import logger from "./lib/logger";

export default class DataManager {
    private _bin_base_path: string;
    private _tbl_base_path: string;
    private _tbl_names = ["string.tbl", "expansionstring.tbl", "patchstring.tbl"] as const;
    
    private _class_index_lookup = ClassNames

    private _max_skill_tabs = 9;

    stringDB: StringDB = new StringDB();
    skillDB: SkillDB = new SkillDB();
    tabDB: SkillTabDB = new SkillTabDB(); 
    
    private constructor(binBasePath: string, tblBasePath: string)
    {
        this._bin_base_path = binBasePath.trim();
        this._tbl_base_path = tblBasePath.trim();
        if (this._bin_base_path.endsWith("/")) this._bin_base_path = this._bin_base_path.slice(0, -1);
        if (this._tbl_base_path.endsWith("/")) this._tbl_base_path = this._tbl_base_path.slice(0, -1);
    }

    private async loadStrings() {
        const strSkillTabs: Record<string, number> = {};
        for (const tblFile of this._tbl_names) {
            const reader = await TblFile.open(`${this._tbl_base_path}/${tblFile}`, D2Tbl);
            const res = await reader.read();
            if (res === null) throw new Error(`Failed to load tbl ${this._tbl_base_path}/${tblFile}`);
            const strings = res.hashTable;
            switch (tblFile) {
                case "string.tbl":
                    for (const i of strings) this.stringDB.classic.add(i.key, i.index, i.value);    
                    break;
                case "expansionstring.tbl":
                    for (const i of strings) this.stringDB.expansion.add(i.key, i.index, i.value);    
                    break;
                case "patchstring.tbl":
                    for (const i of strings) {
                        if (i.key.startsWith("StrSkillTabs")) strSkillTabs[i.key] = i.index;
                        this.stringDB.patch.add(i.key, i.index, i.value)
                    }
                    Object.keys(strSkillTabs).forEach(k => {
                        const v: string[] = [];
                        for (let i = 0; i < this._max_skill_tabs; i++) {
                            const s = this.stringDB.patch.get(strSkillTabs[k] + i);
                            if (s) v.push(s);
                        }
                        this.stringDB.patch.add(k, strSkillTabs[k], v.join(","));
                    });
                    break;
                default:
                    throw new Error(`Invalid tbl file: ${tblFile}`);
            }
            logger.info(`Loaded tbl: ${this._tbl_base_path}/${tblFile}, strings: ${strings.length}`);
        }
    }

    private async loadSkills() {
        if (this.stringDB.size === 0) throw new Error("Must load stringdb before skills");
        const skillsFile = await BinFile.open(`${this._bin_base_path}/skills.bin`, D2Skills);
        logger.info(`Loaded ${this._bin_base_path}/skills.bin, length: ${skillsFile.size}, num rows: ${skillsFile.numRows}, row length: ${skillsFile.rowLength}`);
        const skillsDescFile = await BinFile.open(`${this._bin_base_path}/skilldesc.bin`, D2SkillDesc);
        logger.info(`Loaded ${this._bin_base_path}/skilldesc.bin, length: ${skillsDescFile.size}, num rows: ${skillsDescFile.numRows}, row length: ${skillsDescFile.rowLength}`);
        const skills = await skillsFile.readAllRows();
        const skillDescs = await skillsDescFile.readAllRows();
        for (const skill of skills) {
            const desc = skillDescs[skill.skillDescIndex];
            if (typeof desc === "undefined") {
                continue;
            }
            const n = this.getString(desc.nameIndex);
            const sn = this.getString(desc.shortNameIndex);
            const ln = this.getString(desc.longNameIndex);
            if (!n) {
                logger.warn(`Skill ${skill.index} has no name`);
                continue;
            }
            if (!sn) {
                logger.warn(`Skill ${skill.index} has no short name`);
                continue;
            }
            if (!ln) {
                logger.warn(`Skill ${skill.index} has no long name`);
                continue;
            }
            const c = skill.classID >= this._class_index_lookup.length ? "" : this._class_index_lookup[skill.classID];
            const s: Skill = {
                name: n,
                shortName: sn,
                longName: ln,
                iconPath: `${c}/icons-${c}_${desc.iconIndex}.png`,
                class: c,
                column: desc.column,
                page: desc.page,
                row: desc.row,
                reqSkill1: "", // have to build the skilldb then update these
                reqSkill2: "",
                reqSkill3: "",
            }
            this.skillDB.skills.add(skill.index, s);
        }
        // with skill db built we can go back and update the required skills
        for (const skill of skills) {
            const s = this.skillDB.getByIndex(skill.index);
            if (!s) continue;
            const rs1id = skill.reqSkill1Index;
            const rs2id = skill.reqSkill2Index;
            const rs3id = skill.reqSkill3Index;
            if (rs1id && rs1id !== 65535) { // uint16 max = 2^16 - 1
                s.reqSkill1 = this.skillDB.getByIndex(rs1id)?.name ?? "";
            }
            if (rs2id && rs2id !== 65535) {
                s.reqSkill2 = this.skillDB.getByIndex(rs2id)?.name ?? "";
            }
            if (rs3id && rs3id !== 65535) {
                s.reqSkill3 = this.skillDB.getByIndex(rs3id)?.name ?? "";
            }
            this.skillDB.skills.idxMap[skill.index] = s;
        }
        logger.info(`Loaded skill db, skills: ${this.skillDB.size}`);
    }

    private async loadSkillTabs() {
        if (this.stringDB.size === 0) throw new Error("Must load stringdb before skills");
        const tabFile = await BinFile.open(`${this._bin_base_path}/skilltabs.bin`, D2SkillTabs);
        logger.info(`Loaded ${this._bin_base_path}/skilltabs.bin, length: ${tabFile.size}, num rows: ${tabFile.numRows}, row length: ${tabFile.rowLength}`);
        const tabs = await tabFile.readAllRows();
        tabs.forEach((tab, idx) => {
            if (tab.classCode >= this._class_index_lookup.length || tab.classCode < 0) {
                logger.warn(`tab: ${idx} has invalid classcode of: ${tab.classCode}`);
                return;
            }
            const c = this._class_index_lookup[tab.classCode];
            const d = this.getString(tab.tabDescIndex);
            if (!d) {
                logger.warn(`tab: ${idx} has no description!`);
                return;
            }
            const tn = this.getString(`StrSkillTabs${c[0].toUpperCase() + c.slice(1)}`);
            if (!tn) {
                logger.warn(`tab: ${idx} does not have any StrSkillTabs defined!`);
                return;
            }
            this.tabDB.tabs.add(idx, {
                class: c,
                page: tab.page,
                tabDesc: d,
                tabName: tn.split(",")[tab.page]
            });
        })
        // not every tab has a description in skilltabs.bin so we patch the holes here
        for (const c of this._class_index_lookup) {
            const classTabs = this.tabDB.getByClass(c);
            const missingTabs: number[] = [];
            for (let i = 0; i < this._max_skill_tabs; i++) {
                if (classTabs.find(t => t.page === i)) continue;
                missingTabs.push(i);
            }
            for (const tabNum of missingTabs) {
                const tn = this.getString(`StrSkillTabs${c[0].toUpperCase() + c.slice(1)}`);
                if (!tn) {
                    logger.warn(`tab: ${tabNum} does not have any StrSkillTabs defined!`);
                    continue;
                }
                if (!tn.split(",")[tabNum]) continue;
                this.tabDB.tabs.add(this.tabDB.tabs.idxMap.length, {
                    class: c,
                    page: tabNum,
                    tabDesc: "",
                    tabName: tn.split(",")[tabNum]
                })
            }
        }
        logger.info(`Loaded skilltabs db, tabs: ${this.tabDB.size}`);
    }

    static async init(binPath: string, tblPath: string) {
        const manager = new DataManager(binPath, tblPath);
        await manager.loadStrings();
        await manager.loadSkills();
        await manager.loadSkillTabs();
        return manager;
    }

    getString(key: number | string) {
        if (typeof key === "number") return this.stringDB.getByIndex(key);
        return this.stringDB.getByKey(key);
    }

    getSkills(key: number | string) {
        if (typeof key === "number") {
            const r = this.skillDB.getByIndex(key);
            if (typeof r === "undefined") return [];
            return [r];
        }; // return an array here to make the return signature nicer even though this is one element
        if (this._class_index_lookup.includes(key as (typeof this._class_index_lookup)[number])) return this.skillDB.getByClass(key);
        return this.skillDB.getByName(key);
    }

    getSkillTabs(key: (typeof this._class_index_lookup)[number] | number) {
        if (typeof key === "number") return [this.tabDB.getByIndex(key)];
        if (this._class_index_lookup.includes(key)) return this.tabDB.getByClass(key);
        throw new Error(`Got ${key} expected class name or number`);
    }
}