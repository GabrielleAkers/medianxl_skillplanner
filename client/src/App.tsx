import { createEffect, createSignal, ErrorBoundary, onMount, Show, Suspense } from "solid-js";
import type { Component } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { SkillTreeResponse } from "../../shared/types";
import { RightContent } from "./components/RightContent";
import { useCharacterStore } from "./components/CharacterStoreProvider";
import { Button, Col, Container, Form, ListGroup, Row } from "solid-bootstrap";
import { LeftContent } from "./components/LeftContent";
import { useSavedCharacters } from "./components/SavedCharacterStoreProvider";

import GithubLogo from "../assets/github-mark-white.png";

const ClassNames = ["Amazon", "Barbarian", "Necromancer", "Paladin", "Druid", "Sorceress", "Assassin"] as const;
export type ClassName = (typeof ClassNames)[number];
export const Attributes = ["Strength", "Dexterity", "Intelligence", "Vitality"] as const;
export type Attribute = (typeof Attributes)[number];

const App: Component = () => {
    const [character, setCharacter] = useCharacterStore();
    const characterSaver = useSavedCharacters();
    const [buildCode, setBuildCode] = createSignal<string | null>(null);

    const [selectedClass, setSelectedClass] = createSignal<ClassName | "NONE">("NONE");

    const skillTree = useQuery<SkillTreeResponse>(() => ({
        queryKey: ["skilltree", character.class],
        queryFn: async () => {
            if (character.class === "NONE") return {};
            const c = character.class;
            const r = await fetch(`https://${import.meta.env.VITE_HOSTNAME}/skilltree/${character.class.slice(0, 3).toLowerCase()}`);
            if (!r.ok) throw new Error("Network error");
            return r.json();
        },
        staleTime: 60 * 60 * 1000,
        throwOnError: true,
    }));

    onMount(() => {
        const loadFromQuery = async () => {
            const query = new URLSearchParams(window.location.search);
            const code = query.get("code");
            if (code) {
                const c = await characterSaver.loadCharacterFromCode(code);
                setCharacter(c);
            }
        };
        loadFromQuery();
    });

    createEffect(() => {
        if (character.class !== "NONE" && skillTree.data) {
            if (character.version && character.version !== "") return;
            setCharacter("version", skillTree.data.version);
            setCharacter(
                "skills",
                skillTree.data.skills.map((s) => ({ ...s, pointsAssigned: 0 })).filter((s) => s.name !== "FLYING POLAR BUFFALO ERROR")
            );
        }
    });

    return (
        <>
            <div class="container-fluid overflow-auto vh-100 d-flex flex-column pb-4 px-4 pt-4" style={{ color: "white" }}>
                <div class="row flex-grow-1">
                    <Show
                        when={character.class !== "NONE"}
                        fallback={
                            <Container class="ms-0 p-4">
                                <div id="appbar" class="row text-center">
                                    <div class="col">
                                        <text class="diablo-font median-gold" style={{ "font-size": "xxx-large", "align-self": "center" }}>
                                            MedianXL Skillplanner
                                        </text>
                                        <a
                                            class="position-absolute top-0 m-2"
                                            style={{ right: "0px" }}
                                            href="https://github.com/GabrielleAkers/medianxl_skillplanner"
                                        >
                                            <img height="48px" width="48px" src={GithubLogo} />
                                        </a>
                                    </div>
                                </div>
                                <div class="pe-4 align-middle" style={{ width: "100%", height: "inherited" }}>
                                    <div class="median-gold diablo-font align-middle p-4" style={{ "font-size": "32px" }}>
                                        <div class="text-center">Create New Build</div>
                                        <Container fluid>
                                            <Row>
                                                <Col class="p-0 d-flex justify-content-center">
                                                    <div>
                                                        <Form.Control
                                                            placeholder="Enter build name"
                                                            value={characterSaver.buildName() ?? ""}
                                                            onChange={(e) => {
                                                                characterSaver.setBuildName(e.currentTarget.value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Form.Select
                                                            value={selectedClass()}
                                                            onChange={(e) => {
                                                                if (!e || e.currentTarget.value === "NONE") return;
                                                                setSelectedClass(e.currentTarget.value as ClassName);
                                                            }}
                                                        >
                                                            {ClassNames.map((n) => (
                                                                <option value={n}>{n}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Container>
                                        <div class="d-flex justify-content-center p-2">
                                            <Button
                                                class="median-button"
                                                onClick={(e) => {
                                                    if (!characterSaver.buildName() || !selectedClass() || selectedClass() === "NONE") return;
                                                    setCharacter("class", selectedClass());
                                                }}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                    {characterSaver.characters.length > 0 ? (
                                        <ListGroup style={{ "overflow-y": "auto", "max-height": "50vh" }} class="load-build-list">
                                            {characterSaver.characters.map((c) => (
                                                <ListGroup.Item class="p-0 load-build-list-item">
                                                    <Container fluid>
                                                        <Row class="p-0">
                                                            <Col class="text-center diablo-font median-gold" style={{ "font-size": "25px" }}>
                                                                {c.name}
                                                            </Col>
                                                            <Col class="text-center diablo-font median-gold" style={{ "font-size": "25px" }}>
                                                                {c.class}
                                                            </Col>
                                                            <Col class="align-middle justify-content-center d-flex">
                                                                <Button
                                                                    class="m-0 me-1 median-button"
                                                                    onClick={async () => {
                                                                        const loadedCharacter = await characterSaver.loadCharacter(c.name);
                                                                        characterSaver.setBuildName(c.name);
                                                                        setCharacter(loadedCharacter);
                                                                    }}
                                                                >
                                                                    Load
                                                                </Button>
                                                                <Button class="m-0 ms-1 median-button" onClick={() => characterSaver.deleteCharacter(c.name)}>
                                                                    Delete
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Container>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : null}
                                    <div class="median-gold diablo-font align-middle p-4" style={{ "font-size": "32px" }}>
                                        <div class="text-center">Load From Code</div>
                                        <Container fluid>
                                            <Row>
                                                <Col class="p-0 d-flex justify-content-around">
                                                    <div>
                                                        <Form.Control
                                                            placeholder="Enter build code"
                                                            value={buildCode()}
                                                            onChange={(e) => {
                                                                setBuildCode(e.currentTarget.value);
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Container>

                                        <div class="d-flex justify-content-center p-2">
                                            <Button
                                                class="median-button"
                                                onClick={async (e) => {
                                                    if (!buildCode()) return;
                                                    const loaded = await characterSaver.loadCharacterFromCode(buildCode());
                                                    if (loaded) {
                                                        setCharacter(loaded);
                                                        console.log("loaded from code");
                                                    }
                                                    setBuildCode(null);
                                                }}
                                            >
                                                Load
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Container>
                        }
                    >
                        <ErrorBoundary fallback={(e) => <div class="container-fluid text-center">Broken 😢 {e.message}</div>}>
                            <Suspense
                                fallback={
                                    <div class="row flex-grow-1">
                                        <div class="loading-logo" />
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
