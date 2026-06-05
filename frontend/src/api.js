const API_BASE = "https://demo-springboot-zdym.onrender.com";

let isRefreshing = false;
let refreshPromise = null;

function showPopup(message, type = "info") {
  const popup = document.createElement("div");
  popup.innerText = message;

  const bg =
    type === "error"
      ? "#7f1d1d"
      : type === "success"
      ? "#064e3b"
      : "#1e293b";

  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bg};
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    z-index: 9999;
    font-family: system-ui;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

export async function apiFetch(path, options = {}, retry = true) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Preserve caller headers (important for multipart/form-data)
  const headers = {
    ...(options.headers || {}),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  };

  // Only set JSON content-type if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers
  });

  // ✅ Success or other error (not auth)
  if (res.status !== 401 || !retry) {
    return res;
  }

  // ❌ No refresh token → force logout
  if (!refreshToken) {
    forceLogout();
    return res;
  }

  // 🔁 Single refresh in flight
  if (!isRefreshing) {
    isRefreshing = true;
    showPopup("⚠️ Session expired, refreshing login...");

    refreshPromise = fetch(API_BASE + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (refreshRes) => {
        if (!refreshRes.ok) {
          throw new Error("Refresh expired");
        }

        const data = await refreshRes.json();
        localStorage.setItem("accessToken", data.accessToken);
        showPopup("✅ Session refreshed", "success");
        return data.accessToken;
      })
      .catch(() => {
        forceLogout();
        throw new Error("Session expired");
      })
      .finally(() => {
        isRefreshing = false;
      });
  }

  // 🕒 Wait for refresh, then retry ONCE
  await refreshPromise;
  return apiFetch(path, options, false);
}

function forceLogout() {
  showPopup("❌ Login expired. Please login again.", "error");
  localStorage.clear();
  window.location.href = "/login";
}
