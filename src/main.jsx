import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./client/App.jsx";
import "./index.css";
import { GameProvider } from "./client/context/GameContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <GameProvider>
          <App />
        </GameProvider>
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>,
);
