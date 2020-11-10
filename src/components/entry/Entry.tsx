import React, { useContext } from "react";
import "./Entry.css";
import "bootstrap/dist/css/bootstrap.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessQueen,
  faEdit,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Avatar, IconButton, makeStyles } from "@material-ui/core";
import { LoginContext } from "../../LoginContext";
import Particles from "react-particles-js";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "25ch",
  },
}));

export const Entry = (): JSX.Element => {
  const classes = useStyles();
  const logins = useContext(LoginContext);

  return (
    <div className={"entry"}>
      <Particles
        className={"animation"}
        params={{
          particles: {
            number: {
              value: 150,
              density: {
                enable: true,
                value_area: 700,
              },
            },
            color: {
              value: "#FF8C00",
            },
            shape: {
              type: ["circle", "triangle"],
            },
            size: {
              value: 5,
            },
            line_linked: {
              color: "#FF4500",
              enable: true,
              opacity: 0.25,
            },
            move: {
              speed: 0.5,
            },
            opacity: {
              anim: {
                enable: true,
                speed: 0.25,
                opacity_min: 0.1,
              },
            },
          },
          interactivity: {
            events: {
              onhover: {
                enable: true,
                mode: "grab",
              },
              onclick: {
                enable: true,
                mode: "push",
              },
            },
            modes: {
              grab: {
                distance: 200,
              },
              push: {
                particles_nb: 1,
              },
            },
          },
          retina_detect: true,
        }}
      />
      <div className={"container"}>
        <div className={"login"}>
          {/* <LinkContainer to="/"> */}
          <IconButton onClick={logins.user ? logins.onLogout : logins.onLogin}>
            <Avatar
              style={{ backgroundColor: logins.user ? "#F2994A" : "grey" }}
            >
              {logins.user?.username.slice(0, 2).toUpperCase()}
            </Avatar>
            {logins.user?.username ?? "Login"}
          </IconButton>
          {/* </LinkContainer> */}
        </div>
        <div className={"game_name"}>ParaDox</div>
        <div className={"fst_choice"}>
          <Link to="/levelPage/0" className={"link"}>
            <FontAwesomeIcon icon={faPlay} style={{ color: "white" }} />
            &ensp;Start
          </Link>
        </div>
        <div className={"snd_choice"}>
          <Link to="/editor" className={"link"}>
            <FontAwesomeIcon icon={faEdit} style={{ color: "white" }} />
            &ensp;Editor
          </Link>
        </div>
        <div className={"trd_choice"}>
          <Link to="/arena" className={"link"}>
            <FontAwesomeIcon icon={faChessQueen} style={{ color: "white" }} />
            &ensp;Arena
          </Link>
        </div>
      </div>
    </div>
  );
};
