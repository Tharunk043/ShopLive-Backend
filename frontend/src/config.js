export const getApiBase = () => {
  const host = window.location.hostname;
  const port = window.location.port;
  if (host === "localhost" || host === "127.0.0.1") {
    // K8s port 80 maps to /api proxy. Dev vite server maps directly to backend 8080.
    return port === "5173" ? "http://localhost:8080" : "/api";
  }
  return "https://demo-springboot-zdym.onrender.com";
};

export const getWsBase = () => {
  const host = window.location.hostname;
  const port = window.location.port;
  if (host === "localhost" || host === "127.0.0.1") {
    return port === "5173" ? "http://localhost:8080/ws" : "/api/ws";
  }
  return "https://demo-springboot-zdym.onrender.com/ws";
};

export const API_BASE = getApiBase();
export const WS_BASE = getWsBase();
