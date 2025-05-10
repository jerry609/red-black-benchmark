// advanced_tests.js - 高级测试场景

/**
 * 高级性能测试模块
 * 包含更复杂的测试场景，如并发测试、压力测试等
 */

const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const fs = require('fs');
const path = require('path');

/**
 * 高级测试类
 */
class AdvancedPerformanceTester {
    constructor(dataStructures, testConfig = {}) {
        this.dataStructures = dataStructures;
        this.results = {};

        // 默认配置
        this.config = {
            basePath: './test_data',          // 测试数据目录
            concurrentThreads: 4,             // 并发线程数
            stressTestDuration: 60 * 1000,    // 压力测试持续时间 (ms)
            checkpointInterval: 5 * 1000,     // 检查点间隔 (ms)
            ...testConfig
        };

        // 确保测试数据目录存在
        if (!fs.existsSync(this.config.basePath)) {
            fs.mkdirSync(this.config.basePath, {recursive: true});
        }
    }

    /**
     * 运行所有高级测试
     */
    async runAllTests() {
        console.log("开始执行高级性能测试...");

        // 执行并发读写测试
        await this.runConcurrentTest();

        // 执行数据倾斜测试
        await this.runDataSkewTest();

        // 执行压力测试
        await this.runStressTest();

        // 执行持久化测试
        await this.runPersistenceTest();

        console.log("高级性能测试完成");

        return this.results;
    }

    /**
     * 并发读写测试
     * 测试数据结构在多线程环境下的性能表现
     */
    async runConcurrentTest(dataSize = 100000, operations = 1000000, readRatio = 0.8) {
        console.log(`\n开始并发读写测试（数据量：${dataSize}，操作数：${operations}，读比例：${readRatio}）...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 在并发环境下的性能...`);

            results[name] = {
                throughput: 0,
                readLatency: 0,
                writeLatency: 0,
                errors: 0
            };

            try {
                // 生成测试数据
                const testData = this._generateTestData(dataSize);
                const testFilePath = path.join(this.config.basePath, `concurrent_test_${name}.json`);

                // 将测试数据保存到文件，以便工作线程读取
                fs.writeFileSync(testFilePath, JSON.stringify({
                    className: name,
                    testData,
                    operations,
                    readRatio
                }));

                // 启动工作线程
                const workers = [];
                const threadOperations = Math.floor(operations / this.config.concurrentThreads);

                for (let i = 0; i < this.config.concurrentThreads; i++) {
                    workers.push(this._createWorker('concurrent', {
                        testFilePath,
                        threadId: i,
                        operations: threadOperations
                    }));
                }

                // 收集结果
                const workerResults = await Promise.all(workers);

                // 计算总吞吐量和平均延迟
                let totalOperations = 0;
                let totalReadTime = 0;
                let totalWriteTime = 0;
                let totalReadOps = 0;
                let totalWriteOps = 0;
                let totalErrors = 0;
                let totalTime = 0;

                for (const result of workerResults) {
                    totalOperations += result.totalOps;
                    totalReadTime += result.readTime;
                    totalWriteTime += result.writeTime;
                    totalReadOps += result.readOps;
                    totalWriteOps += result.writeOps;
                    totalErrors += result.errors;
                    totalTime = Math.max(totalTime, result.totalTime);
                }

                // 计算最终指标
                results[name].throughput = totalOperations / (totalTime / 1000); // ops/sec
                results[name].readLatency = totalReadOps > 0 ? totalReadTime / totalReadOps : 0;
                results[name].writeLatency = totalWriteOps > 0 ? totalWriteTime / totalWriteOps : 0;
                results[name].errors = totalErrors;

                // 清理临时文件
                fs.unlinkSync(testFilePath);

                console.log(`${name} 并发测试完成：吞吐量 ${results[name].throughput.toFixed(2)} ops/sec，读延迟 ${results[name].readLatency.toFixed(2)} ms，写延迟 ${results[name].writeLatency.toFixed(2)} ms`);
            } catch (error) {
                console.error(`${name} 并发测试失败:`, error);
                results[name].error = error.message;
            }
        }

        this.results.concurrent = results;
        return results;
    }

    /**
     * 数据倾斜测试
     * 测试数据结构在处理非均匀分布数据时的性能表现
     */
    async runDataSkewTest(dataSize = 100000, operations = 100000, skewFactor = 0.8) {
        console.log(`\n开始数据倾斜测试（数据量：${dataSize}，操作数：${operations}，倾斜因子：${skewFactor}）...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 在数据倾斜条件下的性能...`);

            results[name] = {
                insertTime: 0,
                searchTime: 0,
                deleteTime: 0,
                hotspotSearchTime: 0,
                coldspotSearchTime: 0
            };

            try {
                // 生成倾斜分布数据
                const testData = this._generateSkewedData(dataSize, skewFactor);

                // 创建数据结构实例
                const ds = new DataStructureClass();

                // 测试插入性能
                const insertStart = performance.now();
                for (const item of testData) {
                    ds.insert(item.key, item.value);
                }
                const insertEnd = performance.now();
                results[name].insertTime = insertEnd - insertStart;

                // 准备热点区域和冷点区域的查询键
                const hotspotMax = Math.floor(dataSize * 0.2); // 20%的热点区域
                const hotspotKeys = [];
                const coldspotKeys = [];

                for (let i = 0; i < operations; i++) {
                    if (Math.random() < skewFactor) {
                        // 生成热点区域的键
                        hotspotKeys.push(Math.floor(Math.random() * hotspotMax));
                    } else {
                        // 生成冷点区域的键
                        coldspotKeys.push(Math.floor(Math.random() * (dataSize - hotspotMax)) + hotspotMax);
                    }
                }

                // 测试热点查询性能
                const hotspotSearchStart = performance.now();
                for (const key of hotspotKeys) {
                    ds.search(key);
                }
                const hotspotSearchEnd = performance.now();
                results[name].hotspotSearchTime = hotspotSearchEnd - hotspotSearchStart;

                // 测试冷点查询性能
                const coldspotSearchStart = performance.now();
                for (const key of coldspotKeys) {
                    ds.search(key);
                }
                const coldspotSearchEnd = performance.now();
                results[name].coldspotSearchTime = coldspotSearchEnd - coldspotSearchStart;

                // 计算总查询时间
                results[name].searchTime = results[name].hotspotSearchTime + results[name].coldspotSearchTime;

                // 准备删除键
                const deleteKeys = [];
                for (let i = 0; i < Math.min(operations, dataSize); i++) {
                    if (Math.random() < skewFactor) {
                        // 主要删除热点区域的键
                        deleteKeys.push(Math.floor(Math.random() * hotspotMax));
                    } else {
                        // 少量删除冷点区域的键
                        deleteKeys.push(Math.floor(Math.random() * (dataSize - hotspotMax)) + hotspotMax);
                    }
                }

                // 测试删除性能
                const deleteStart = performance.now();
                for (const key of deleteKeys) {
                    ds.delete(key);
                }
                const deleteEnd = performance.now();
                results[name].deleteTime = deleteEnd - deleteStart;

                console.log(`${name} 数据倾斜测试完成：插入 ${results[name].insertTime.toFixed(2)} ms，查询 ${results[name].searchTime.toFixed(2)} ms，删除 ${results[name].deleteTime.toFixed(2)} ms`);
            } catch (error) {
                console.error(`${name} 数据倾斜测试失败:`, error);
                results[name].error = error.message;
            }
        }

        this.results.dataSkew = results;
        return results;
    }

    /**
     * 压力测试
     * 长时间运行测试，观察性能随时间变化情况
     */
    async runStressTest(dataSize = 100000, operationsPerCheckpoint = 10000) {
        console.log(`\n开始压力测试（初始数据量：${dataSize}，每检查点操作数：${operationsPerCheckpoint}）...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`对 ${name} 进行压力测试...`);

            results[name] = {
                checkpoints: [],
                totalOperations: 0,
                totalTime: 0,
                peakMemory: 0
            };

            try {
                // 创建数据结构实例
                const ds = new DataStructureClass();

                // 预先加载数据
                const preloadData = this._generateTestData(dataSize);
                for (const item of preloadData) {
                    ds.insert(item.key, item.value);
                }

                let continueTest = true;
                let checkpointCount = 0;
                const startTime = performance.now();
                let lastCheckpointTime = startTime;

                while (continueTest) {
                    // 生成混合操作序列
                    const operations = this._generateMixedOperations(operationsPerCheckpoint, dataSize);

                    // 执行操作
                    const checkpointStart = performance.now();
                    let readTime = 0;
                    let writeTime = 0;
                    let readOps = 0;
                    let writeOps = 0;

                    for (const op of operations) {
                        if (op.type === 'search') {
                            const opStart = performance.now();
                            ds.search(op.key);
                            const opEnd = performance.now();
                            readTime += (opEnd - opStart);
                            readOps++;
                        } else if (op.type === 'insert') {
                            const opStart = performance.now();
                            ds.insert(op.key, op.value);
                            const opEnd = performance.now();
                            writeTime += (opEnd - opStart);
                            writeOps++;
                        } else if (op.type === 'delete') {
                            const opStart = performance.now();
                            ds.delete(op.key);
                            const opEnd = performance.now();
                            writeTime += (opEnd - opStart);
                            writeOps++;
                        }
                    }

                    const checkpointEnd = performance.now();
                    const memoryUsage = process.memoryUsage().heapUsed;

                    // 记录检查点数据
                    results[name].checkpoints.push({
                        checkpoint: checkpointCount,
                        elapsed: checkpointEnd - startTime,
                        operations: operationsPerCheckpoint,
                        time: checkpointEnd - checkpointStart,
                        throughput: operationsPerCheckpoint / ((checkpointEnd - checkpointStart) / 1000),
                        readLatency: readOps > 0 ? readTime / readOps : 0,
                        writeLatency: writeOps > 0 ? writeTime / writeOps : 0,
                        memory: memoryUsage
                    });

                    // 更新结果
                    results[name].totalOperations += operationsPerCheckpoint;
                    results[name].totalTime = checkpointEnd - startTime;
                    results[name].peakMemory = Math.max(results[name].peakMemory, memoryUsage);

                    // 检查是否达到测试持续时间
                    if (checkpointEnd - startTime >= this.config.stressTestDuration) {
                        continueTest = false;
                    }

                    // 输出进度
                    console.log(`${name} 压力测试 检查点 ${checkpointCount}: ${operationsPerCheckpoint} 操作，吞吐量 ${results[name].checkpoints[checkpointCount].throughput.toFixed(2)} ops/sec`);

                    // 更新检查点计数并等待下一个检查点
                    checkpointCount++;
                    lastCheckpointTime = checkpointEnd;

                    // 简单的休眠，确保不会过快消耗CPU
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                console.log(`${name} 压力测试完成：总操作数 ${results[name].totalOperations}，总时间 ${(results[name].totalTime / 1000).toFixed(2)} 秒，峰值内存 ${(results[name].peakMemory / (1024 * 1024)).toFixed(2)} MB`);
            } catch (error) {
                console.error(`${name} 压力测试失败:`, error);
                results[name].error = error.message;
            }
        }

        this.results.stress = results;
        return results;
    }

    /**
     * 持久化与恢复测试
     * 测试数据结构序列化和反序列化的性能
     */
    async runPersistenceTest(dataSize = 100000) {
        console.log(`\n开始持久化与恢复测试（数据量：${dataSize}）...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 的持久化与恢复性能...`);

            results[name] = {
                serializeTime: 0,
                deserializeTime: 0,
                fileSize: 0
            };

            try {
                // 不是所有数据结构都原生支持序列化，我们通过保存键值对来模拟

                // 创建数据结构实例并填充数据
                const ds = new DataStructureClass();
                const testData = this._generateTestData(dataSize);

                for (const item of testData) {
                    ds.insert(item.key, item.value);
                }

                // 导出数据
                const exportedData = [];
                if (typeof ds.inOrderTraversal === 'function') {
                    ds.inOrderTraversal(node => {
                        exportedData.push({
                            key: node.key,
                            value: node.value
                        });
                    });
                } else {
                    // 回退方法：尝试直接访问数据
                    console.warn(`${name} 不支持遍历，尝试使用替代方法导出数据`);
                    // 这是一个简化的方法，实际使用时可能需要针对具体数据结构进行定制
                    exportedData.push(...testData);
                }

                // 保存到文件（序列化）
                const filePath = path.join(this.config.basePath, `${name}_serialized.json`);

                const serializeStart = performance.now();
                const serializedData = JSON.stringify(exportedData);
                fs.writeFileSync(filePath, serializedData);
                const serializeEnd = performance.now();

                results[name].serializeTime = serializeEnd - serializeStart;
                results[name].fileSize = fs.statSync(filePath).size;

                // 从文件加载（反序列化）
                const deserializeStart = performance.now();
                const loadedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // 重建数据结构
                const newDs = new DataStructureClass();
                for (const item of loadedData) {
                    newDs.insert(item.key, item.value);
                }
                const deserializeEnd = performance.now();

                results[name].deserializeTime = deserializeEnd - deserializeStart;

                // 验证数据一致性
                let isValid = true;
                for (const item of testData) {
                    const value = newDs.search(item.key);
                    if (value !== item.value) {
                        isValid = false;
                        break;
                    }
                }

                results[name].isValid = isValid;

                // 清理临时文件
                fs.unlinkSync(filePath);

                console.log(`${name} 持久化测试完成：序列化 ${results[name].serializeTime.toFixed(2)} ms，反序列化 ${results[name].deserializeTime.toFixed(2)} ms，文件大小 ${(results[name].fileSize / 1024).toFixed(2)} KB，数据一致性 ${results[name].isValid ? '通过' : '失败'}`);
            } catch (error) {
                console.error(`${name} 持久化测试失败:`, error);
                results[name].error = error.message;
            }
        }

        this.results.persistence = results;
        return results;
    }

    /**
     * 为并发测试创建工作线程
     */
    _createWorker(testType, workerData) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.join(__dirname, 'worker.js'), {
                workerData: {
                    testType,
                    ...workerData
                }
            });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', code => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }

    /**
     * 生成测试数据
     */
    _generateTestData(size) {
        const data = [];

        for (let i = 0; i < size; i++) {
            const key = Math.floor(Math.random() * size * 10);
            data.push({key, value: `value-${key}`});
        }

        return data;
    }

    /**
     * 生成倾斜分布的测试数据
     */
    _generateSkewedData(size, skewFactor = 0.8) {
        const data = [];
        const hotspotSize = Math.floor(size * 0.2); // 20%的数据范围作为热点区域

        for (let i = 0; i < size; i++) {
            let key;

            if (Math.random() < skewFactor) {
                // 80%的概率生成热点区域内的键
                key = Math.floor(Math.random() * hotspotSize);
            } else {
                // 20%的概率生成非热点区域内的键
                key = Math.floor(Math.random() * (size - hotspotSize)) + hotspotSize;
            }

            data.push({key, value: `value-${key}`});
        }

        return data;
    }

    /**
     * 生成混合操作序列
     */
    _generateMixedOperations(count, dataSize) {
        const operations = [];

        for (let i = 0; i < count; i++) {
            const r = Math.random();

            if (r < 0.7) {
                // 70% 查询操作
                operations.push({
                    type: 'search',
                    key: Math.floor(Math.random() * dataSize * 2) // 可能包含不存在的键
                });
            } else if (r < 0.85) {
                // 15% 插入操作
                const key = Math.floor(Math.random() * dataSize * 2);
                operations.push({
                    type: 'insert',
                    key,
                    value: `value-${key}`
                });
            } else {
                // 15% 删除操作
                operations.push({
                    type: 'delete',
                    key: Math.floor(Math.random() * dataSize * 2) // 可能包含不存在的键
                });
            }
        }

        return operations;
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        if (Object.keys(this.results).length === 0) {
            return "请先运行测试";
        }

        let report = "# 高级性能测试报告\n\n";

        // 并发测试报告
        if (this.results.concurrent) {
            report += "## 并发读写测试\n\n";
            report += "| 数据结构 | 吞吐量 (ops/s) | 读延迟 (ms) | 写延迟 (ms) | 错误数 |\n";
            report += "| --- | --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.concurrent)) {
                if (results.error) {
                    report += `| ${name} | 测试失败 | - | - | - |\n`;
                } else {
                    report += `| ${name} | ${results.throughput.toFixed(2)} | ${results.readLatency.toFixed(4)} | ${results.writeLatency.toFixed(4)} | ${results.errors} |\n`;
                }
            }

            report += "\n";
        }

        // 数据倾斜测试报告
        if (this.results.dataSkew) {
            report += "## 数据倾斜测试\n\n";
            report += "| 数据结构 | 插入时间 (ms) | 热点查询时间 (ms) | 冷点查询时间 (ms) | 总查询时间 (ms) | 删除时间 (ms) |\n";
            report += "| --- | --- | --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.dataSkew)) {
                if (results.error) {
                    report += `| ${name} | 测试失败 | - | - | - | - |\n`;
                } else {
                    report += `| ${name} | ${results.insertTime.toFixed(2)} | ${results.hotspotSearchTime.toFixed(2)} | ${results.coldspotSearchTime.toFixed(2)} | ${results.searchTime.toFixed(2)} | ${results.deleteTime.toFixed(2)} |\n`;
                }
            }

            report += "\n";
        }

        // 压力测试报告
        if (this.results.stress) {
            report += "## 压力测试\n\n";
            report += "| 数据结构 | 总操作数 | 总时间 (s) | 平均吞吐量 (ops/s) | 峰值内存 (MB) | 最终延迟 (ms) |\n";
            report += "| --- | --- | --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.stress)) {
                if (results.error) {
                    report += `| ${name} | 测试失败 | - | - | - | - |\n`;
                } else {
                    const avgThroughput = results.totalOperations / (results.totalTime / 1000);
                    const lastCheckpoint = results.checkpoints[results.checkpoints.length - 1];
                    const finalLatency = (lastCheckpoint.readLatency * 0.7) + (lastCheckpoint.writeLatency * 0.3); // 假设70%读30%写

                    report += `| ${name} | ${results.totalOperations} | ${(results.totalTime / 1000).toFixed(2)} | ${avgThroughput.toFixed(2)} | ${(results.peakMemory / (1024 * 1024)).toFixed(2)} | ${finalLatency.toFixed(4)} |\n`;
                }
            }

            report += "\n";

            // 添加性能趋势分析
            report += "### 性能趋势分析\n\n";

            for (const [name, results] of Object.entries(this.results.stress)) {
                if (!results.error && results.checkpoints.length > 0) {
                    report += `#### ${name} 性能趋势\n\n`;
                    report += "| 检查点 | 已运行时间 (s) | 吞吐量 (ops/s) | 读延迟 (ms) | 写延迟 (ms) | 内存使用 (MB) |\n";
                    report += "| --- | --- | --- | --- | --- | --- |\n";

                    // 展示部分检查点数据（避免报告过长）
                    const checkpointsToShow = results.checkpoints.length <= 10 ?
                        results.checkpoints :
                        [...results.checkpoints.slice(0, 3),
                            ...results.checkpoints.slice(Math.floor(results.checkpoints.length / 2) - 1, Math.floor(results.checkpoints.length / 2) + 2),
                            ...results.checkpoints.slice(-3)];

                    for (const checkpoint of checkpointsToShow) {
                        report += `| ${checkpoint.checkpoint} | ${(checkpoint.elapsed / 1000).toFixed(2)} | ${checkpoint.throughput.toFixed(2)} | ${checkpoint.readLatency.toFixed(4)} | ${checkpoint.writeLatency.toFixed(4)} | ${(checkpoint.memory / (1024 * 1024)).toFixed(2)} |\n`;
                    }

                    report += "\n";
                }
            }
        }

        // 持久化测试报告
        if (this.results.persistence) {
            report += "## 持久化与恢复测试\n\n";
            report += "| 数据结构 | 序列化时间 (ms) | 反序列化时间 (ms) | 文件大小 (KB) | 数据一致性 |\n";
            report += "| --- | --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.persistence)) {
                if (results.error) {
                    report += `| ${name} | 测试失败 | - | - | - |\n`;
                } else {
                    report += `| ${name} | ${results.serializeTime.toFixed(2)} | ${results.deserializeTime.toFixed(2)} | ${(results.fileSize / 1024).toFixed(2)} | ${results.isValid ? '✓' : '✗'} |\n`;
                }
            }

            report += "\n";
        }

        // 综合评估
        report += "## 综合性能评估\n\n";

        // 计算各项测试的综合得分
        const scores = {};

        for (const dsName of Object.keys(this.dataStructures)) {
            scores[dsName] = {
                concurrent: 0,
                dataSkew: 0,
                stress: 0,
                persistence: 0,
                total: 0
            };
        }

        // 并发测试得分
        if (this.results.concurrent) {
            const throughputs = Object.values(this.results.concurrent)
                .filter(r => !r.error)
                .map(r => r.throughput);

            const maxThroughput = Math.max(...throughputs);

            for (const [name, results] of Object.entries(this.results.concurrent)) {
                if (!results.error) {
                    // 吞吐量得分 (0-40)
                    const throughputScore = (results.throughput / maxThroughput) * 40;

                    // 延迟得分 (0-40)，延迟越低越好
                    const minReadLatency = Math.min(...Object.values(this.results.concurrent)
                        .filter(r => !r.error)
                        .map(r => r.readLatency));

                    const minWriteLatency = Math.min(...Object.values(this.results.concurrent)
                        .filter(r => !r.error)
                        .map(r => r.writeLatency));

                    const latencyScore =
                        ((minReadLatency / Math.max(0.1, results.readLatency)) * 20) +
                        ((minWriteLatency / Math.max(0.1, results.writeLatency)) * 20);

                    // 错误率得分 (0-20)，错误越少越好
                    const maxErrors = Math.max(1, ...Object.values(this.results.concurrent)
                        .filter(r => !r.error)
                        .map(r => r.errors));

                    const errorScore = ((maxErrors - results.errors) / maxErrors) * 20;

                    // 总得分
                    scores[name].concurrent = throughputScore + latencyScore + errorScore;
                }
            }
        }

        // 数据倾斜测试得分
        if (this.results.dataSkew) {
            const minInsertTimes = Math.min(...Object.values(this.results.dataSkew)
                .filter(r => !r.error)
                .map(r => r.insertTime));

            const minSearchTimes = Math.min(...Object.values(this.results.dataSkew)
                .filter(r => !r.error)
                .map(r => r.searchTime));

            const minDeleteTimes = Math.min(...Object.values(this.results.dataSkew)
                .filter(r => !r.error)
                .map(r => r.deleteTime));

            for (const [name, results] of Object.entries(this.results.dataSkew)) {
                if (!results.error) {
                    // 插入得分 (0-30)
                    const insertScore = (minInsertTimes / Math.max(0.1, results.insertTime)) * 30;

                    // 查询得分 (0-40)
                    const searchScore = (minSearchTimes / Math.max(0.1, results.searchTime)) * 40;

                    // 删除得分 (0-30)
                    const deleteScore = (minDeleteTimes / Math.max(0.1, results.deleteTime)) * 30;

                    // 总得分
                    scores[name].dataSkew = insertScore + searchScore + deleteScore;
                }
            }
        }

        // 压力测试得分
        if (this.results.stress) {
            for (const [name, results] of Object.entries(this.results.stress)) {
                if (!results.error) {
                    // 计算平均吞吐量
                    const avgThroughput = results.totalOperations / (results.totalTime / 1000);

                    // 计算吞吐量稳定性（标准差）
                    const throughputs = results.checkpoints.map(cp => cp.throughput);
                    const avgThroughputFromCheckpoints = throughputs.reduce((a, b) => a + b, 0) / throughputs.length;
                    const throughputVariance = throughputs.reduce((a, b) => a + Math.pow(b - avgThroughputFromCheckpoints, 2), 0) / throughputs.length;
                    const throughputStdDev = Math.sqrt(throughputVariance);

                    // 计算延迟稳定性
                    const readLatencies = results.checkpoints.map(cp => cp.readLatency);
                    const avgReadLatency = readLatencies.reduce((a, b) => a + b, 0) / readLatencies.length;
                    const readLatencyVariance = readLatencies.reduce((a, b) => a + Math.pow(b - avgReadLatency, 2), 0) / readLatencies.length;
                    const readLatencyStdDev = Math.sqrt(readLatencyVariance);

                    // 归一化得分
                    const maxThroughput = Math.max(...Object.values(this.results.stress)
                        .filter(r => !r.error)
                        .map(r => r.totalOperations / (r.totalTime / 1000)));

                    const minMemory = Math.min(...Object.values(this.results.stress)
                        .filter(r => !r.error)
                        .map(r => r.peakMemory));

                    // 吞吐量得分 (0-30)
                    const throughputScore = (avgThroughput / maxThroughput) * 30;

                    // 稳定性得分 (0-40)，标准差越小越好
                    const maxThroughputStdDev = Math.max(1, ...Object.values(this.results.stress)
                        .filter(r => !r.error)
                        .map(r => {
                            const throughputs = r.checkpoints.map(cp => cp.throughput);
                            const avg = throughputs.reduce((a, b) => a + b, 0) / throughputs.length;
                            const variance = throughputs.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / throughputs.length;
                            return Math.sqrt(variance);
                        }));

                    const maxReadLatencyStdDev = Math.max(1, ...Object.values(this.results.stress)
                        .filter(r => !r.error)
                        .map(r => {
                            const latencies = r.checkpoints.map(cp => cp.readLatency);
                            const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
                            const variance = latencies.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / latencies.length;
                            return Math.sqrt(variance);
                        }));

                    const stabilityScore =
                        ((maxThroughputStdDev - throughputStdDev) / maxThroughputStdDev) * 20 +
                        ((maxReadLatencyStdDev - readLatencyStdDev) / maxReadLatencyStdDev) * 20;

                    // 内存效率得分 (0-30)，内存使用越少越好
                    const memoryScore = (minMemory / Math.max(1, results.peakMemory)) * 30;

                    // 总得分
                    scores[name].stress = throughputScore + stabilityScore + memoryScore;
                }
            }
        }

        // 持久化测试得分
        if (this.results.persistence) {
            const minSerializeTime = Math.min(...Object.values(this.results.persistence)
                .filter(r => !r.error && r.isValid)
                .map(r => r.serializeTime));

            const minDeserializeTime = Math.min(...Object.values(this.results.persistence)
                .filter(r => !r.error && r.isValid)
                .map(r => r.deserializeTime));

            const minFileSize = Math.min(...Object.values(this.results.persistence)
                .filter(r => !r.error && r.isValid)
                .map(r => r.fileSize));

            for (const [name, results] of Object.entries(this.results.persistence)) {
                if (!results.error && results.isValid) {
                    // 序列化性能得分 (0-30)
                    const serializeScore = (minSerializeTime / Math.max(0.1, results.serializeTime)) * 30;

                    // 反序列化性能得分 (0-40)
                    const deserializeScore = (minDeserializeTime / Math.max(0.1, results.deserializeTime)) * 40;

                    // 存储效率得分 (0-30)
                    const sizeScore = (minFileSize / Math.max(1, results.fileSize)) * 30;

                    // 总得分
                    scores[name].persistence = serializeScore + deserializeScore + sizeScore;
                }
            }
        }

        // 计算总分
        for (const name of Object.keys(scores)) {
            scores[name].total =
                scores[name].concurrent * 0.3 +
                scores[name].dataSkew * 0.25 +
                scores[name].stress * 0.25 +
                scores[name].persistence * 0.2;
        }

        // 生成得分表
        report += "### 性能得分（满分100）\n\n";
        report += "| 数据结构 | 并发得分 | 数据倾斜得分 | 压力测试得分 | 持久化得分 | 总分 |\n";
        report += "| --- | --- | --- | --- | --- | --- |\n";

        // 按总分排序
        const sortedNames = Object.keys(scores).sort((a, b) => scores[b].total - scores[a].total);

        for (const name of sortedNames) {
            report += `| ${name} | ${scores[name].concurrent.toFixed(1)} | ${scores[name].dataSkew.toFixed(1)} | ${scores[name].stress.toFixed(1)} | ${scores[name].persistence.toFixed(1)} | ${scores[name].total.toFixed(1)} |\n`;
        }

        report += "\n";

        // 各场景最佳选择
        report += "### 各应用场景最佳选择\n\n";

        // 并发场景
        const bestConcurrent = sortedNames.reduce((best, name) =>
            scores[name].concurrent > scores[best].concurrent ? name : best, sortedNames[0]);

        report += `- **高并发场景**: ${bestConcurrent}\n`;

        // 数据倾斜场景
        const bestSkew = sortedNames.reduce((best, name) =>
            scores[name].dataSkew > scores[best].dataSkew ? name : best, sortedNames[0]);

        report += `- **数据分布不均场景**: ${bestSkew}\n`;

        // 长时间运行场景
        const bestStress = sortedNames.reduce((best, name) =>
            scores[name].stress > scores[best].stress ? name : best, sortedNames[0]);

        report += `- **长时间稳定运行场景**: ${bestStress}\n`;

        // 需要持久化场景
        const bestPersistence = sortedNames.reduce((best, name) =>
            scores[name].persistence > scores[best].persistence ? name : best, sortedNames[0]);

        report += `- **频繁持久化与恢复场景**: ${bestPersistence}\n`;

        // 综合性能最佳
        const bestOverall = sortedNames[0];
        report += `- **综合性能最佳**: ${bestOverall}\n\n`;

        // 红黑树分析
        report += "## 红黑树性能分析\n\n";

        if (scores['RedBlackTree']) {
            // 红黑树与最佳结构的比较
            report += "### 红黑树与性能最佳结构的比较\n\n";
            report += "| 测试场景 | 红黑树性能 | 最佳结构 | 差距 |\n";
            report += "| --- | --- | --- | --- |\n";

            // 并发场景
            const concurrentGap = ((scores[bestConcurrent].concurrent - scores['RedBlackTree'].concurrent) / scores[bestConcurrent].concurrent * 100).toFixed(1);
            report += `| 并发性能 | ${scores['RedBlackTree'].concurrent.toFixed(1)} | ${bestConcurrent} (${scores[bestConcurrent].concurrent.toFixed(1)}) | ${concurrentGap}% |\n`;

            // 数据倾斜场景
            const skewGap = ((scores[bestSkew].dataSkew - scores['RedBlackTree'].dataSkew) / scores[bestSkew].dataSkew * 100).toFixed(1);
            report += `| 数据倾斜处理 | ${scores['RedBlackTree'].dataSkew.toFixed(1)} | ${bestSkew} (${scores[bestSkew].dataSkew.toFixed(1)}) | ${skewGap}% |\n`;

            // 长时间运行场景
            const stressGap = ((scores[bestStress].stress - scores['RedBlackTree'].stress) / scores[bestStress].stress * 100).toFixed(1);
            report += `| 长时间稳定性 | ${scores['RedBlackTree'].stress.toFixed(1)} | ${bestStress} (${scores[bestStress].stress.toFixed(1)}) | ${stressGap}% |\n`;

            // 持久化场景
            const persistenceGap = ((scores[bestPersistence].persistence - scores['RedBlackTree'].persistence) / scores[bestPersistence].persistence * 100).toFixed(1);
            report += `| 持久化性能 | ${scores['RedBlackTree'].persistence.toFixed(1)} | ${bestPersistence} (${scores[bestPersistence].persistence.toFixed(1)}) | ${persistenceGap}% |\n`;

            // 总分
            const totalGap = ((scores[bestOverall].total - scores['RedBlackTree'].total) / scores[bestOverall].total * 100).toFixed(1);
            report += `| 总分 | ${scores['RedBlackTree'].total.toFixed(1)} | ${bestOverall} (${scores[bestOverall].total.toFixed(1)}) | ${totalGap}% |\n\n`;

            // 红黑树特长与不足
            report += "### 红黑树特长与不足\n\n";

            // 找出红黑树的强项
            const strengths = [];
            const weaknesses = [];

            // 检查并发性能
            if (scores['RedBlackTree'].concurrent >= scores[bestConcurrent].concurrent * 0.9) {
                strengths.push("并发环境性能优秀，接近最佳结构");
            } else if (scores['RedBlackTree'].concurrent <= scores[bestConcurrent].concurrent * 0.7) {
                weaknesses.push("在高并发环境下性能较弱");
            }

            // 检查数据倾斜处理
            if (scores['RedBlackTree'].dataSkew >= scores[bestSkew].dataSkew * 0.9) {
                strengths.push("处理不均匀数据分布的能力强");
            } else if (scores['RedBlackTree'].dataSkew <= scores[bestSkew].dataSkew * 0.7) {
                weaknesses.push("处理高度倾斜数据的效率不高");
            }

            // 检查长时间稳定性
            if (scores['RedBlackTree'].stress >= scores[bestStress].stress * 0.9) {
                strengths.push("长时间运行稳定性好");
            } else if (scores['RedBlackTree'].stress <= scores[bestStress].stress * 0.7) {
                weaknesses.push("长时间运行可能出现性能下降");
            }

            // 检查持久化性能
            if (scores['RedBlackTree'].persistence >= scores[bestPersistence].persistence * 0.9) {
                strengths.push("序列化和反序列化性能良好");
            } else if (scores['RedBlackTree'].persistence <= scores[bestPersistence].persistence * 0.7) {
                weaknesses.push("持久化与恢复效率不佳");
            }

            // 综合分析
            if (scores['RedBlackTree'].total >= scores[bestOverall].total * 0.9) {
                strengths.push("综合性能极佳，几乎达到最佳水平");
            } else if (scores['RedBlackTree'].total >= scores[bestOverall].total * 0.8) {
                strengths.push("综合性能表现良好");
            }

            // 输出强项
            report += "#### 优势\n\n";
            if (strengths.length > 0) {
                for (const strength of strengths) {
                    report += `- ${strength}\n`;
                }
            } else {
                report += "- 相对于测试的其他数据结构没有明显优势\n";
            }
            report += "\n";

            // 输出弱项
            report += "#### 不足\n\n";
            if (weaknesses.length > 0) {
                for (const weakness of weaknesses) {
                    report += `- ${weakness}\n`;
                }
            } else {
                report += "- 没有明显的性能短板\n";
            }
            report += "\n";

            // 红黑树应用场景建议
            report += "### 红黑树适用场景分析\n\n";

            if (scores['RedBlackTree'].total >= scores[bestOverall].total * 0.85) {
                report += "红黑树是一种通用性极强的数据结构，在大多数场景下都能提供不错的性能。根据测试结果，建议在以下场景中优先考虑使用红黑树：\n\n";
            } else {
                report += "红黑树是一种平衡的折中方案，在特定场景下能发挥良好性能。根据测试结果，建议在以下场景中考虑使用红黑树：\n\n";
            }

            // 基于测试结果提供建议
            if (scores['RedBlackTree'].concurrent >= scores[bestConcurrent].concurrent * 0.8) {
                report += "- **中等并发环境**：在多线程访问但并发度不是极高的环境下\n";
            }

            if (scores['RedBlackTree'].dataSkew >= scores[bestSkew].dataSkew * 0.8) {
                report += "- **数据分布多变的场景**：当数据分布特性不确定或经常变化时\n";
            }

            if (scores['RedBlackTree'].stress >= scores[bestStress].stress * 0.8) {
                report += "- **需要长时间稳定运行的系统**：作为需要长期运行且性能稳定的服务组件\n";
            }

            if (scores['RedBlackTree'].persistence >= scores[bestPersistence].persistence * 0.8) {
                report += "- **需要定期持久化的应用**：当系统需要定期保存和恢复状态时\n";
            }

            report += "\n当需要在不同场景间平衡，且对实现复杂度有一定接受度时，红黑树通常是一个不错的选择。\n\n";

            if (bestOverall !== 'RedBlackTree') {
                report += `不过，如果应用场景明确，且对性能要求极高，可以考虑使用针对该场景优化的特定数据结构（如${bestOverall}）。\n\n`;
            }
        } else {
            report += "红黑树数据缺失或测试失败，无法进行分析。\n\n";
        }

        report += "## 总结与建议\n\n";

        // 综合总结
        report += "### 综合性能总结\n\n";

        // 按总分排序输出总结
        for (let i = 0; i < Math.min(3, sortedNames.length); i++) {
            const name = sortedNames[i];
            report += `${i + 1}. **${name}** (${scores[name].total.toFixed(1)}分): `;

            // 找出该结构的最强项
            const bestCategory = ['concurrent', 'dataSkew', 'stress', 'persistence'].reduce((best, category) =>
                scores[name][category] > scores[name][best] ? category : best, 'concurrent');

            // 根据最强项描述
            switch (bestCategory) {
                case 'concurrent':
                    report += `并发性能尤为突出，在多线程环境中表现最佳`;
                    break;
                case 'dataSkew':
                    report += `处理不均匀数据分布的能力极强，适合实际应用中的倾斜数据`;
                    break;
                case 'stress':
                    report += `长时间运行稳定可靠，适合作为持久服务的基础组件`;
                    break;
                case 'persistence':
                    report += `序列化和恢复性能出色，适合需要频繁持久化的场景`;
                    break;
            }
            report += "。\n";
        }

        report += "\n";

        // 根据应用场景的选择建议
        report += "### 根据应用场景选择数据结构的建议\n\n";

        report += "在选择适合的数据结构时，应该根据应用场景的特性和需求做出权衡：\n\n";
        report += "1. **需要严格的O(log n)操作保证**: 选择红黑树或AVL树等自平衡树结构\n";
        report += "2. **读操作远多于写操作**: 考虑使用AVL树或B+树，它们在查询性能上通常更优\n";
        report += "3. **写操作频繁**: 跳表和红黑树通常提供更高效的插入和删除操作\n";
        report += "4. **范围查询频繁**: B+树和跳表在范围操作上表现更佳\n";
        report += "5. **内存受限环境**: 考虑使用内存效率更高的结构，如红黑树或精简实现的哈希表\n";
        report += "6. **高并发环境**: 选择支持细粒度锁或无锁实现的数据结构，如ConcurrentSkipListMap\n";
        report += "7. **需要持久化**: 考虑序列化友好的结构，如B+树或适合外存的数据结构\n\n";

        report += "最后，要根据实际应用的混合负载特性，选择整体性能匹配度最高的数据结构，而不仅仅关注单一操作的性能。\n";

        return report;
    }
}

/**
 * 工作线程代码
 * 需要保存为worker.js文件，与主文件位于同一目录
 */
/*
// worker.js

*/