// visualization.js - 性能测试结果可视化

const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js');

/**
 * 数据结构性能可视化工具类
 */
class PerformanceVisualizer {
    constructor(results, outputDir = './charts') {
        this.results = results;
        this.outputDir = outputDir;

        // 为每个数据结构分配固定颜色
        this.colors = {
            'RedBlackTree': '#FF0000',
            'AVLTree': '#00AA00',
            'BTree': '#0000FF',
            'BPlusTree': '#9932CC',
            'SkipList': '#FF8C00',
            'HashTable': '#4682B4',
            'BinarySearchTree': '#2F4F4F',
            'LinearArray': '#696969'
        };

        // 创建输出目录
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    /**
     * 创建CRUD操作性能对比图表
     */
    createCrudCharts() {
        if (!this.results.crud) {
            console.error('CRUD测试结果不存在');
            return;
        }

        console.log('正在生成CRUD操作性能图表...');

        // 为每种操作创建一个图表
        for (const operation of ['insert', 'search', 'delete', 'range']) {
            this._createOperationChart(operation);
        }

        // 创建数据量影响比较图
        this._createDataSizeImpactChart();

        console.log(`CRUD操作图表已保存到 ${this.outputDir} 目录`);
    }

    /**
     * 创建单个操作的性能对比图表
     */
    _createOperationChart(operation) {
        // 获取所有数据大小
        const testSizes = [];
        for (const [, results] of Object.entries(this.results.crud)) {
            for (const result of results[operation]) {
                if (!testSizes.includes(result.size)) {
                    testSizes.push(result.size);
                }
            }
        }
        testSizes.sort((a, b) => a - b);

        // 创建图表数据
        const labels = testSizes.map(size => size.toString());
        const datasets = [];

        for (const [name, results] of Object.entries(this.results.crud)) {
            const data = [];

            // 确保每个数据结构都有所有大小的数据点
            for (const size of testSizes) {
                const result = results[operation].find(r => r.size === size);
                data.push(result ? result.time : null);
            }

            datasets.push({
                label: name,
                data: data,
                borderColor: this.colors[name] || '#000000',
                backgroundColor: this._hexToRgba(this.colors[name] || '#000000', 0.2),
                borderWidth: 2,
                fill: false,
                tension: 0.1
            });
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: `${this._capitalizeFirstLetter(operation)} Operation Performance`
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Data Size'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/${operation}_performance.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存 ${operation} 操作图表到 ${filePath}`));
    }

    /**
     * 创建数据量影响比较图
     */
    _createDataSizeImpactChart() {
        const operationColors = {
            'insert': '#FF0000',
            'search': '#00AA00',
            'delete': '#0000FF',
            'range': '#FF8C00'
        };

        // 为每个数据结构创建一个图表
        for (const [name, results] of Object.entries(this.results.crud)) {
            // 获取所有数据大小
            const testSizes = [];
            for (const operation of ['insert', 'search', 'delete', 'range']) {
                for (const result of results[operation]) {
                    if (!testSizes.includes(result.size)) {
                        testSizes.push(result.size);
                    }
                }
            }
            testSizes.sort((a, b) => a - b);

            // 创建图表数据
            const labels = testSizes.map(size => size.toString());
            const datasets = [];

            for (const operation of ['insert', 'search', 'delete', 'range']) {
                const data = [];

                // 确保每个操作都有所有大小的数据点
                for (const size of testSizes) {
                    const result = results[operation].find(r => r.size === size);
                    data.push(result ? result.time : null);
                }

                datasets.push({
                    label: this._capitalizeFirstLetter(operation),
                    data: data,
                    borderColor: operationColors[operation] || '#000000',
                    backgroundColor: this._hexToRgba(operationColors[operation] || '#000000', 0.2),
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                });
            }

            // 创建画布
            const width = 800;
            const height = 600;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // 创建图表
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: false,
                    title: {
                        display: true,
                        text: `${name} Operations Scaling`
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Data Size'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });

            // 保存图表
            const filePath = `${this.outputDir}/${name}_scaling.png`;
            const out = fs.createWriteStream(filePath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            out.on('finish', () => console.log(`已保存 ${name} 缩放性能图表到 ${filePath}`));
        }
    }

    /**
     * 创建混合负载测试性能对比图表
     */
    createMixedLoadCharts() {
        if (!this.results.mixedLoad) {
            console.error('混合负载测试结果不存在');
            return;
        }

        console.log('正在生成混合负载测试图表...');

        // 创建吞吐量对比图
        this._createThroughputChart();

        // 创建延迟对比图
        this._createLatencyChart();

        console.log(`混合负载测试图表已保存到 ${this.outputDir} 目录`);
    }

    /**
     * 创建吞吐量对比图
     */
    _createThroughputChart() {
        const dataStructureNames = Object.keys(this.results.mixedLoad);
        const throughputData = [];

        for (const name of dataStructureNames) {
            throughputData.push(this.results.mixedLoad[name].throughput);
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 为每个数据结构获取颜色
        const backgroundColors = dataStructureNames.map(name => this._hexToRgba(this.colors[name] || '#000000', 0.7));
        const borderColors = dataStructureNames.map(name => this.colors[name] || '#000000');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataStructureNames,
                datasets: [{
                    label: 'Throughput (ops/s)',
                    data: throughputData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Mixed Load Throughput Comparison'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Operations per Second'
                        }
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/throughput_comparison.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存吞吐量对比图表到 ${filePath}`));
    }

    /**
     * 创建延迟对比图
     */
    _createLatencyChart() {
        const dataStructureNames = Object.keys(this.results.mixedLoad);
        const readLatencyData = [];
        const writeLatencyData = [];

        for (const name of dataStructureNames) {
            readLatencyData.push(this.results.mixedLoad[name].readLatency);
            writeLatencyData.push(this.results.mixedLoad[name].writeLatency);
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataStructureNames,
                datasets: [
                    {
                        label: 'Read Latency (ms)',
                        data: readLatencyData,
                        backgroundColor: this._hexToRgba('#00AA00', 0.7),
                        borderColor: '#00AA00',
                        borderWidth: 1
                    },
                    {
                        label: 'Write Latency (ms)',
                        data: writeLatencyData,
                        backgroundColor: this._hexToRgba('#FF0000', 0.7),
                        borderColor: '#FF0000',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Operation Latency Comparison'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Latency (ms)'
                        }
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/latency_comparison.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存延迟对比图表到 ${filePath}`));
    }

    /**
     * 创建范围查询测试对比图表
     */
    createRangeQueryCharts() {
        if (!this.results.rangeQuery) {
            console.error('范围查询测试结果不存在');
            return;
        }

        console.log('正在生成范围查询测试图表...');

        // 获取所有测试的范围大小
        const rangeFractions = [];
        for (const [, results] of Object.entries(this.results.rangeQuery)) {
            for (const range of results.ranges) {
                if (!rangeFractions.includes(range.rangeFraction)) {
                    rangeFractions.push(range.rangeFraction);
                }
            }
        }
        rangeFractions.sort((a, b) => a - b);

        // 创建范围查询性能对比图
        this._createRangeQueryPerformanceChart(rangeFractions);

        console.log(`范围查询测试图表已保存到 ${this.outputDir} 目录`);
    }

    /**
     * 创建范围查询性能对比图
     */
    _createRangeQueryPerformanceChart(rangeFractions) {
        const dataStructureNames = Object.keys(this.results.rangeQuery);
        const datasets = [];

        for (const name of dataStructureNames) {
            const data = [];

            // 确保每个数据结构都有所有范围大小的数据点
            for (const fraction of rangeFractions) {
                const range = this.results.rangeQuery[name].ranges.find(r => r.rangeFraction === fraction);
                data.push(range ? range.time : null);
            }

            datasets.push({
                label: name,
                data: data,
                borderColor: this.colors[name] || '#000000',
                backgroundColor: this._hexToRgba(this.colors[name] || '#000000', 0.2),
                borderWidth: 2,
                fill: false,
                tension: 0.1
            });
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 格式化范围标签
        const labels = rangeFractions.map(fraction => `${(fraction * 100).toFixed(1)}%`);

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Range Query Performance'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Range Size (% of Data)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/range_query_performance.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存范围查询性能图表到 ${filePath}`));
    }

    /**
     * 创建访问模式测试对比图表
     */
    createAccessPatternCharts() {
        if (!this.results.accessPattern) {
            console.error('访问模式测试结果不存在');
            return;
        }

        console.log('正在生成访问模式测试图表...');

        // 创建访问模式性能对比图
        this._createAccessPatternComparisonChart();

        console.log(`访问模式测试图表已保存到 ${this.outputDir} 目录`);
    }

    /**
     * 创建访问模式性能对比图
     */
    _createAccessPatternComparisonChart() {
        const dataStructureNames = Object.keys(this.results.accessPattern);
        const sequentialData = [];
        const randomData = [];
        const zipfData = [];

        for (const name of dataStructureNames) {
            sequentialData.push(this.results.accessPattern[name].sequential);
            randomData.push(this.results.accessPattern[name].random);
            zipfData.push(this.results.accessPattern[name].zipf);
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataStructureNames,
                datasets: [
                    {
                        label: 'Sequential Access',
                        data: sequentialData,
                        backgroundColor: this._hexToRgba('#4169E1', 0.7),
                        borderColor: '#4169E1',
                        borderWidth: 1
                    },
                    {
                        label: 'Random Access',
                        data: randomData,
                        backgroundColor: this._hexToRgba('#FF8C00', 0.7),
                        borderColor: '#FF8C00',
                        borderWidth: 1
                    },
                    {
                        label: 'Zipf (Hot Spot) Access',
                        data: zipfData,
                        backgroundColor: this._hexToRgba('#9932CC', 0.7),
                        borderColor: '#9932CC',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Access Pattern Performance'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (ms)'
                        }
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/access_pattern_comparison.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存访问模式性能图表到 ${filePath}`));
    }

    /**
     * 创建内存使用对比图表
     */
    createMemoryUsageCharts() {
        if (!this.results.memory) {
            console.error('内存使用测试结果不存在');
            return;
        }

        console.log('正在生成内存使用测试图表...');

        // 创建总内存使用对比图
        this._createTotalMemoryChart();

        // 创建每节点内存使用对比图
        this._createPerNodeMemoryChart();

        console.log(`内存使用测试图表已保存到 ${this.outputDir} 目录`);
    }

    /**
     * 创建总内存使用对比图
     */
    _createTotalMemoryChart() {
        const dataStructureNames = Object.keys(this.results.memory);
        const totalMemoryData = [];

        for (const name of dataStructureNames) {
            totalMemoryData.push(this.results.memory[name].totalMemory);
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 为每个数据结构获取颜色
        const backgroundColors = dataStructureNames.map(name => this._hexToRgba(this.colors[name] || '#000000', 0.7));
        const borderColors = dataStructureNames.map(name => this.colors[name] || '#000000');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataStructureNames,
                datasets: [{
                    label: 'Total Memory Usage (bytes)',
                    data: totalMemoryData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Total Memory Usage Comparison'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (bytes)'
                        }
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/total_memory_usage.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存总内存使用图表到 ${filePath}`));
    }

    /**
     * 创建每节点内存使用对比图
     */
    _createPerNodeMemoryChart() {
        const dataStructureNames = Object.keys(this.results.memory);
        const perNodeMemoryData = [];

        for (const name of dataStructureNames) {
            perNodeMemoryData.push(this.results.memory[name].perNodeMemory);
        }

        // 创建画布
        const width = 800;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 为每个数据结构获取颜色
        const backgroundColors = dataStructureNames.map(name => this._hexToRgba(this.colors[name] || '#000000', 0.7));
        const borderColors = dataStructureNames.map(name => this.colors[name] || '#000000');

        // 创建图表
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataStructureNames,
                datasets: [{
                    label: 'Per Node Memory Usage (bytes)',
                    data: perNodeMemoryData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: 'Per Node Memory Usage Comparison'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (bytes)'
                        }
                    }
                }
            }
        });

        // 保存图表
        const filePath = `${this.outputDir}/per_node_memory_usage.png`;
        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log(`已保存每节点内存使用图表到 ${filePath}`));
    }

    /**
     * 创建所有图表
     */
    createAllCharts() {
        this.createCrudCharts();
        this.createMixedLoadCharts();
        this.createRangeQueryCharts();
        this.createAccessPatternCharts();
        this.createMemoryUsageCharts();

        console.log('所有图表已生成完毕');
    }

    /**
     * 将颜色从十六进制转换为带透明度的rgba格式
     */
    _hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * 首字母大写
     */
    _capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

module.exports = PerformanceVisualizer;

// 使用示例:
/*
const { runTests } = require('./data_structures');
const PerformanceVisualizer = require('./visualization');

async function runTestsAndVisualize() {
  // 运行测试
  const results = await runTests();

  // 创建可视化工具
  const visualizer = new PerformanceVisualizer(results);

  // 生成所有图表
  visualizer.createAllCharts();
}

runTestsAndVisualize().catch(console.error);
*/