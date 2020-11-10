import React, { useContext, useState } from "react";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import TextField from "@material-ui/core/TextField/TextField";
import MButton from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Grid from "@material-ui/core/Grid/Grid";
import { userService } from "../../services/user.service";
import { LoginContext } from "../../LoginContext";
import { Divider, LinearProgress } from "@material-ui/core";

interface LoginProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterDialogue = ({
  open,
  onClose,
  onSwitchToLogin,
}: LoginProps) => {
  const logins = useContext(LoginContext);

  const [isUsernameValid, setUsernameValid] = useState(false);
  const [username, setUsername] = useState("");
  const [isEmailValid, setEmailValid] = useState(false);
  const [email, setEmail] = useState("");
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isFirstTime, setFirstTime] = useState(true);

  const checkEmail = () => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const ok = re.test(String(email).toLowerCase());
    setEmailValid(ok);
    return ok;
  };

  const checkUsername = () => {
    const ok =
      username.length >= 2 && username.length <= 50 && !username.includes(";");
    setUsernameValid(ok);
    return ok;
  };

  const checkPassword = () => {
    const ok = password.length >= 4;
    setPasswordValid(ok);
    return ok;
  };

  const submit = () => {
    if (checkEmail() && checkUsername() && checkPassword()) {
      setLoading(true);
      userService
        .register(username, email, password, logins.toggleSetUser)
        .then((res) => {
          if (res) {
            userService
              .login(username, password, logins.toggleSetUser, () =>
                alert("login error")
              )
              .then((resp) => {
                setLoading(false);
                if (resp) {
                  onClose();
                }
              });
          } else {
            alert("Register error");
            setLoading(false);
          }
        });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        style: {
          backgroundColor: "rgba(255, 255, 255, .70)",
          boxShadow: "inset 0 0 1rem 0 rgba(0, 0, 0, .2)",
          borderRadius: "5px",
          backdropFilter: "blur(7px)",
        },
      }}
    >
      <DialogTitle id="form-dialog-title">Sign Up</DialogTitle>
      <DialogContent>
        <div>
          <TextField
            required
            id="standard-required"
            label="Username"
            onChange={(event) => setUsername(event.target.value)}
            error={!isUsernameValid && !isFirstTime}
            helperText={
              isUsernameValid || isFirstTime
                ? ""
                : "Username must contain 2 ~ 50 valid characters"
            }
          />
        </div>
        <div>
          <TextField
            required
            id="standard-required"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            error={!isEmailValid && !isFirstTime}
            helperText={
              isEmailValid || isFirstTime ? "" : "Must be a valid email address"
            }
          />
        </div>

        <div>
          <TextField
            required
            id="standard-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            error={!isPasswordValid && !isFirstTime}
            helperText={
              isPasswordValid || isFirstTime
                ? ""
                : "Password must contain more than 4 characters"
            }
          />
        </div>
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <MButton
            style={{ width: "100%", backgroundColor: "green", color: "white" }}
            onClick={submit}
          >
            SUBMIT
          </MButton>
          {isLoading ? <LinearProgress /> : undefined}
        </div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Grid
          container
          style={{ justifyItems: "center", alignItems: "center" }}
        >
          <Grid item xs={9}>
            <span>Already have an account?</span>
          </Grid>
          <Grid item xs={3}>
            <MButton onClick={onSwitchToLogin} style={{ height: "100%" }}>
              Login
            </MButton>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
