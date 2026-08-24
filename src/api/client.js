export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiGet(path) {
  const res = await fetch(`${BACKEND_URL}${path}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
