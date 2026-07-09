Pasos para migrar SQLite -> PostgreSQL y ejecutar backend con PostgreSQL

1) Configura credenciales
   Copia backend/.env.example a backend/.env y completa:
   - PGHOST
   - PGPORT
   - PGDATABASE
   - PGUSER
   - PGPASSWORD

2) Migra datos una sola vez
   Ejecuta:
   node backend/db_sqlite_to_pg.js

3) Verifica en pgAdmin
   Deben existir tablas:
   - productos
   - usuarios
   - ordenes
   - orden_items

4) Levanta el backend
   npm install
   npm run dev (o node backend/server.js según tu setup)

Notas
- El backend ahora usa PostgreSQL (backend/bd.js).
- No uses el script init_db.js (ese es para otro flujo). Si lo ejecutas podrías regenerar/usar SQLite.

