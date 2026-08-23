import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

// Google Analytics 4 - Measurement ID: G-EBK5BTE9E0
// Initialize GA4 as backup/redundancy to ensure data collection
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

if (!window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-EBK5BTE9E0', {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
