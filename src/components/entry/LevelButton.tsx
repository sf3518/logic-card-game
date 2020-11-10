import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Button as MButton } from "@material-ui/core";
import "./LevelButton.css";

interface LevelButtonProps {
  sectionID: number;
  levelID: number;
  isAvailable: boolean;
}

export const LevelButton = ({
  sectionID,
  levelID,
  isAvailable,
}: LevelButtonProps): JSX.Element => {
  const link = "/level/" + sectionID + "/" + levelID;
  return (
    <LinkContainer
      to={link}
      style={{
        width: "8rem",
        height: "4rem",
        padding: "5px",
        marginBottom: "30px",
        marginLeft: "70px",
        marginRight: "70px",
        textAlign: "center",
        verticalAlign: "middle",
        borderRadius: "5%",
        color: isAvailable ? "white" : "#ddd",
        backgroundColor: isAvailable ? "rgba(255, 165, 0, .75)" : "rgba(53.3, 53.3, 53.3, .50)",
        pointerEvents: isAvailable ? "auto" : "none",
        boxShadow: "inset 0 0 1rem 0 rgba(0, 0, 0, .2)",
        backdropFilter: "blur(7px)",
      }}
      className={"button"}
    >
      <MButton>
        <h1>{levelID}</h1>
      </MButton>
    </LinkContainer>
  );
};
