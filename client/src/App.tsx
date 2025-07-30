import { createEffect, ErrorBoundary, Show, Suspense } from "solid-js";
import type { Component } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { SkillTreeResponse } from "../../shared/types";
import { RightContent } from "./components/RightContent";
import { useCharacterStore } from "./components/CharacterStoreProvider";
import { Dropdown, DropdownButton } from "solid-bootstrap";
import { LeftContent } from "./components/LeftContent";
import { useSavedCharacters } from "./components/SavedCharacterStoreProvider";

const ClassNames = ["Amazon", "Barbarian", "Necromancer", "Paladin", "Druid", "Sorceress", "Assassin"] as const;
export type ClassName = (typeof ClassNames)[number];
export const Attributes = ["Strength", "Dexterity", "Intelligence", "Vitality"] as const;
export type Attribute = (typeof Attributes)[number];

const App: Component = () => {
    const [character, setCharacter] = useCharacterStore();
    const savedCharacters = useSavedCharacters();

    const skillTree = useQuery<SkillTreeResponse>(() => ({
        queryKey: ["skilltree", character.class],
        queryFn: async () => {
            if (character.class === "NONE") return {};
            const r = await fetch(`https://${import.meta.env.VITE_HOSTNAME}/skilltree/${character.class.slice(0, 3).toLowerCase()}`);
            if (!r.ok) throw new Error("Network error");
            return r.json();
        },
        staleTime: 60 * 60 * 1000,
        throwOnError: true,
    }));

    createEffect(() => {
        if (character.class !== "NONE" && skillTree.data) {
            setCharacter("version", skillTree.data.version);
            setCharacter(
                "skills",
                skillTree.data.skills.map((s) => ({ ...s, pointsAssigned: 0 }))
            );
        }
    });

    return (
        <>
            <div class="container-fluid overflow-hidden vh-100 d-flex flex-column pb-4 px-4" style={{ color: "white" }}>
                <div id="appbar" class="row text-center">
                    <div class="col">
                        <text class="diablo-font" style={{ color: "white", "font-size": "xxx-large", "align-self": "center" }}>
                            MedianXL Skillplanner
                        </text>
                    </div>
                </div>
                <div class="row flex-grow-1">
                    <Show
                        when={character.class !== "NONE"}
                        fallback={
                            <div class="container-fluid">
                                <div class="d-flex justify-content-center">
                                    <DropdownButton title="Choose Class">
                                        {ClassNames.map((c) => (
                                            <Dropdown.Item as="button" onClick={() => setCharacter("class", c)}>
                                                {c}
                                            </Dropdown.Item>
                                        ))}
                                    </DropdownButton>
                                </div>
                            </div>
                        }
                    >
                        <ErrorBoundary fallback={<div class="container-fluid text-center">Broken 😢</div>}>
                            <Suspense
                                fallback={
                                    <div class="d-flex justify-content-center">
                                        <div class="spinner-border" role="status" style={{ color: "pink" }}>
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                }
                            >
                                <div class="col d-flex p-0">
                                    <LeftContent />
                                </div>
                                <div class="col d-flex p-0">{skillTree.data ? <RightContent data={skillTree.data} /> : null}</div>
                            </Suspense>
                        </ErrorBoundary>
                    </Show>
                </div>
            </div>
        </>
    );
};

export default App;
