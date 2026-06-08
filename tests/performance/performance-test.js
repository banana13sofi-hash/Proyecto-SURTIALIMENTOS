/**
 * Performance Test for SURTIALIMENTOS API
 * Simple load testing without external dependencies
 */

const BASE_URL = 'http://localhost:3001/api';

const results = {
    health: [],
    products: [],
    orders: [],
    singleProduct: [],
    login: [],
};

async function measureEndpoint(name, url, method = 'GET', body = null) {
    const start = process.hrtime.bigint();
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000; // Convert to ms

        return { success: response.ok, duration, status: response.status };
    } catch (error) {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000;
        return { success: false, duration, error: error.message };
    }
}

async function runTest(name, resultsArray, testFn, iterations = 10) {
    console.log(`\n📊 Testing: ${name}`);
    console.log('─'.repeat(40));

    for (let i = 0; i < iterations; i++) {
        const result = await testFn();
        resultsArray.push(result);

        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} Iteration ${i + 1}: ${result.duration.toFixed(2)}ms ${result.status ? `(HTTP ${result.status})` : ''}`);
    }

    const avg = resultsArray.reduce((a, b) => a + b.duration, 0) / resultsArray.length;
    const min = Math.min(...resultsArray.map(r => r.duration));
    const max = Math.max(...resultsArray.map(r => r.duration));
    const successRate = resultsArray.filter(r => r.success).length / resultsArray.length * 100;

    console.log(`\n  📈 Results:`);
    console.log(`     Average: ${avg.toFixed(2)}ms`);
    console.log(`     Min: ${min.toFixed(2)}ms`);
    console.log(`     Max: ${max.toFixed(2)}ms`);
    console.log(`     Success Rate: ${successRate.toFixed(1)}%`);

    return { avg, min, max, successRate };
}

async function runLoadTest(name, testFn, concurrent = 10, duration = 5) {
    console.log(`\n🔥 Load Test: ${concurrent} concurrent requests for ${duration}s`);
    console.log('─'.repeat(40));

    const startTime = Date.now();
    const latencies = [];
    let successCount = 0;
    let errorCount = 0;

    const promises = [];
    while (Date.now() - startTime < duration * 1000) {
        for (let i = 0; i < concurrent; i++) {
            promises.push(
                testFn().then(result => {
                    latencies.push(result.duration);
                    if (result.success) successCount++;
                    else errorCount++;
                })
            );
        }
        await new Promise(r => setTimeout(r, 100));
    }

    await Promise.all(promises);

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p50 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.5)];
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    const p99 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)];
    const rps = latencies.length / duration;

    console.log(`  Total Requests: ${latencies.length}`);
    console.log(`  Success: ${successCount} | Errors: ${errorCount}`);
    console.log(`  Avg: ${avg.toFixed(2)}ms | p50: ${p50.toFixed(2)}ms | p95: ${p95.toFixed(2)}ms | p99: ${p99.toFixed(2)}ms`);
    console.log(`  Throughput: ${rps.toFixed(2)} req/s`);

    return { avg, p50, p95, p99, rps, successCount, errorCount };
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║   SURTIALIMENTOS API - Performance Tests          ║');
    console.log('╚═══════════════════════════════════════════════════╝');

    // Check if server is running
    console.log('\n🔍 Checking server availability...');
    const health = await measureEndpoint('health', `${BASE_URL}/health`);
    if (!health.success) {
        console.log('❌ Server not running at http://localhost:3001');
        console.log('   Please start the server first: cd backend && npm start');
        process.exit(1);
    }
    console.log('✅ Server is running\n');

    // Basic performance tests
    await runTest('Health Check', results.health, () =>
        measureEndpoint('health', `${BASE_URL}/health`)
    );

    await runTest('Get All Products', results.products, () =>
        measureEndpoint('products', `${BASE_URL}/products`)
    );

    await runTest('Get All Orders', results.orders, () =>
        measureEndpoint('orders', `${BASE_URL}/orders`)
    );

    await runTest('Get Single Product', results.singleProduct, () =>
        measureEndpoint('single product', `${BASE_URL}/products/1`)
    );

    await runTest('Login', results.login, () =>
        measureEndpoint('login', `${BASE_URL}/login`, 'POST', { usuario: 'test', password: 'test' })
    );

    // Load tests
    console.log('\n' + '═'.repeat(50));
    console.log('                    LOAD TESTS');
    console.log('═'.repeat(50));

    await runLoadTest('Products Load', () =>
        measureEndpoint('products', `${BASE_URL}/products`), 10, 5
    );

    await runLoadTest('Orders Load', () =>
        measureEndpoint('orders', `${BASE_URL}/orders`), 10, 5
    );

    await runLoadTest('High Concurrency', () =>
        measureEndpoint('products', `${BASE_URL}/products`), 50, 5
    );

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('                    SUMMARY');
    console.log('═'.repeat(50));

    console.log('\n📋 Endpoint Performance:');
    console.log('─'.repeat(40));
    console.log(`  Health Check:    ${results.health[0]?.duration.toFixed(2) || 'N/A'}ms`);
    console.log(`  Get Products:    ${results.products[0]?.duration.toFixed(2) || 'N/A'}ms`);
    console.log(`  Get Orders:      ${results.orders[0]?.duration.toFixed(2) || 'N/A'}ms`);
    console.log(`  Get Single:      ${results.singleProduct[0]?.duration.toFixed(2) || 'N/A'}ms`);
    console.log(`  Login:           ${results.login[0]?.duration.toFixed(2) || 'N/A'}ms`);

    console.log('\n✅ Performance test completed!');
}

main().catch(console.error);