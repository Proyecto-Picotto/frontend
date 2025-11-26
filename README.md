Plataforma de Juegos - Entregable completo (Sprint 1)

Contenido:
- frontend/: Expo app (Login/Register/Home + Maze mockup)
- backend/: Express API (auth)

Instrucciones rápidas:
- Backend:
  1. cd backend
  2. cp .env.example .env && editar .env (MONGODB_URI, JWT_SECRET)
  3. npm install
  4. npm run dev

- Frontend:
  1. cd frontend
  2. npm install
  3. npx expo start
  4. Editar src/api.js para usar la URL del backend (ej: http://10.0.2.2:4000 para emulador Android)
