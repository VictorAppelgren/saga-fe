// Fetch assets from FastAPI backend and provide to all pages
export async function load() {
  const res = await fetch('http://0.0.0.0:8000/assets');
  if (!res.ok) throw new Error('Failed to fetch assets');
  const { assets } = await res.json();
  return { assets };
}
