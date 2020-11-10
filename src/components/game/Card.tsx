import React from "react";
import * as Types from "../../types";
import "./Card.css";
import Card from "react-bootstrap/Card";
import A_Card from "../../src_img/card_UI/A.jpg";
import B_Card from "../../src_img/card_UI/B.jpg";
import C_Card from "../../src_img/card_UI/C.jpg";
import D_Card from "../../src_img/card_UI/D.jpg";
import AND_Card from "../../src_img/card_UI/AND.jpg";
import OR_Card from "../../src_img/card_UI/OR.jpg";
import NOT_Card from "../../src_img/card_UI/NOT.jpg";
import LP_Card from "../../src_img/card_UI/LP.jpg";
import RP_Card from "../../src_img/card_UI/RP.jpg";
import IMPLY_Card from "../../src_img/card_UI/IMPLY.jpg";
import IFF_Card from "../../src_img/card_UI/IFF.jpg";
import SELECTED_A_Card from "../../src_img/card_UI/selected/A.jpg";
import SELECTED_B_Card from "../../src_img/card_UI/selected/B.jpg";
import SELECTED_C_Card from "../../src_img/card_UI/selected/C.jpg";
import SELECTED_D_Card from "../../src_img/card_UI/selected/D.jpg";
import SELECTED_AND_Card from "../../src_img/card_UI/selected/AND.jpg";
import SELECTED_OR_Card from "../../src_img/card_UI/selected/OR.jpg";
import SELECTED_NOT_Card from "../../src_img/card_UI/selected/NOT.jpg";
import SELECTED_LP_Card from "../../src_img/card_UI/selected/LP.jpg";
import SELECTED_RP_Card from "../../src_img/card_UI/selected/RP.jpg";
import SELECTED_IMPLY_Card from "../../src_img/card_UI/selected/IMPLY.jpg";
import SELECTED_IFF_Card from "../../src_img/card_UI/selected/IFF.jpg";
import { Tooltip } from "@material-ui/core";

interface CardProps {
  cardSymbol: Types.Card;
  scale: number;
  tag?: number | undefined;
  isSelected: boolean;
  onClick: () => void;
  onClickOnTag?: () => void
}

export const CardComponent = ({
  cardSymbol,
  scale,
  tag = undefined,
  isSelected = false,
  onClick = () => {},
  onClickOnTag = () => {}
}: CardProps): JSX.Element => {
  let colour: string;
  switch (cardSymbol) {
    case "A": {
      colour = isSelected ? SELECTED_A_Card : A_Card;
      break;
    }
    case "B": {
      colour = isSelected ? SELECTED_B_Card : B_Card;
      break;
    }
    case "C": {
      colour = isSelected ? SELECTED_C_Card : C_Card;
      break;
    }
    case "D": {
      colour = isSelected ? SELECTED_D_Card : D_Card;
      break;
    }
    case "&": {
      colour = isSelected ? SELECTED_AND_Card : AND_Card;
      break;
    }
    case "|": {
      colour = isSelected ? SELECTED_OR_Card : OR_Card;
      break;
    }
    case "~": {
      colour = isSelected ? SELECTED_NOT_Card : NOT_Card;
      break;
    }
    case "(": {
      colour = isSelected ? SELECTED_LP_Card : LP_Card;
      break;
    }
    case ")": {
      colour = isSelected ? SELECTED_RP_Card : RP_Card;
      break;
    }
    case "->": {
      colour = isSelected ? SELECTED_IMPLY_Card : IMPLY_Card;
      break;
    }
    case "==": {
      colour = isSelected ? SELECTED_IFF_Card : IFF_Card;
      break;
    }
  }
  const width = 66 * scale;
  const height = 110 * scale;
  console.log(tag);

  return (
    <div style={{ position: 'relative' }}>
      <Card
        className="Card"
        style={{
          width: width + "px",
          height: height + "px",
          backgroundImage: "url(" + colour + ")",
        }}
        onClick={onClick}
      >
      </Card>
      {tag ? (
        <Tooltip title="Edit card number" arrow>
          <div className="CardTag" onClick={onClickOnTag}>
            <a>{tag == Number.POSITIVE_INFINITY ? "∞" : tag}</a>
          </div>
        </Tooltip>
        ) : undefined}
    </div>

  );
};
