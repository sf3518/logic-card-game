import Axios, { AxiosRequestConfig } from "axios";
import { UserResponse, UserCredential, LoginCredential, UserInfo } from "../types";
import { Paths } from "../routesPaths";
import sha256 from "crypto-js/sha256";

type SetUser = (user: UserInfo | undefined) => void

const salt = "sallty"

function hash(input: string): string {
  return sha256(salt + input).toString()
}

export function authHeader() {
  // return authorization header with jwt token
  let user = JSON.parse(localStorage.getItem('user') ?? "null");

  if (user && user.token) {
      return { 'Authorization': 'Bearer ' + user.token };
  } else {
      return {};
  }
}

export const userService = {
    login,
    logout,
    register,
};

function login(
  username: string, 
  password: string, 
  onSetUser: SetUser,
  onError: () => void
) {
    const requestOptions: AxiosRequestConfig = {
        headers: { 'Content-Type': 'application/json' },
    }

    const data: LoginCredential = {
      username: username,
      password: hash(password)
    }

    return Axios.post<UserInfo>(Paths.userLogin, data, requestOptions)
        .then(resp => resp.data)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            onSetUser(user)
            return user;
        })
        .catch(err => { onError(); return undefined })
}

function logout(onSetUser: SetUser) {
    // remove user from local storage to log user out
    onSetUser(undefined)
}

function register(
  username: string, 
  email: string,
  password: string,
  onSetUser: SetUser
) {
    const requestOptions = {
        headers: { 'Content-Type': 'application/json' },
    };

    const data: UserCredential = {
      username: username, 
      email: email, 
      password: hash(password)
    }

    return Axios.post<UserInfo>(Paths.userRegister, data, requestOptions)
      .then(resp => resp.data)
}
