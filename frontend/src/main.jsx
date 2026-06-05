import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
window.global = window;
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const GOOGLE_CLIENT_ID =
  "536027325649-l6ltjgtkasqokb9de3c72bi1hv3b1f63.apps.googleusercontent.com";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00f2fe"
    },
    background: {
      default: "#000",
      paper: "rgba(20,20,20,0.85)"
    }
  },
  shape: {
    borderRadius: 16
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);
