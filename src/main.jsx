import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import OrcaTaxApp from "./app/OrcaTaxApp.jsx";
import FakeLogin from "./components/FakeLogin.jsx";

function Root() {
  const [entered, setEntered] = useState(false);
  return entered ? <OrcaTaxApp /> : <FakeLogin onEnter={() => setEntered(true)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
