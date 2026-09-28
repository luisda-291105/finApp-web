/**
 * @uso        Monta la app React en #root
 * @funciones  N/A (bootstrap)
 * @datos      N/A
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   index.html
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
