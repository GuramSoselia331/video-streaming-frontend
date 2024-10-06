import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Player from "./Player.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ViewStreams from "./ViewStreams.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/watch/:streamid",
    element: <Player />,
  },
  {
    path: "/streams",
    element: <ViewStreams />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
