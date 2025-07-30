import { createContext, ParentProps, useContext } from "solid-js";
import { Attribute, ClassName } from "../App";
import { SkillResponse } from "../../../shared/types";
import { createStore, SetStoreFunction } from "solid-js/store";

export interface Character {
    class: ClassName | "NONE";
    skills: (SkillResponse & {
        pointsAssigned: number;
    })[];
    attributes: {
        [K in Attribute]: number;
    };
    skillPointsRemaining: number;
    attributePointsRemaining: number;
    version: string;
}

export const INITIAL_CHARACTER: Character = {
    class: "NONE",
    skills: [],
    attributes: {
        Dexterity: 0,
        Intelligence: 0,
        Strength: 0,
        Vitality: 0,
    },
    skillPointsRemaining: 163, // 149 from levels, 12 from quests, 2 from triune,
    attributePointsRemaining: 1175, // 745 from levels, 30 from quests, 400 from signets
    version: "",
};

export const CharacteStoreContext = createContext<[get: Character, set: SetStoreFunction<Character>]>();

export const CharacterStoreProvider = (props: ParentProps) => {
    const [store, setStore] = createStore<Character>(INITIAL_CHARACTER);

    return <CharacteStoreContext.Provider value={[store, setStore]}>{props.children}</CharacteStoreContext.Provider>;
};

export const useCharacterStore = () => {
    const store = useContext(CharacteStoreContext);
    if (!store) throw new Error("No initial character context value provided");
    return store;
};
