// Durante desarrollo local, si frontend y backend están en la misma máquina
// es más fiable usar `localhost`. Si pruebas desde un dispositivo físico,
// reemplaza por la IP de la máquina que corre el backend.
const BASE_URL = 'http://localhost:3000'; // cambiar a http://<IP>:3000 para dispositivos remotos

async function handleResponse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || text || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return data;
}

export const apiRegister = async ({ username, email, password }) => {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  return handleResponse(res);
};

export const apiLogin = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

// Enviar puntaje al backend. `token` es el JWT del usuario.
// Enviar score junto a username
export const apiSendScore = async (token, { username, score, time }) => {
  const res = await fetch(`${BASE_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username, score, time })
  });
  return handleResponse(res);
};

// Obtener ranking desde el backend
export const apiGetRanking = async (token) => {
  const res = await fetch(`${BASE_URL}/ranking`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res);
};
