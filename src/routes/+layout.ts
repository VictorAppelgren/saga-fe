// Fetch assets from FastAPI backend and provide to all pages
export async function load({ fetch }) {
  try {
    const res = await fetch('http://0.0.0.0:8000/assets');
    if (!res.ok) {
      throw new Error(`Failed to fetch assets: ${res.status}`);
    }
    const assets = await res.json();
    return { assets };
  } catch (e) {
    console.error('Error in +layout.ts load:', e);
    return { assets: [] };
  }
}
