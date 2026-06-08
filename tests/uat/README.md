# Pruebas de Aceptación de Usuario (UAT)

Este directorio contiene los documentos para ejecutar las pruebas de aceptación de usuario del sistema SURTIALIMENTOS.

## Archivos

### 1. [UAT-Plan.md](UAT-Plan.md)
Plan completo de pruebas de aceptación con:
- 12 casos de prueba detallados
- Pasos de ejecución para cada caso
- Resultados esperados
- Matriz de resultados
- Plantilla de aprobación

### 2. [UAT-Checklist.md](UAT-Checklist.md)
Checklist de ejecución rápida con:
- 29 casos de prueba organizados por módulo
- Casillas de verificación
- Sección para documentar bugs
- Resumen final con veredicto

---

## Cómo usar estos documentos

### Paso 1: Preparar el entorno
```bash
# Iniciar backend
cd backend
npm start

# En otra terminal, iniciar frontend
cd ..
npm start
```

### Paso 2: Ejecutar las pruebas
1. Abrir [UAT-Checklist.md](UAT-Checklist.md)
2. Completar información inicial (nombre, fecha, hora)
3. Ejecutar cada caso de prueba
4. Marcar ✅ o ❌ según resultado
5. Documentar cualquier bug encontrado

### Paso 3: Revisar resultados
1. Calcular tasa de éxito
2. Determinar veredicto (aprobado/rechazado)
3. Obtener firmas necesarias

---

## Estructura de pruebas

| Módulo | Casos | Descripción |
|--------|-------|-------------|
| Autenticación | 5 | Login, logout, validación |
| Productos | 8 | CRUD completo de productos |
| Órdenes | 6 | Crear, ver, actualizar órdenes |
| Navegación | 10 | Sidebar, responsive, rendimiento |

**Total: 29 casos de prueba**

---

## Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| Admin | Bananita | Administrador |
| JuanBarbosa | 123456 | Usuario |
| ZoeTrent | Superstar | Usuario |

---

## Notas

- Las pruebas deben ejecutarse en un entorno similar a producción
- Se recomienda usar datos de prueba realistas
- Capturar screenshots de cualquier error encontrado
- Documentar el tiempo de cada prueba