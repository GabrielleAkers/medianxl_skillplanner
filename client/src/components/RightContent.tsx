import { Component, createEffect, createSignal, onMount } from "solid-js";
import { SkillResponse, SkillTreeResponse } from "../../../shared/types";
import { Tab, Row, Col, Container, Nav } from "solid-bootstrap";
import { SkillIcon } from "./SkillIcon";
import { useCharacterStore } from "./CharacterStoreProvider";
import { produce } from "solid-js/store";

import rocktexture from "../../assets/rocktexture.png";

const createArrows = (arrowCanvas: HTMLCanvasElement, tabContent: HTMLDivElement, skillsInTab: SkillResponse[]) => {
    if (!arrowCanvas) return;
    const ctx = arrowCanvas.getContext("2d");
    ctx.canvas.hidden = false;
    ctx.canvas.width = tabContent.clientWidth;
    ctx.canvas.height = tabContent.clientHeight;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;

    const hScale = 1.25;
    const w = tabContent.clientWidth;
    const h = tabContent.clientHeight;
    const cellW = w / 3;
    const cellH = h / 6;
    for (const s of skillsInTab) {
        const sx = cellW * s.column - cellW / 2;
        const sy = cellH * s.row - cellH / hScale;
        if (s.reqSkill1 !== "") {
            const rs = skillsInTab.find((sk) => sk.name === s.reqSkill1);
            if (rs) {
                const rsx = cellW * rs.column - cellW / 2;
                const rsy = cellH * rs.row - cellH / hScale;
                ctx.beginPath();
                ctx.moveTo(rsx, rsy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }
        }
        if (s.reqSkill2 !== "") {
            const rs = skillsInTab.find((sk) => sk.name === s.reqSkill2);
            if (rs) {
                const rsx = cellW * rs.column - cellW / 2;
                const rsy = cellH * rs.row - cellH / hScale;
                ctx.beginPath();
                ctx.moveTo(rsx, rsy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }
        }
        if (s.reqSkill3 !== "") {
            const rs = skillsInTab.find((sk) => sk.name === s.reqSkill3);
            if (rs) {
                const rsx = cellW * rs.column - cellW / 2;
                const rsy = cellH * rs.row - cellH / hScale;
                ctx.beginPath();
                ctx.moveTo(rsx, rsy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }
        }
    }
    const durl = ctx.canvas.toDataURL();
    tabContent.style.background = `url(${durl}), url("${rocktexture}")`;
    ctx.canvas.hidden = true;

    window.removeEventListener("resize", () => createArrows(arrowCanvas, tabContent, skillsInTab));
};

export type RightContentProps = { data: SkillTreeResponse | undefined };
export const RightContent: Component<RightContentProps> = ({ data }) => {
    const [character, setCharacter] = useCharacterStore();
    const [selectedTab, setSelectedTab] = createSignal(0);
    const [skillTabs, setSkillTabs] = createSignal<typeof data.skillTabs>(data.skillTabs.toSorted((t1, t2) => t1.page - t2.page));
    const [skillsInSelectedTab, setSkillsInSelectedTab] = createSignal<typeof data.skills>(data.skills.filter((s) => s.page === selectedTab() + 1));

    let arrowCanvas!: HTMLCanvasElement;
    let tabContent!: HTMLDivElement;

    createEffect(() => {
        const skillsInTab = data.skills.filter((s) => s.page === selectedTab() + 1);
        setSkillTabs(data.skillTabs.toSorted((t1, t2) => t1.page - t2.page));
        setSkillsInSelectedTab(skillsInTab);

        createArrows(arrowCanvas, tabContent, skillsInTab);

        window.addEventListener("resize", () => createArrows(arrowCanvas, tabContent, skillsInTab));
    });

    const canIncrement = (skill: SkillResponse) => {
        const r1 = character.skills.find((_s) => _s.name === skill.reqSkill1);
        const r2 = character.skills.find((_s) => _s.name === skill.reqSkill2);
        const r3 = character.skills.find((_s) => _s.name === skill.reqSkill3);
        let canAssign = true;
        if (r1 && r1.pointsAssigned < 1) canAssign = false;
        if (r2 && r2.pointsAssigned < 1) canAssign = false;
        if (r3 && r3.pointsAssigned < 1) canAssign = false;
        return canAssign;
    };

    const increment = (skill: SkillResponse, shiftHeld: boolean) => {
        if (character.skillPointsRemaining < 1) return;
        setCharacter(
            "skills",
            (s) => s.name === skill.name,
            produce((s) => {
                if (!canIncrement(s as SkillResponse)) return;
                let num = shiftHeld ? 10 : 1;
                const n = Math.min(character.skillPointsRemaining, num);
                s.pointsAssigned += n;
                setCharacter("skillPointsRemaining", (p) => p - n);
            })
        );
    };

    const decrement = (skill: SkillResponse, shiftHeld: boolean) => {
        setCharacter(
            "skills",
            (s) => s.name === skill.name,
            produce((s) => {
                if (s.pointsAssigned > 0) {
                    const r1 = character.skills.filter((_s) => _s.reqSkill1 === s.name);
                    const r2 = character.skills.filter((_s) => _s.reqSkill2 === s.name);
                    const r3 = character.skills.filter((_s) => _s.reqSkill3 === s.name);
                    let canRemove = true;
                    const num = shiftHeld ? 10 : 1;
                    let n = Math.min(s.pointsAssigned, num);
                    if (s.pointsAssigned - n <= 0) {
                        for (const k of r1) {
                            if (k.pointsAssigned >= 1) canRemove = false;
                        }
                        for (const k of r2) {
                            if (k.pointsAssigned >= 1) canRemove = false;
                        }
                        for (const k of r3) {
                            if (k.pointsAssigned >= 1) canRemove = false;
                        }
                    }
                    if (!canRemove) {
                        if (s.pointsAssigned === 1) return;
                        n = s.pointsAssigned - 1;
                    }
                    s.pointsAssigned -= n;
                    setCharacter("skillPointsRemaining", (p) => p + n);
                }
            })
        );
    };

    return (
        <>
            <Tab.Container
                defaultActiveKey={selectedTab()}
                id="skill-tabs-container"
                onSelect={(k) => {
                    let n = parseInt(k);
                    if (!n || n < 0) n = 0;
                    if (n >= data.skillTabs.length) n = data.skillTabs.length - 1;
                    setSelectedTab(n);
                }}
                activeKey={selectedTab()}
            >
                <Row class="flex-grow-1" style={{ height: "100%" }}>
                    <Col sm={9} class="p-0">
                        <Tab.Content class="median-right-content-border" id="skill-tree-content" ref={tabContent}>
                            <div style={{ width: "100%", height: "100%" }}>
                                <div class="p-1" style={{ height: "95%" }}>
                                    {skillTabs().map((t) => (
                                        <Tab.Pane
                                            eventKey={t.page}
                                            style={{ height: "100%", position: "fixed", top: "0", left: "0", width: "100%", "z-index": -1 }}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map((i) => {
                                                const skillsInThisRow = skillsInSelectedTab().filter((s) => s.row === i);
                                                const c1 = skillsInThisRow.filter((s) => s.column === 1)[0];
                                                const c2 = skillsInThisRow.filter((s) => s.column === 2)[0];
                                                const c3 = skillsInThisRow.filter((s) => s.column === 3)[0];
                                                return (
                                                    <Row class="text-center p-2 " style={{ height: "16.6667%" }}>
                                                        <Col class="p-0">
                                                            {c1 ? (
                                                                <SkillIcon
                                                                    skill={c1}
                                                                    increment={increment}
                                                                    decrement={decrement}
                                                                    pointsAssigned={() => character.skills.find((s) => s.name === c1.name)?.pointsAssigned ?? 0}
                                                                    active={() => canIncrement(c1)}
                                                                />
                                                            ) : null}
                                                        </Col>
                                                        <Col class="p-0">
                                                            {c2 ? (
                                                                <SkillIcon
                                                                    skill={c2}
                                                                    increment={increment}
                                                                    decrement={decrement}
                                                                    pointsAssigned={() => character.skills.find((s) => s.name === c2.name)?.pointsAssigned ?? 0}
                                                                    active={() => canIncrement(c2)}
                                                                />
                                                            ) : null}
                                                        </Col>
                                                        <Col class="p-0">
                                                            {c3 ? (
                                                                <SkillIcon
                                                                    skill={c3}
                                                                    increment={increment}
                                                                    decrement={decrement}
                                                                    pointsAssigned={() => character.skills.find((s) => s.name === c3.name)?.pointsAssigned ?? 0}
                                                                    active={() => canIncrement(c3)}
                                                                />
                                                            ) : null}
                                                        </Col>
                                                    </Row>
                                                );
                                            })}
                                        </Tab.Pane>
                                    ))}
                                </div>
                                <div class="median-gold diablo-font text-center">{skillTabs()[selectedTab()].tabDesc.replace(/Ã¿c[0-9]/g, "")}</div>
                                <canvas
                                    id="arrow-canvas"
                                    class="arrow-canvas"
                                    style={{ position: "absolute", "pointer-events": "none", left: 0, top: 0, width: "100%", height: "95%", "z-index": 1 }}
                                    ref={arrowCanvas}
                                />
                            </div>
                        </Tab.Content>
                    </Col>
                    <Col sm={3} class="d-flex p-0 pe-4">
                        <Nav variant="pills" class="flex-column skill-tab-nav" fill style={{ width: "100%" }}>
                            <div class="text-center skill-tab-header diablo-font pb-2 median-gold align-middle">
                                <div class="text-center p-4 mb-2 align-middle" style={{ "line-height": "20px", height: "20px", color: "white", width: "100%" }}>
                                    {character.skillPointsRemaining}
                                </div>
                                <div>Remaining</div>
                                <div>Skill Points</div>
                            </div>
                            {skillTabs().map((t) => (
                                <Nav.Item>
                                    <Nav.Link class="align-middle p-2 diablo-font" style={{ height: "100%" }} eventKey={t.page}>
                                        {t.tabName}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>
                </Row>
            </Tab.Container>
        </>
    );
};
