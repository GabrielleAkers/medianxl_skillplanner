export const ExpansionOffset = 20000;
export const PatchOffset = 10000;
export const ClassicOffset = 0;

class StringTable {
    kvMap: Map<string, string> = new Map();
    idxMap: string[] = [];

    add(key: string, index: number, value: string) {
        this.idxMap[index] = value;

        if (key === "x" || key === "X") return;
        if (value.trim() === "") return;
        const k = this.kvMap.get(key);
        if (k && k.trim() === value.trim()) return;
        this.kvMap.set(key, value);
    }

    get(index: number): string | undefined {
        return this.idxMap[index];
    }
}

export default class StringDB {
    expansion = new StringTable();
    patch = new StringTable();
    classic = new StringTable();

    get size() {
        return this.expansion.kvMap.size + this.patch.kvMap.size + this.classic.kvMap.size;
    }

    getByIndex(index: number): string | undefined {
        if (index >= ExpansionOffset) return this.expansion.get(index - ExpansionOffset);
        if (index >= PatchOffset) return this.patch.get(index - PatchOffset);
        return this.classic.get(index);
    }

    getByKey(key: string): string | undefined {
        const exp = this.expansion.kvMap.get(key);
        if (exp !== undefined) return exp;
        const patch = this.patch.kvMap.get(key);
        if (patch !== undefined) return patch;
        return this.classic.kvMap.get(key);
    }
}