import { createContext, onMount, ParentProps, useContext } from "solid-js";
import { Attribute, ClassName } from "../App";
import { SkillResponse } from "../../../shared/types";
import { createStore, SetStoreFunction } from "solid-js/store";
import { Character } from "./CharacterStoreProvider";

export const SAVED_CHARACTERS_KEY = "saved-characters";

export interface SavedCharacter {
    name: string;
    data: string;
    class: ClassName;
}

export const INITIAL_SAVED_CHARACTERS: SavedCharacter[] = [];

export interface SavedCharacterContext {
    characters: SavedCharacter[];
    saveCharacter: (name: string, character: Character, className: ClassName) => void;
    loadCharacter: (name: string) => Character | null;
    loadCharacterFromCode: (code: string) => Character | null;
    deleteCharacter: (name: string) => void;
    toClipboard: (character: Character) => Promise<void>;
}

export const SavedCharacterContext = createContext<SavedCharacterContext>();

const isCharacter = (character: object): character is Character => {
    if (
        Object.hasOwn(character, "class") &&
        Object.hasOwn(character, "skills") &&
        Object.hasOwn(character, "attributes") &&
        Object.hasOwn(character, "skillPointsRemaining") &&
        Object.hasOwn(character, "attributePointsRemaining") &&
        Object.hasOwn(character, "version")
    ) {
        return true;
    }
    return false;
};

export const SavedCharacterStoreProvider = (props: ParentProps) => {
    const [store, setStore] = createStore<SavedCharacter[]>(INITIAL_SAVED_CHARACTERS);

    onMount(() => {
        const localStorageCharactersString = window.localStorage.getItem(SAVED_CHARACTERS_KEY);
        if (!localStorageCharactersString) return;
        const savedCharacters: { [k: string]: { class: ClassName; data: string } } = JSON.parse(localStorageCharactersString);
        if (savedCharacters)
            setStore(
                Object.entries(savedCharacters).map((kv) => ({
                    name: kv[0],
                    data: kv[1].data,
                    class: kv[1].class,
                }))
            );
    });

    const saveCharacter = (name: string, character: Character, className: ClassName) => {
        const localStorageCharactersString = window.localStorage.getItem(SAVED_CHARACTERS_KEY);
        if (localStorageCharactersString) {
            const savedCharacters: {
                [k: string]: {
                    data: string;
                    class: ClassName;
                };
            } = JSON.parse(localStorageCharactersString);
            const noims = { ...character };
            noims.skills = noims.skills.map((s) => ({ ...s, b64IconBlob: "" }));
            const b64Char = btoa(JSON.stringify(noims));
            savedCharacters[name] = { data: b64Char, class: className };
            window.localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(savedCharacters));
            const f = store.filter((c) => c.name !== name);
            setStore([...f, { name, data: b64Char, class: className }]);
        } else {
            const savedCharacters: {
                [k: string]: {
                    data: string;
                    class: ClassName;
                };
            } = {};
            const noims = { ...character };
            noims.skills = noims.skills.map((s) => ({ ...s, b64IconBlob: "" }));
            const b64Char = btoa(JSON.stringify(noims));
            window.localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(savedCharacters));
            const f = store.filter((c) => c.name !== name);
            setStore([...f, { name, data: b64Char, class: className }]);
        }
    };

    const loadCharacter = (name: string): Character | null => {
        const localStorageCharactersString = window.localStorage.getItem(SAVED_CHARACTERS_KEY);
        if (!localStorageCharactersString) return null;
        const savedCharacters: {
            [k: string]: {
                data: string;
                class: ClassName;
            };
        } = JSON.parse(localStorageCharactersString);
        if (!Object.hasOwn(savedCharacters, name)) return null;
        const character = JSON.parse(atob(savedCharacters[name].data));
        if (isCharacter(character)) return character;
        return null;
    };

    const loadCharacterFromCode = (code: string): Character | null => {
        try {
            const decoded = atob(code);
            const character = JSON.parse(decoded);
            if (isCharacter(character)) return character;
            return null;
        } catch {
            return null;
        }
    };

    const deleteCharacter = (name: string) => {
        const s = store.filter((c) => c.name !== name);
        setStore(s);
        const localStorageCharactersString = window.localStorage.getItem(SAVED_CHARACTERS_KEY);
        if (localStorageCharactersString) {
            const localStorageCharacters: { [k: string]: string } = JSON.parse(localStorageCharactersString);
            delete localStorageCharacters[name];
            window.localStorage.setItem(SAVED_CHARACTERS_KEY, JSON.stringify(localStorageCharacters));
        }
    };

    const toClipboard = async (character: Character) => {
        const noims = { ...character };
        noims.skills = noims.skills.map((s) => ({ ...s, b64IconBlob: "" }));
        const b64Char = btoa(JSON.stringify(noims));
        try {
            await navigator.clipboard.writeText(b64Char);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SavedCharacterContext.Provider value={{ characters: store, saveCharacter, loadCharacter, loadCharacterFromCode, deleteCharacter, toClipboard }}>
            {props.children}
        </SavedCharacterContext.Provider>
    );
};

export const useSavedCharacters = () => {
    const store = useContext(SavedCharacterContext);
    if (!store) throw new Error("No initial saved character context value provided");
    return store;
};
