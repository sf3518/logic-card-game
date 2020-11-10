import React, { useState } from "react";
import { Goal } from "../../types";
import { Card, Table, Button } from "react-bootstrap";
import { PremiseComponent } from "./Premise";
import * as Types from "../../types";
import SUCCESSFUL_ICON from "../../src_img/card_UI/correct.jpg";
import UNSUCCESSFUL_ICON from "../../src_img/card_UI/incorrect.jpg";
import { genTruthTableInStringForBTrees } from "../../server/gameApp/logicResolver/plainResolver";
import {
  makeStyles,
  Theme,
  createStyles,
  Button as MButton,
  Popover,
  Typography,
  List,
  ListItem,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },
  })
);

interface GoalsProps {
  goals: Goal[];
  isSuccessful: boolean[];
}

export const GoalsComponent = ({ goals, isSuccessful }: GoalsProps) => {
  const [showTable, setShowTable] = useState(goals.map((_) => false));

  const classes = useStyles();
  const [anchorEls, setAnchorEl] = React.useState<(HTMLButtonElement | null)[]>(
    goals.map((_) => null)
  );
  const handleClick = (i: number) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const newAnchorEls = anchorEls.slice();
    newAnchorEls.splice(i, 1, event.currentTarget);
    setAnchorEl(newAnchorEls);
  };
  const handleClose = (i: number) => () => {
    const newAnchorEls = anchorEls.slice();
    newAnchorEls.splice(i, 1, null);
    setAnchorEl(newAnchorEls);
  };

  const ids = anchorEls.map((a, i) => (a ? "popover" + i : undefined));

  const setShowOneTable = (i: number, isShow: boolean) => {
    setShowTable(showTable.map((old, j) => (i == j ? isShow : old)));
  };

  const renderSuccessful = (i: number) => {
    return (
      <div
        style={{
          width: "30px",
          height: "30px",
          backgroundImage:
            "url(" +
            (isSuccessful[i] ? SUCCESSFUL_ICON : UNSUCCESSFUL_ICON) +
            ")",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
    );
  };

  const collectVars = (i: number): Types.Card[] => {
    const set = new Set<Types.Card>();
    goals[i].expr
      ?.filter((c) => ["A", "B", "C", "D"].includes(c))
      .forEach((c) => set.add(c));
    return Array.from(set);
  };

  const renderShowTableButton = (i: number) => {
    if (goals[i].expr == undefined) {
      return <div></div>;
    }
    return (
      <div>
        <MButton
          aria-describedby={ids[i]}
          onClick={handleClick(i)}
          color="primary"
        >
          Hint
        </MButton>
        <Popover
          id={ids[i]}
          open={Boolean(ids[i])}
          anchorEl={anchorEls[i]}
          onClose={handleClose(i)}
          anchorOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
        >
          <Typography className={classes.typography}>
            {renderTruthTable(i)}
          </Typography>
        </Popover>
      </div>
    );
  };

  const renderTruthTable = (i: number) => {
    const vars = collectVars(i);
    const truthTable = genTruthTableInStringForBTrees(vars, [
      goals[i].boolTree,
    ]);
    return (
      <Table onClick={() => setShowOneTable(i, false)}>
        <thead>
          {truthTable.headers.map((it) => (
            <td style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
              {it}
            </td>
          ))}
        </thead>
        {truthTable.body.map((row) => (
          <tr>
            {row.map((it) => (
              <td style={{ paddingTop: "1px", paddingBottom: "1px" }}>{it}</td>
            ))}
          </tr>
        ))}
      </Table>
    );
  };

  const showGoalInCards = (goal: Goal): JSX.Element => {
    switch (goal.kind) {
      case "tautology":
      case "paradox":
        return <div></div>;
    }
    return (
      <PremiseComponent
        scale={0.5}
        premiseIndex={-1}
        isLocked={true}
        isProofPremise={false}
        cards={goal.expr}
      />
    );
  };

  const renderGoal = (i: number) => {
    return (
      <ListItem>
        <td>{renderSuccessful(i)}</td>
        <td style={{ verticalAlign: "center" }}>
          {
            <h4 style={{ marginLeft: "10px", marginRight: "10px" }}>
              {showGoalKind(i + 1, goals[i])}
            </h4>
          }
        </td>
        <td>{showGoalInCards(goals[i])}</td>
        <td align="right">{renderShowTableButton(i)}</td>
      </ListItem>
    );
  };

  const renderGoals = () => {
    const result: JSX.Element[] = [];
    for (let i = 0; i < goals.length; i++) {
      result.push(renderGoal(i));
    }
    return <List>{result}</List>;
  };

  return renderGoals();
};

function showGoalKind(index: number, goal: Goal): string {
  let showKind: string;
  switch (goal.kind) {
    case "prove":
      showKind = "To prove:";
      break;
    case "disprove":
      showKind = "To disprove:";
      break;
    case "unknown":
      showKind = "Make undecidable:";
      break;
    case "equivalent":
      showKind = "To be equivalent to:";
      break;
    case "tautology":
      showKind = "Make a tautology";
      break;
    case "paradox":
      showKind = "Make a paradox";
      break;
  }
  return index + ". " + showKind + " ";
}
