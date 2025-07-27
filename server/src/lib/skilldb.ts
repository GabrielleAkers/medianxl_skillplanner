import { type Skill } from "@/shared/types";

class SkillTable {
    idxMap: Skill[] = [];

    add(index: number, value: Skill) {
        this.idxMap[index] = value;
    }

    get(index: number){
        return this.idxMap[index];
    }
}

export default class SkillDB {
    skills = new SkillTable();

    get size() {
        return this.skills.idxMap.length;
    }

    getByIndex(index: number) {
        return this.skills.get(index);
    }

    getByName(name: string): Skill[] {
        return this.skills.idxMap.filter(s => s.name === name);
    }

    getByClass(classname: string): Skill[] {
        return this.skills.idxMap.filter(s => s.class === classname);
    }
}