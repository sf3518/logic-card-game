import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
import { Entry } from './components/entry/Entry';
import { LevelPage } from './components/entry/LevelPage';
import { UserCredential, UserInfo } from './types';
import { LoginContext } from './LoginContext';
import { LevelEditor } from './components/editor/LevelEditor';
import { Arena } from './components/arena/Arena';
import { SinglePlayerLevelBoard } from './components/game/SinglePlayerLevelBoard';
import { ArenaLevelBoard } from './components/game/ArenaLevelBoard';
import { RegisterDialogue } from './components/auth/Register';
import { LoginDialogue } from './components/auth/Login';
import { LogoutDialogue } from './components/auth/Logout';
import { UserPage } from './components/user/UserPage';
import Axios, { AxiosRequestConfig } from 'axios';
import { Paths } from './routesPaths';

type DialogState = "hide" | "login" | "signup" | "logout";

function App() {
  const [show, setShow] = useState<DialogState>("hide");
  const [user, setUser] = useState<UserInfo | undefined>(undefined)


  useEffect(() => {
    const item = localStorage.getItem("user");
    if (item) {
      setUser(JSON.parse(item));
    } else {
      setUser(undefined);
    }
  }, []);

  const handleClose = () => {
    setShow("hide");
  };

  const passLevel = (user: UserInfo | undefined) => (levelID: number) => {
    if (user) {
      if (levelID > user.levelFinished) {
        user.levelFinished = levelID
        setUser(user)
        const config: AxiosRequestConfig = {
          params: { lid: levelID, uname: user.username }
        }
        Axios.post(Paths.levelSubmit, config)
      }
    }
  }

  return (
    <div className="App">
      <LoginContext.Provider value={{ 
        user: user, 
        toggleSetUser: u => { 
          setUser(u)
          if (u) {
            localStorage.setItem('user', JSON.stringify(u)) 
          } else {
            localStorage.removeItem('user')
          }
        },
        toggleLogout: () => { setUser(undefined); localStorage.removeItem('user') },
        onLogin: () => setShow('login'),
        onSignup: () => setShow('signup'),
        onHide: () => setShow('hide'),
        onLogout: () => setShow('logout'),
        passLevel: passLevel(user)
      }}>
        <Route exact path="/" component={Entry}></Route>
        <Route path="/levelPage/:sid" component={LevelPage}></Route>
        <Route
          path="/level/:sid/:levelID"
          component={SinglePlayerLevelBoard}
        ></Route>
        <Route path="/editor" component={LevelEditor}></Route>
        <Route exact path="/arena" component={Arena}></Route>
        <Route path="/arena/level/:lid" component={ArenaLevelBoard}></Route>
        <Route path="/user/:uid" component={UserPage} />
        {/* Sign-up Dialogue */}
        <RegisterDialogue
          open={show == "signup"}
          onClose={handleClose}
          onSwitchToLogin={() => setShow("login")}
        />
        {/* Login Dialogue */}
        <LoginDialogue
          open={show == "login"}
          onClose={handleClose}
          onSwitchToSignup={() => setShow("signup")}
        />
        <LogoutDialogue open={show == "logout"} />
      </LoginContext.Provider>
    </div>
  );
}

export default App;
