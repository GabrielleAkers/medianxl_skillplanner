export const ClassNames = ["ama", "sor", "nec", "pal", "bar", "dru", "ass"] as const; // order very important
export type ClassNames = typeof ClassNames;
export type ClassName = ClassNames[number];

export interface Skill {
    name: string;
    shortName: string;
    longName: string;
    class: string;
    iconPath: string;
    page: number;
    row: number;
    column: number;
    reqSkill1: string;
    reqSkill2: string;
    reqSkill3: string;
}

export interface SkillTab {
    class: string;
    page: number;
    tabDesc: string;
    tabName: string;
}

interface SkillResponse extends Skill {
    b64IconBlob: string;
}

export interface SkillTreeResponse {
    skills: SkillResponse[];
    skillTabs: SkillTab[];
}