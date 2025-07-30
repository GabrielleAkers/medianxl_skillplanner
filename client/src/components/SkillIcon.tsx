import { Component, createEffect, createSignal } from "solid-js";
import { SkillResponse } from "../../../shared/types";
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from "solid-bootstrap";
import { imgFromb64 } from "../util";

export type SkillIconProps = { skill: SkillResponse; increment: () => any; decrement: () => any; pointsAssigned: () => number };
export const SkillIcon: Component<SkillIconProps> = ({ skill, increment, decrement, pointsAssigned }) => {
    return (
        <OverlayTrigger
            placement={skill.row === 1 ? "bottom" : "top"}
            overlay={
                <Tooltip arrowProps={{ style: { opacity: "0" } }} id={skill.name}>
                    <div style={{ "white-space": "pre-wrap" }}>{skill.longName.replace(/Ã¿c[0-9]/g, "").replace(/\\n/g, "<br>")}</div>
                </Tooltip>
            }
        >
            <div>
                <div class="skill-icon align-middle position-relative" id={`skill-icon-${skill.row},${skill.column}`} style={{ "z-index": -1 }}>
                    <div class="d-flex justify-content-center" style={{ width: "100%" }}>
                        <div class="median-icon-image-border" style={{ width: "fit-content" }}>
                            {imgFromb64(skill.b64IconBlob)}
                        </div>
                    </div>
                    <div class="diablo-font">{`${skill.name.replace(/Ã¿c[0-9]/g, "")}`}</div>
                    <div class="d-flex justify-content-center" style={{ width: "100%" }}>
                        <div class="d-flex justify-content-around" style={{ "min-width": "50%" }}>
                            <Button
                                class="skill-pt-button p-0 m-0"
                                style={{ "min-width": "30%" }}
                                id={`skill-icon-${skill.name}-decrement`}
                                onClick={decrement}
                            >
                                -
                            </Button>
                            <div class="diablo-font median-icon-point-tracker-border p-0" style={{ "min-width": "40%", color: "white" }}>
                                {pointsAssigned()}
                            </div>
                            <Button
                                class="skill-pt-button p-0 m-0"
                                style={{ "min-width": "30%" }}
                                id={`skill-icon-${skill.name}-increment`}
                                onClick={increment}
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </OverlayTrigger>
    );
};
