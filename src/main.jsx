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
import App from "./App.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
