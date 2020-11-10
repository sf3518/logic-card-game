import React, { useContext, useEffect, useState } from "react";
import "../entry/Entry.css";
import "./LevelPage.css";
import { LevelButton } from "./LevelButton";
import { useParams } from "react-router";
import Axios, { AxiosRequestConfig } from "axios";
import { Paths } from "../../routesPaths";
import { LevelPageInfo } from "../../types";
import { LinkContainer } from "react-router-bootstrap";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import {
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { useStyles } from "../appbar";
import MenuIcon from "@material-ui/icons/MenuOpenOutlined";
import { LoginContext } from "../../LoginContext";

interface LevelPageParams {
  sid: string;
}

export const LevelPage = (): JSX.Element => {
  const logins = useContext(LoginContext);
  const { sid } = useParams<LevelPageParams>();
  const classes = useStyles();
  const [infos, setInfos] = useState<LevelPageInfo[]>([]);
  const [lid, setLid] = useState(0);

  const [startLevelID, setStartLevelID] = useState(0);
  const [endLevelID, setEndLevelID] = useState(0);
  const [[hasPrev, hasNext], setPrevNext] = useState([false, false]);
  const [unavailables, setunavailables] = useState<number[]>([]);
  const [title, setTitle] = useState("Title");

  useEffect(() => {
    const run = async () => {
      const user = logins.user;
      if (user) {
        const newInfos = await fetchData();
        const newLid = user.levelFinished;
        const info = newInfos[Number(sid)];
        setInfos(newInfos);
        setLid(newLid);
        setStartLevelID(info.startID);
        setEndLevelID(info.startID + info.levelsCount - 1);
        setPrevNext([info.hasPrev, info.hasNext]);
        setTitle(info.title);
        setunavailables(info.unavailables);
      }
    };
    run();
  }, [sid]);

  const fetchData = async (): Promise<LevelPageInfo[]> => {
    if (infos.length === 0) {
      const config: AxiosRequestConfig = {
        params: { uname: logins.user?.username },
      };
      return Axios.get<LevelPageInfo[]>(Paths.levelPageInfo, config).then(
        (res) => res.data
      );
    }
    return infos;
  };

  const renderTable = (): JSX.Element => {
    const renderRow = (startID: number, count: number) => {
      const row: JSX.Element[] = [];
      for (let i = startID; i < count + startID; i++) {
        row.push(
          <td style={{ verticalAlign: "middle" }}>
            <LevelButton
              sectionID={Number(sid)}
              levelID={i}
              isAvailable={!unavailables.includes(i) && i <= lid + 1}
            />
          </td>
        );
      }
      return <tr>{row}</tr>;
    };

    const totalCount = endLevelID - startLevelID + 1;
    let numberOfRows = 1;
    for (let i = Math.floor(Math.sqrt(totalCount)); i > 1; i--) {
      if (totalCount % i === 0) {
        numberOfRows = i;
        break;
      }
    }
    const rowCount =
      Math.floor(totalCount / numberOfRows) +
      (totalCount % numberOfRows == 0 ? 0 : 1);
    const table: JSX.Element[] = [];
    for (
      let i = 0, start = startLevelID;
      i < numberOfRows;
      i++, start += rowCount
    ) {
      table.push(renderRow(start, rowCount));
    }
    return <table style={{ margin: "auto" }}>{table}</table>;
  };

  const renderButton = (navTo: "prev" | "next") => {
    if ((navTo === "prev" && hasPrev) || (navTo === "next" && hasNext)) {
      const navSID = Number(sid) + (navTo === "prev" ? -1 : 1);
      const style = { fontSize: 100 };
      return (
        <LinkContainer to={"/levelPage/" + navSID}>
          <IconButton>
            {navTo === "prev" ? (
              <KeyboardArrowLeftIcon style={style} />
            ) : (
              <KeyboardArrowRightIcon style={style} />
            )}
          </IconButton>
        </LinkContainer>
      );
    }
    return undefined;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div className={"background"} />
      <AppBar position="static">
        <Toolbar style={{ backgroundColor: "#F2994A" }}>
          <Typography variant="h6" className={classes.title}>
            Levels
          </Typography>
          <LinkContainer to="/">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </LinkContainer>
        </Toolbar>
      </AppBar>
      <div className="levelPageTitle">
        <h1>{title}</h1>
      </div>
      <div style={{ height: "2rem" }}></div>
      <Grid container justify="center" alignItems="center">
        <Grid item xs={1}>
          {renderButton("prev")}
        </Grid>
        <Grid item xs={10}>
          {renderTable()}
        </Grid>
        <Grid item xs={1}>
          {renderButton("next")}
        </Grid>
      </Grid>
    </div>
  );
};
