import { type SkillTab } from "@/shared/types";

class SkillTabTable {
    idxMap: SkillTab[] = [];

    add(index: number, value: SkillTab) {
        this.idxMap[index] = value;
    }

    get(index: number) {
        return this.idxMap[index];
    }
}

export default class SkillTabDB {
    tabs = new SkillTabTable();

    get size() {
        return this.tabs.idxMap.length;
    }

    getByIndex(index: number) {
        return this.tabs.get(index);
    }

    getByClass(classname: string): SkillTab[] {
        return this.tabs.idxMap.filter(s => s.class === classname);
    }
}