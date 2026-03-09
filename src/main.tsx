import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

let _deferredInstallPrompt: any = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _deferredInstallPrompt = e;
});

export function getInstallPrompt() {
  return _deferredInstallPrompt;
}

export function clearInstallPrompt() {
  _deferredInstallPrompt = null;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
