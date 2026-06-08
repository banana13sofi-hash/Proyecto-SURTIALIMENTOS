# Pruebas de Rendimiento - SURTIALIMENTOS

Este directorio contiene scripts para realizar pruebas de rendimiento y carga de la API.

## Archivos

### 1. `performance-test.js` (Script básico)
Pruebas de rendimiento simples que no requieren dependencias externas.

**Ejecutar:**
```bash
node tests/performance/performance-test.js
```

**Características:**
- Tests de latencia básica (10 iteraciones por endpoint)
- Tests de carga (10 y 50 solicitudes concurrentes)
- Métricas: promedio, min, max, p50, p95, p99
- Throughput (req/s)

### 2. `k6-test.js` (Script para k6)
Script de pruebas avanzado usando [k6](https://k6.io/) para pruebas de carga más profesionales.

**Instalar k6:**
```bash
# Windows (con Chocolatey)
choco install k6

# Windows (descargar binario)
# https://github.com/grafana/k6/releases

# macOS
brew install k6

# Linux
sudo apt install k6
```

**Ejecutar:**
```bash
k6 run tests/performance/k6-test.js
```

**Características:**
- Ramp-up progresivo (10 → 50 → 100 usuarios)
- Métricas avanzadas
- Thresholds configurables
- Reporte HTML opcional: `k6 run --out html=report.html k6-test.js`

---

## Endpoints probados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/products` | GET | Listar todos los productos |
| `/api/products/:id` | GET | Obtener un producto |
| `/api/orders` | GET | Listar todas las órdenes |
| `/api/login` | POST | Iniciar sesión |

---

## Resultados esperados

### Buenos resultados ✅
- Latencia promedio < 100ms
- p95 < 500ms
- Tasa de éxito > 99%
- Throughput > 50 req/s

### Resultados problemáticos ⚠️
- Latencia promedio > 500ms
- p95 > 2000ms
- Tasa de éxito < 95%
- Throughput < 10 req/s

---

## Recomendaciones de optimización

1. **Base de datos**: Agregar índices a columnas frecuentemente consultadas
2. **Caché**: Implementar Redis para respuestas frecuentes
3. **Conexiones**: Usar connection pooling en PostgreSQL
4. **Compresión**: Habilitar gzip en Express
5. **Paginación**: Limitar resultados en endpoints de lista