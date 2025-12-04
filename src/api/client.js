export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiGet(path){
    const res = await fetch(`${BACKEND_URL}${path}`);
    return res.json();
}