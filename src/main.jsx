import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "pannellum/build/pannellum.css";
import "./styles.css";
import "./pascal-followup.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
