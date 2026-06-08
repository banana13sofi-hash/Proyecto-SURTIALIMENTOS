# 📋 Plan de Pruebas de Aceptación de Usuario (UAT)
## SURTIALIMENTOS - Sistema de Gestión

---

## 1. Información General

| Campo | Descripción |
|-------|-------------|
| **Proyecto** | SURTIALIMENTOS |
| **Versión** | 1.0.0 |
| **Fecha de Prueba** | _______________ |
| **Tester** | _______________ |
| **Entorno** | Desarrollo / Producción (simulada) |

---

## 2. Objetivos de la Prueba

- ✅ Validar que el sistema cumple con los requisitos funcionales
- ✅ Verificar que los usuarios pueden completar las tareas principales
- ✅ Identificar problemas de usabilidad antes del despliegue
- ✅ Confirmar que la interfaz es intuitiva y fácil de usar

---

## 3. Módulos a Probar

### 3.1 Autenticación
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Mensajes de error claros
- [ ] Cerrar sesión correctamente

### 3.2 Gestión de Productos
- [ ] Visualizar lista de productos
- [ ] Buscar productos por nombre
- [ ] Crear nuevo producto
- [ ] Editar producto existente
- [ ] Eliminar producto
- [ ] Validar campos obligatorios

### 3.3 Gestión de Órdenes
- [ ] Crear nueva orden
- [ ] Visualizar historial de órdenes
- [ ] Actualizar estado de orden
- [ ] Eliminar orden
- [ ] Ver detalles de orden específica

### 3.4 Navegación e Interfaz
- [ ] Sidebar funciona correctamente
- [ ] Navegación entre páginas
- [ ] Responsive en diferentes tamaños
- [ ] Tiempos de carga aceptables
- [ ] Mensajes de carga/espera

---

## 4. Casos de Prueba Detallados

### 🔐 UAT-01: Inicio de Sesión Exitoso
**Precondición:** Usuario registrado en la base de datos

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ingresar nombre de usuario | Campo acepta texto |
| 2 | Ingresar contraseña | Campo acepta texto (oculto) |
| 3 | Click en "Ingresar" | Redirección al dashboard |
| 4 | Verificar nombre de usuario | Aparece en la interfaz |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 🔐 UAT-02: Inicio de Sesión Fallido
**Precondición:** Ninguna

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ingresar usuario incorrecto | - |
| 2 | Ingresar contraseña incorrecta | - |
| 3 | Click en "Ingresar" | Mensaje de error visible |
| 4 | Verificar que no redirige | Permanece en página de login |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 📦 UAT-03: Visualizar Productos
**Precondición:** Estar logueado

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Click en "Productos" en sidebar | Carga la lista de productos |
| 2 | Verificar que aparecen productos | Lista visible con nombres y precios |
| 3 | Verificar imágenes | Imágenes se cargan correctamente |
| 4 | Verificar categorías | Productos agrupados por categoría |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 🔍 UAT-04: Buscar Producto
**Precondición:** Tener productos en la base de datos

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a la sección de productos | - |
| 2 | Escribir nombre de producto en búsqueda | Texto aparece en el campo |
| 3 | Presionar Enter o buscar | Resultados filtrados |
| 4 | Verificar resultados | Solo productos relevantes |

**Resultado:** ✅ PASA / ❌ FALLA

---

### ➕ UAT-05: Crear Producto
**Precondición:** Estar logueado con permisos de admin

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Productos | - |
| 2 | Click en "Nuevo Producto" | Formulario se abre |
| 3 | Llenar nombre | Campo acepta texto |
| 4 | Llenar descripción | Campo acepta texto largo |
| 5 | Llenar precio | Solo acepta números |
| 6 | Llenar stock | Solo acepta números |
| 7 | Seleccionar categoría | Dropdown con opciones |
| 8 | Click en "Guardar" | Producto creado, aparece en lista |
| 9 | Verificar en lista | El nuevo producto está visible |

**Resultado:** ✅ PASA / ❌ FALLA

---

### ✏️ UAT-06: Editar Producto
**Precondición:** Tener al menos un producto creado

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Productos | - |
| 2 | Click en producto específico | - |
| 3 | Click en "Editar" | Formulario con datos actuales |
| 4 | Modificar precio | Nuevo valor aceptado |
| 5 | Click en "Guardar" | Cambios guardados |
| 6 | Verificar cambio | Precio actualizado en la lista |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 🗑️ UAT-07: Eliminar Producto
**Precondición:** Tener al menos un producto creado

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Productos | - |
| 2 | Click en producto específico | - |
| 3 | Click en "Eliminar" | Ventana de confirmación |
| 4 | Confirmar eliminación | Producto removido |
| 5 | Verificar en lista | Producto ya no aparece |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 📋 UAT-08: Crear Orden
**Precondición:** Estar logueado, tener productos disponibles

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Órdenes | - |
| 2 | Click en "Nueva Orden" | Formulario de orden |
| 3 | Seleccionar productos | Productos seleccionados |
| 4 | Confirmar cantidad | Cantidad reflejada |
| 5 | Verificar total | Cálculo correcto |
| 6 | Click en "Crear Orden" | Orden creada |
| 7 | Verificar en historial | Nueva orden visible |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 👁️ UAT-09: Ver Historial de Órdenes
**Precondición:** Tener al menos una orden creada

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Órdenes | - |
| 2 | Ver lista de órdenes | Todas las órdenes del usuario |
| 3 | Ver detalles de una orden | Información completa visible |
| 4 | Ver estado de orden | Estado (pendiente/completado) visible |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 🔄 UAT-10: Actualizar Estado de Orden
**Precondición:** Tener una orden con estado "pendiente"

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a Órdenes | - |
| 2 | Seleccionar orden | - |
| 3 | Cambiar estado a "completado" | Nuevo estado seleccionado |
| 4 | Guardar cambios | Estado actualizado |
| 5 | Verificar cambio | Estado reflejando "completado" |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 🧭 UAT-11: Navegación con Sidebar
**Precondición:** Estar logueado

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Estar en cualquier página | - |
| 2 | Click en "Home" en sidebar | Redirección a Home |
| 3 | Click en "Productos" | Redirección a Productos |
| 4 | Click en "Órdenes" | Redirección a Órdenes |
| 5 | Click en "Cerrar Sesión" | Redirección a Login |

**Resultado:** ✅ PASA / ❌ FALLA

---

### 📱 UAT-12: Diseño Responsivo
**Precondición:** Ninguna

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir en escritorio (1920px) | Interfaz completa visible |
| 2 | Abrir en tablet (768px) | Interfaz adaptada |
| 3 | Abrir en móvil (375px) | Interfaz adaptada, sidebar colapsable |
| 4 | Verificar botones | Todos accesibles y visibles |

**Resultado:** ✅ PASA / ❌ FALLA

---

## 5. Checklist de Verificación Rápida

### Antes de iniciar la prueba:
- [ ] Servidor backend corriendo en puerto 3001
- [ ] Base de datos conectada y con datos de prueba
- [ ] Frontend corriendo en puerto 3000
- [ ] Credenciales de prueba disponibles
- [ ] Navegador limpio (sin caché)

### Después de cada módulo:
- [ ] Documentar errores encontrados
- [ ] Capturar screenshots de errores
- [ ] Registrar tiempo de cada prueba

---

## 6. Matriz de Resultados

| ID | Caso de Prueba | Módulo | Resultado | Bugs Encontrados | Prioridad |
|----|----------------|--------|-----------|------------------|-----------|
| UAT-01 | Login exitoso | Autenticación | ✅/❌ | | Alta/Media/Baja |
| UAT-02 | Login fallido | Autenticación | ✅/❌ | | Alta/Media/Baja |
| UAT-03 | Ver productos | Productos | ✅/❌ | | Alta/Media/Baja |
| UAT-04 | Buscar producto | Productos | ✅/❌ | | Alta/Media/Baja |
| UAT-05 | Crear producto | Productos | ✅/❌ | | Alta/Media/Baja |
| UAT-06 | Editar producto | Productos | ✅/❌ | | Alta/Media/Baja |
| UAT-07 | Eliminar producto | Productos | ✅/❌ | | Alta/Media/Baja |
| UAT-08 | Crear orden | Órdenes | ✅/❌ | | Alta/Media/Baja |
| UAT-09 | Ver historial | Órdenes | ✅/❌ | | Alta/Media/Baja |
| UAT-10 | Actualizar estado | Órdenes | ✅/❌ | | Alta/Media/Baja |
| UAT-11 | Navegación sidebar | Navegación | ✅/❌ | | Alta/Media/Baja |
| UAT-12 | Diseño responsivo | Navegación | ✅/❌ | | Alta/Media/Baja |

---

## 7. Resumen Final

| Métrica | Valor |
|---------|-------|
| Total de pruebas ejecutadas | ___/12 |
| Pruebas exitosas | ___/12 |
| Pruebas fallidas | ___/12 |
| Tasa de éxito | ___% |
| Bugs críticos encontrados | ___ |
| Bugs medios encontrados | ___ |
| Bugs bajos encontrados | ___ |

---

## 8. Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Tester | | | |
| Líder de Proyecto | | | |
| Cliente | | | |

---

**Documento creado para SURTIALIMENTOS v1.0**
*Fecha de creación: Abril 2026*