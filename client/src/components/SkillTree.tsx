import { Component, createEffect, createSignal, onMount } from "solid-js";
import { SkillResponse, SkillTreeResponse } from "../../../shared/types";
import { Tab, Row, Col, Container, Nav } from "solid-bootstrap";
import { SkillIcon } from "./SkillIcon";

const createArrows = (arrowCanvas: HTMLCanvasElement, tabContent: HTMLDivElement, skillsInTab: SkillResponse[]) => {
    if (!arrowCanvas) return;
    const ctx = arrowCanvas.getContext("2d");
    ctx.canvas.hidden = false;
    ctx.canvas.width = arrowCanvas.clientWidth;
    ctx.canvas.height = arrowCanvas.clientHeight;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 10;

    const w = arrowCanvas.clientWidth;
    const h = arrowCanvas.clientHeight;
    const cellW = w / 3;
    const cellH = h / 6;
    for (const s of skillsInTab) {
        const sx = cellW * s.column - cellW / 2;
        const sy = cellH * s.row - cellH / 1.5;
        if (s.reqSkill1 !== "") {
            const rs = skillsInTab.find((sk) => sk.name === s.reqSkill1);
            if (rs) {
                const rsx = cellW * rs.column - cellW / 2;
                const rsy = cellH * rs.row - cellH / 1.5;
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
                const rsy = cellH * rs.row - cellH / 1.5;
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
                const rsy = cellH * rs.row - cellH / 1.5;
                ctx.beginPath();
                ctx.moveTo(rsx, rsy);
                ctx.lineTo(sx, sy);
                ctx.stroke();
            }
        }
    }
    const durl = ctx.canvas.toDataURL();
    tabContent.style.background = `url(${durl})`;
    ctx.canvas.hidden = true;

    window.removeEventListener("resize", () => createArrows(arrowCanvas, tabContent, skillsInTab));
};

export type SkillTreeProps = { data: SkillTreeResponse | undefined };
export const SkillTree: Component<SkillTreeProps> = ({ data }) => {
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

    return (
        <>
            <Tab.Container
                defaultActiveKey={selectedTab()}
                onSelect={(k) => {
                    let n = parseInt(k);
                    if (!n || n < 0) n = 0;
                    if (n >= data.skillTabs.length) n = data.skillTabs.length - 1;
                    setSelectedTab(n);
                }}
                activeKey={selectedTab()}
            >
                <Row class="flex-grow-1">
                    <Col sm={9} class="p-0">
                        <Tab.Content class="median-content-border" id="skill-tree-content" ref={tabContent}>
                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                                    {skillTabs().map((t) => (
                                        <Tab.Pane eventKey={t.page} style={{ height: "100%" }}>
                                            <Container
                                                fluid
                                                style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", "z-index": -1 }}
                                            >
                                                {[1, 2, 3, 4, 5, 6].map((i) => {
                                                    const skillsInThisRow = skillsInSelectedTab().filter((s) => s.row === i);
                                                    const c1 = skillsInThisRow.filter((s) => s.column === 1)[0];
                                                    const c2 = skillsInThisRow.filter((s) => s.column === 2)[0];
                                                    const c3 = skillsInThisRow.filter((s) => s.column === 3)[0];
                                                    return (
                                                        <Row class="d-flex flex-row text-center" style={{ height: "16.6667%", "z-index": -1 }}>
                                                            <Col class="flex-grow-1 p-4">{c1 ? <SkillIcon skill={c1} /> : null}</Col>
                                                            <Col class="flex-grow-1 p-4">{c2 ? <SkillIcon skill={c2} /> : null}</Col>
                                                            <Col class="flex-grow-1 p-4">{c3 ? <SkillIcon skill={c3} /> : null}</Col>
                                                        </Row>
                                                    );
                                                })}
                                            </Container>
                                        </Tab.Pane>
                                    ))}
                                </div>
                                <canvas
                                    id="arrow-canvas"
                                    class="arrow-canvas"
                                    style={{ position: "absolute", "pointer-events": "none", left: 0, top: 0, width: "100%", height: "100%", "z-index": 1 }}
                                    ref={arrowCanvas}
                                />
                            </div>
                        </Tab.Content>
                    </Col>
                    <Col sm={3} class="d-flex p-0">
                        <Nav variant="pills" class="flex-column" fill>
                            <div class="text-center median-border">
                                <p>Skill</p>
                                <p>Points</p>
                                <p>Remaining</p>
                            </div>
                            {skillTabs().map((t) => (
                                <Nav.Item>
                                    <Nav.Link class="align-middle p-4" style={{ height: "100%" }} eventKey={t.page}>
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
