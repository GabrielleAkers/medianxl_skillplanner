import { Button, Col, Container, Form, ListGroup, Nav, Row, Tab } from "solid-bootstrap";
import { Component, createSignal } from "solid-js";
import { useCharacterStore } from "./CharacterStoreProvider";
import { Attribute, ClassName } from "../App";
import { useSavedCharacters } from "./SavedCharacterStoreProvider";

const TabOpts = ["Edit Attributes", "Save Build", "Load Build"] as const;
type TabOpt = (typeof TabOpts)[number];

type AttributeEditorProps = { attributeName: Attribute };
const AttributeEditor: Component<AttributeEditorProps> = ({ attributeName }) => {
    const [character, setCharacter] = useCharacterStore();

    const increment = (num = 1) => {
        if (character.attributePointsRemaining < 1) return;
        const n = Math.min(character.attributePointsRemaining, num);
        setCharacter("attributes", attributeName, (p) => p + n);
        setCharacter("attributePointsRemaining", (p) => p - n);
    };

    const decrement = (num = 1) => {
        if (character.attributes[attributeName] < 1) return;
        const n = Math.min(character.attributes[attributeName], num);
        setCharacter("attributes", attributeName, (p) => p - n);
        setCharacter("attributePointsRemaining", (p) => p + n);
    };

    return (
        <div>
            <div class="median-gold align-middle position-relative" id={`attribute-${attributeName}`} style={{ "z-index": -1 }}>
                <div class="diablo-font" style={{ "font-size": "32px" }}>
                    {attributeName}
                </div>
                <div class="d-flex justify-content-center" style={{ width: "100%" }}>
                    <div class="d-flex justify-content-around" style={{ "min-width": "50%" }}>
                        <Button
                            class="skill-pt-button p-0 m-0"
                            style={{ "min-width": "30%" }}
                            id={`attribute-${attributeName}-increment`}
                            onClick={(e) => {
                                if (e.shiftKey) {
                                    return increment(100);
                                }
                                increment(1);
                            }}
                        >
                            +
                        </Button>
                        <div class="diablo-font median-icon-point-tracker-border p-0" style={{ "min-width": "40%", color: "white" }}>
                            {character.attributes[attributeName]}
                        </div>
                        <Button
                            class="skill-pt-button p-0 m-0"
                            style={{ "min-width": "30%" }}
                            id={`attribute-${attributeName}-decrement`}
                            onClick={(e) => {
                                if (e.shiftKey) {
                                    return decrement(100);
                                }
                                decrement(1);
                            }}
                        >
                            -
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export type LeftContentProps = {};
export const LeftContent: Component<LeftContentProps> = ({}) => {
    const [character, setCharacter] = useCharacterStore();
    const [selectedTab, setSelectedTab] = createSignal<TabOpt>("Edit Attributes");

    const [buildName, setBuildName] = createSignal<string | null>(null);
    const [buildCode, setBuildCode] = createSignal<string | null>(null);
    const characterSaver = useSavedCharacters();

    return (
        <>
            <Tab.Container
                defaultActiveKey={selectedTab()}
                id="attribute-tabs-container"
                onSelect={(k) => {
                    if (!TabOpts.includes(k as TabOpt)) return;
                    setSelectedTab(k as TabOpt);
                }}
                activeKey={selectedTab()}
            >
                <Row class="flex-grow-1">
                    <Col sm={3} class="d-flex p-0 ps-4">
                        <Nav variant="pills" class="flex-column attribute-tab-nav" fill style={{ width: "100%" }}>
                            <div class="text-center median-version diablo-font pb-2 pt-4 median-gold align-middle attribute-nav-header">
                                <div>MXL</div>
                                <div>Version</div>
                                <div class="text-center p-4 mb-2 align-middle" style={{ "line-height": "20px", height: "20px", width: "100%" }}>
                                    {character.version}
                                </div>
                            </div>
                            {TabOpts.map((t) => (
                                <Nav.Item>
                                    <Nav.Link
                                        class="align-middle diablo-font"
                                        style={{ height: "100%", "line-height": "100%", "padding-top": "100px" }}
                                        eventKey={t}
                                    >
                                        {t}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>
                    <Col sm={9} class="p-0">
                        <Tab.Content class="median-left-content-border" id="attribute-content">
                            <Tab.Pane eventKey="Edit Attributes" style={{ height: "100%" }}>
                                <Container fluid style={{ height: "100%" }}>
                                    <Row class="d-flex flex-row text-center" style={{ height: "20%" }}>
                                        <Col class="flex-grow-1 p-4">
                                            <div>
                                                <div class="align-middle position-relative" style={{ "z-index": -1 }}>
                                                    <div class="median-gold diablo-font" style={{ "font-size": "32px" }}>
                                                        <div>Points Remaining</div>
                                                        <div style={{ color: "white" }}>{character.attributePointsRemaining}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row class="d-flex flex-row text-center" style={{ height: "30%" }}>
                                        <Col class="flex-grow-1 p-4">
                                            <AttributeEditor attributeName="Strength" />
                                        </Col>
                                        <Col class="flex-grow-1 p-4">
                                            <AttributeEditor attributeName="Dexterity" />
                                        </Col>
                                    </Row>
                                    <Row class="d-flex flex-row text-center" style={{ height: "30%" }}>
                                        <Col class="flex-grow-1 p-4">
                                            <AttributeEditor attributeName="Intelligence" />
                                        </Col>
                                        <Col class="flex-grow-1 p-4">
                                            <AttributeEditor attributeName="Vitality" />
                                        </Col>
                                    </Row>
                                </Container>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Save Build" style={{ height: "100%" }}>
                                <Container fluid style={{ height: "100%" }}>
                                    <Row class="d-flex flex-row text-center align-middle" style={{ height: "100%" }}>
                                        <Col class="flex-grow-1 p-4 align-middle">
                                            <div class="align-middle">
                                                <div class="align-middle" style={{ "z-index": -1 }}>
                                                    <div class="median-gold diablo-font align-middle p-4" style={{ "font-size": "32px" }}>
                                                        <div>Save Build</div>
                                                        <Form.Control
                                                            placeholder="Enter build name, will overwrite existing build if the names match"
                                                            value={buildName() ?? ""}
                                                            onChange={(e) => {
                                                                setBuildName(e.currentTarget.value);
                                                            }}
                                                        />
                                                        <Button
                                                            class="median-button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (!buildName()) return;
                                                                characterSaver.saveCharacter(buildName(), character, character.class as ClassName);
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="align-middle">
                                                <div class="align-middle" style={{ "z-index": -1 }}>
                                                    <div class="median-gold diablo-font align-middle p-4" style={{ "font-size": "32px" }}>
                                                        <div>To Build Code</div>
                                                        <Button class="median-button" onClick={() => characterSaver.toClipboard(character)}>
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Container>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Load Build" style={{ height: "100%" }}>
                                <Container class="ms-0 p-4">
                                    <div class="pe-4 align-middle" style={{ width: "100%", height: "inherited" }}>
                                        {characterSaver.characters.length > 0 ? (
                                            <ListGroup style={{ "overflow-y": "auto", "max-height": "70vh" }} class="load-build-list">
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
                                                                        onClick={() => {
                                                                            const loadedCharacter = characterSaver.loadCharacter(c.name);
                                                                            setBuildName(c.name);
                                                                            setCharacter(loadedCharacter);
                                                                        }}
                                                                    >
                                                                        Load
                                                                    </Button>
                                                                    <Button
                                                                        class="m-0 ms-1 median-button"
                                                                        onClick={() => characterSaver.deleteCharacter(c.name)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </Container>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        ) : (
                                            <div class="text-center diablo-font median-gold">No Saved Builds</div>
                                        )}
                                        <div class="median-gold diablo-font align-middle p-4" style={{ "font-size": "32px" }}>
                                            <div class="text-center">Load From Code</div>
                                            <Form.Control
                                                placeholder="Enter build code"
                                                value={buildCode() ?? ""}
                                                onChange={(e) => {
                                                    setBuildCode(e.currentTarget.value);
                                                }}
                                            />
                                            <div class="d-flex justify-content-center p-2">
                                                <Button
                                                    class="median-button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!buildCode()) return;
                                                        const loaded = characterSaver.loadCharacterFromCode(buildCode());
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
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </>
    );
};
