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
  onSwitchToSignup: () => void;
}

export const LoginDialogue = ({
  open,
  onClose,
  onSwitchToSignup: onSwitchToLogin,
}: LoginProps) => {
  const logins = useContext(LoginContext);

  const [isUsernameValid, setUsernameValid] = useState(false);
  const [username, setUsername] = useState("");
  const [isPasswordValid, setPasswordValid] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isFirstTime, setFirstTime] = useState(true);

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
    if (checkUsername() && checkPassword()) {
      setLoading(true);
      userService
        .login(username, password, logins.toggleSetUser, () =>
          alert("login error")
        )
        .then((res) => {
          if (res) {
            setLoading(false);
            onClose();
          } else {
            setLoading(false);
          }
        });
    }
    setFirstTime(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth="xs"
      PaperProps={{
        style: {
          backgroundColor: "rgba(255, 255, 255, .70)",
          boxShadow: "inset 0 0 1rem 0 rgba(0, 0, 0, .2)",
          borderRadius: "5px",
          backdropFilter: "blur(7px)",
        },
      }}
    >
      <DialogTitle id="form-dialog-title">Login</DialogTitle>
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
            id="standard-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            error={!isPasswordValid && !isFirstTime}
            helperText={
              isUsernameValid || isFirstTime
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
        </div>
        <div>{isLoading && <LinearProgress />}</div>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Grid
          container
          style={{ justifyItems: "center", alignItems: "center" }}
        >
          <Grid item xs={9}>
            <span>Don't have an account?</span>
          </Grid>
          <Grid item xs={3}>
            <MButton onClick={onSwitchToLogin} style={{ height: "100%" }}>
              Sign-up
            </MButton>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
