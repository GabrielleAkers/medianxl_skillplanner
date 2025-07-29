import { createSignal, ErrorBoundary, onMount, Suspense } from "solid-js";
import type { Component } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { SkillTreeResponse } from "../../shared/types";
import { SkillTree } from "./components/SkillTree";

const ClassNames = ["Amazon", "Barbarian", "Necromancer", "Paladin", "Druid", "Sorceress", "Assassin"] as const;
type ClassName = (typeof ClassNames)[number];

const App: Component = () => {
    const [selectedClass, setSelectedClass] = createSignal<ClassName>("Amazon");

    const skillTree = useQuery<SkillTreeResponse>(() => ({
        queryKey: ["skilltree", selectedClass()],
        queryFn: async () => {
            const r = await fetch(`https://${import.meta.env.VITE_HOSTNAME}/skilltree/${selectedClass().slice(0, 3).toLowerCase()}`);
            if (!r.ok) throw new Error("Network error");
            return r.json();
        },
        staleTime: 60 * 60 * 1000,
        throwOnError: true,
    }));

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
                    <div class="col"></div>
                    <div class="col d-flex">
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
                                {skillTree.data ? <SkillTree data={skillTree.data} /> : null}
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
