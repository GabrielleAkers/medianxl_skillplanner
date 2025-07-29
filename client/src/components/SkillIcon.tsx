import { Component } from "solid-js";
import { SkillResponse } from "../../../shared/types";
import { OverlayTrigger, Tooltip } from "solid-bootstrap";
import { imgFromb64 } from "../util";

export type SkillIconProps = { skill: SkillResponse };
export const SkillIcon: Component<SkillIconProps> = ({ skill }) => {
    return (
        <OverlayTrigger
            overlay={
                <Tooltip arrowProps={{ style: { opacity: "0" } }} id={skill.name}>
                    <div style={{ "white-space": "pre-wrap" }}>{skill.longName.replace(/Ã¿c[0-9]/g, "").replace(/\\n/g, "<br>")}</div>
                </Tooltip>
            }
        >
            <div class="skill-icon" id={`icon-${skill.name}`} style={{ "z-index": -1 }}>
                <div>{imgFromb64(skill.b64IconBlob)}</div>
                <div class="diablo-font">{`${skill.name.replace(/Ã¿c[0-9]/g, "")}`}</div>
            </div>
        </OverlayTrigger>
    );
};
