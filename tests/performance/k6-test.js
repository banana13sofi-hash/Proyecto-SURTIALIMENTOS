/**
 * Performance Test Script for SURTIALIMENTOS API
 * Tests: Response times, concurrent requests, load handling
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Ramp up to 10 users
        { duration: '1m', target: 10 },    // Stay at 10 users
        { duration: '30s', target: 50 },   // Ramp up to 50 users
        { duration: '1m', target: 50 },    // Stay at 50 users
        { duration: '30s', target: 100 },  // Ramp up to 100 users
        { duration: '1m', target: 100 },   // Stay at 100 users
        { duration: '30s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
        errors: ['rate<0.1'],               // Error rate under 10%
    },
};

const BASE_URL = 'http://localhost:3001/api';

// Test scenarios
export default function () {
    // 1. Health check
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, { 'health check status 200': (r) => r.status === 200 });
    responseTime.add(healthRes.timings.duration);
    errorRate.add(healthRes.status !== 200);
    sleep(0.5);

    // 2. Get all products
    const productsRes = http.get(`${BASE_URL}/products`);
    check(productsRes, { 'products status 200': (r) => r.status === 200 });
    responseTime.add(productsRes.timings.duration);
    errorRate.add(productsRes.status !== 200);
    sleep(0.5);

    // 3. Get all orders
    const ordersRes = http.get(`${BASE_URL}/orders`);
    check(ordersRes, { 'orders status 200': (r) => r.status === 200 });
    responseTime.add(ordersRes.timings.duration);
    errorRate.add(ordersRes.status !== 200);
    sleep(0.5);

    // 4. Get single product (if exists)
    const singleProductRes = http.get(`${BASE_URL}/products/1`);
    check(singleProductRes, { 'single product status 200 or 404': (r) => r.status === 200 || r.status === 404 });
    responseTime.add(singleProductRes.timings.duration);
    errorRate.add(singleProductRes.status !== 200 && singleProductRes.status !== 404);
    sleep(0.5);

    // 5. Login test (if endpoint exists)
    const loginRes = http.post(`${BASE_URL}/login`,
        JSON.stringify({ usuario: 'test', password: 'test' }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    check(loginRes, { 'login endpoint exists': (r) => r.status === 200 || r.status === 401 });
    responseTime.add(loginRes.timings.duration);
    errorRate.add(loginRes.status < 200 || loginRes.status > 401);
    sleep(1);
}