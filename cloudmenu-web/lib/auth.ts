// lib/auth.ts
export function saveToken(data: any) {
  // Handle both string and JSON response
  const token = typeof data === "string" ? data : data?.token;
  if (token) {
    localStorage.setItem("token", token); // ✅ use "token" everywhere
  } else {
    console.error("No token found in response:", data);
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
