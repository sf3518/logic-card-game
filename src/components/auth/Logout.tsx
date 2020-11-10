import React, { useContext } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import MButton from "@material-ui/core/Button";
import { LoginContext } from "../../LoginContext";
import { DialogContentText } from "@material-ui/core";

interface Props {
  open: boolean;
}

export const LogoutDialogue = ({ open }: Props) => {
  const logins = useContext(LoginContext);

  return (
    <Dialog open={open} onClose={logins.onHide}>
      <DialogTitle>Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to logout?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <MButton onClick={logins.onHide}>Cancel</MButton>
        <MButton
          color="secondary"
          onClick={() => {
            logins.toggleLogout();
            logins.onHide();
          }}
        >
          Logout
        </MButton>
      </DialogActions>
    </Dialog>
  );
};
