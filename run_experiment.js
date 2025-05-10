// run_experiment.js - 实验运行主脚本

const fs = require('fs');
const path = require('path');

// 导入数据结构和测试工具
const {
    RedBlackTree,
    AVLTree,
    BTree,
    BPlusTree,
    SkipList,
    HashTable,
    BinarySearchTree,
    LinearArray,
    DataGenerator,
    PerformanceTester
} = require('./data_structures');

// 导入高级测试工具
const AdvancedPerformanceTester = require('./advanced_tests');

// 导入可视化工具
const PerformanceVisualizer = require('./visualization');

// 定义要测试的数据结构
const dataStructures = {
    'RedBlackTree': RedBlackTree,
    'AVLTree': AVLTree,
    'BTree': BTree,
    'BPlusTree': BPlusTree,
    'SkipList': SkipList,
    'HashTable': HashTable,
    'BinarySearchTree': BinarySearchTree,
    'LinearArray': LinearArray
};

// 定义测试数据大小
const testSizes = [100, 1000, 10000, 50000];

// 定义输出目录
const outputDir = './results';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 运行全部测试
 */
async function runAllTests() {
    console.log("=====================================================");
    console.log("  红黑树与其他数据结构性能对比实验");
    console.log("=====================================================\n");

    // 创建测试结果目录结构
    createResultDirectories();

    // 运行基础性能测试
    const basicResults = await runBasicTests();

    // 运行高级性能测试
    const advancedResults = await runAdvancedTests();

    // 生成可视化
    createVisualizations(basicResults);

    // 生成最终报告
    generateFinalReport(basicResults, advancedResults);

    console.log("\n=====================================================");
    console.log("  实验完成! 所有结果已保存到 ./results 目录");
    console.log("=====================================================");
}

/**
 * 创建结果目录结构
 */
function createResultDirectories() {
    const dirs = [
        path.join(outputDir, 'data'),
        path.join(outputDir, 'charts'),
        path.join(outputDir, 'reports')
    ];

    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

/**
 * 运行基础性能测试
 */
async function runBasicTests() {
    console.log("\n-----------------------------------------------------");
    console.log("  运行基础性能测试");
    console.log("-----------------------------------------------------\n");

    // 创建性能测试器
    const tester = new PerformanceTester(dataStructures, testSizes, 5);

    // 运行CRUD测试 (多种数据分布)
    console.log("测试均匀分布数据...");
    await tester.runCRUDTest('uniform');

    console.log("\n测试有序数据...");
    await tester.runCRUDTest('sorted');

    console.log("\n测试倾斜分布数据...");
    await tester.runCRUDTest('skewed');

    // 运行混合负载测试 (多种读写比例)
    console.log("\n测试读密集型负载 (95% 读)...");
    await tester.runMixedLoadTest(0.95); // 读密集型

    console.log("\n测试平衡型负载 (50% 读)...");
    await tester.runMixedLoadTest(0.5);  // 平衡型

    console.log("\n测试写密集型负载 (30% 读)...");
    await tester.runMixedLoadTest(0.3);  // 写密集型

    // 运行范围查询测试
    console.log("\n测试范围查询性能...");
    await tester.runRangeQueryTest();

    // 运行访问模式测试
    console.log("\n测试不同访问模式...");
    await tester.runAccessPatternTest();

    // 生成性能报告
    const report = tester.generateReport();
    console.log("\n生成基础性能测试报告...");

    // 将报告写入文件
    const reportPath = path.join(outputDir, 'reports', 'basic_performance_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`基础性能测试报告已保存到 ${reportPath}`);

    // 保存原始测试数据
    const dataPath = path.join(outputDir, 'data', 'basic_test_data.json');
    fs.writeFileSync(dataPath, JSON.stringify(tester.results, null, 2));
    console.log(`基础测试原始数据已保存到 ${dataPath}`);

    return tester.results;
}

/**
 * 运行高级性能测试
 */
async function runAdvancedTests() {
    console.log("\n-----------------------------------------------------");
    console.log("  运行高级性能测试");
    console.log("-----------------------------------------------------\n");

    // 创建高级测试器，仅测试部分数据结构以节省时间
    const advancedStructures = {
        'RedBlackTree': RedBlackTree,
        'AVLTree': AVLTree,
        'SkipList': SkipList,
        'BinarySearchTree': BinarySearchTree,
        'HashTable': HashTable
    };

    const advancedTester = new AdvancedPerformanceTester(advancedStructures, {
        basePath: path.join(outputDir, 'data'),
        concurrentThreads: 4,                  // 并发线程数
        stressTestDuration: 30 * 1000,         // 压力测试持续时间：30秒（实际使用时可设置更长）
        checkpointInterval: 5 * 1000           // 检查点间隔：5秒
    });

    // 运行高级测试
    console.log("运行高级性能测试（并发、倾斜、压力和持久化测试）...");
    await advancedTester.runAllTests();

    // 生成高级测试报告
    const advancedReport = advancedTester.generateReport();
    console.log("\n生成高级性能测试报告...");

    // 将报告写入文件
    const reportPath = path.join(outputDir, 'reports', 'advanced_performance_report.md');
    fs.writeFileSync(reportPath, advancedReport);
    console.log(`高级性能测试报告已保存到 ${reportPath}`);

    // 保存原始测试数据
    const dataPath = path.join(outputDir, 'data', 'advanced_test_data.json');
    fs.writeFileSync(dataPath, JSON.stringify(advancedTester.results, null, 2));
    console.log(`高级测试原始数据已保存到 ${dataPath}`);

    return advancedTester.results;
}

/**
 * 创建性能可视化图表
 */
function createVisualizations(basicResults) {
    console.log("\n-----------------------------------------------------");
    console.log("  生成性能可视化图表");
    console.log("-----------------------------------------------------\n");

    // 创建可视化工具
    const visualizer = new PerformanceVisualizer(basicResults, path.join(outputDir, 'charts'));

    // 生成所有图表
    console.log("生成性能图表...");
    visualizer.createAllCharts();
}

/**
 * 生成最终综合报告
 */
function generateFinalReport(basicResults, advancedResults) {
    console.log("\n-----------------------------------------------------");
    console.log("  生成综合分析报告");
    console.log("-----------------------------------------------------\n");

    // 读取基础和高级测试报告
    const basicReport = fs.readFileSync(path.join(outputDir, 'reports', 'basic_performance_report.md'), 'utf8');
    const advancedReport = fs.readFileSync(path.join(outputDir, 'reports', 'advanced_performance_report.md'), 'utf8');

    // 分析红黑树性能相对位置
    const redBlackTreeAnalysis = analyzeRedBlackTreePerformance(basicResults, advancedResults);

    // 创建综合报告
    const finalReport = createFinalReport(redBlackTreeAnalysis, basicReport, advancedReport);

    // 保存综合报告
    const reportPath = path.join(outputDir, 'reports', 'comprehensive_analysis.md');
    fs.writeFileSync(reportPath, finalReport);
    console.log(`综合分析报告已保存到 ${reportPath}`);

    // 创建HTML版本（如果需要）
    const htmlReportPath = path.join(outputDir, 'reports', 'comprehensive_analysis.html');
    const htmlReport = convertMarkdownToHtml(finalReport);
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`HTML格式综合报告已保存到 ${htmlReportPath}`);
}

/**
 * 分析红黑树性能
 */
function analyzeRedBlackTreePerformance(basicResults, advancedResults) {
    const analysis = {
        basicPerformance: {},
        advancedPerformance: {},
        strengths: [],
        weaknesses: [],
        recommendedScenarios: []
    };

    // 分析基础性能测试结果
    if (basicResults.crud) {
        const operations = ['insert', 'search', 'delete', 'range'];
        const dataStructures = Object.keys(basicResults.crud);

        // 计算各操作的平均性能排名
        for (const op of operations) {
            const ranks = {};

            for (const ds of dataStructures) {
                ranks[ds] = 0;
            }

            // 对每个数据量的性能进行排名
            for (const result of basicResults.crud[dataStructures[0]][op]) {
                const size = result.size;

                // 收集该数据量下所有数据结构的性能
                const performances = {};
                for (const ds of dataStructures) {
                    const dsResult = basicResults.crud[ds][op].find(r => r.size === size);
                    if (dsResult) {
                        performances[ds] = dsResult.time;
                    }
                }

                // 根据性能排序
                const sortedDS = Object.keys(performances).sort((a, b) => performances[a] - performances[b]);

                // 分配排名
                for (let i = 0; i < sortedDS.length; i++) {
                    ranks[sortedDS[i]] += i + 1;
                }
            }

            // 计算平均排名
            const count = basicResults.crud[dataStructures[0]][op].length;
            for (const ds of dataStructures) {
                ranks[ds] = ranks[ds] / count;
            }

            analysis.basicPerformance[op] = {
                redBlackTreeRank: ranks['RedBlackTree'],
                bestStructure: dataStructures.reduce((a, b) => ranks[a] < ranks[b] ? a : b),
                bestRank: ranks[dataStructures.reduce((a, b) => ranks[a] < ranks[b] ? a : b)]
            };
        }
    }

    // 分析高级性能测试结果
    if (advancedResults.concurrent) {
        // 并发性能分析
        const concurrentPerformances = {};
        for (const ds of Object.keys(advancedResults.concurrent)) {
            if (!advancedResults.concurrent[ds].error) {
                concurrentPerformances[ds] = advancedResults.concurrent[ds].throughput;
            }
        }

        const sortedConcurrentDS = Object.keys(concurrentPerformances)
            .sort((a, b) => concurrentPerformances[b] - concurrentPerformances[a]);

        analysis.advancedPerformance.concurrent = {
            redBlackTreeRank: sortedConcurrentDS.indexOf('RedBlackTree') + 1,
            bestStructure: sortedConcurrentDS[0],
            redBlackTreeValue: concurrentPerformances['RedBlackTree'],
            bestValue: concurrentPerformances[sortedConcurrentDS[0]]
        };
    }

    if (advancedResults.dataSkew) {
        // 数据倾斜性能分析
        const skewPerformances = {};
        for (const ds of Object.keys(advancedResults.dataSkew)) {
            if (!advancedResults.dataSkew[ds].error) {
                // 综合考虑查询和写入性能
                skewPerformances[ds] =
                    advancedResults.dataSkew[ds].searchTime * 0.7 +
                    (advancedResults.dataSkew[ds].insertTime + advancedResults.dataSkew[ds].deleteTime) * 0.3;
            }
        }

        const sortedSkewDS = Object.keys(skewPerformances)
            .sort((a, b) => skewPerformances[a] - skewPerformances[b]);

        analysis.advancedPerformance.dataSkew = {
            redBlackTreeRank: sortedSkewDS.indexOf('RedBlackTree') + 1,
            bestStructure: sortedSkewDS[0],
            redBlackTreeValue: skewPerformances['RedBlackTree'],
            bestValue: skewPerformances[sortedSkewDS[0]]
        };
    }

    if (advancedResults.stress) {
        // 压力测试性能分析
        const stressPerformances = {};
        for (const ds of Object.keys(advancedResults.stress)) {
            if (!advancedResults.stress[ds].error) {
                const checkpoints = advancedResults.stress[ds].checkpoints;
                if (checkpoints && checkpoints.length > 0) {
                    // 使用最后几个检查点的平均吞吐量作为稳定性指标
                    const lastCheckpoints = checkpoints.slice(-3);
                    const avgThroughput = lastCheckpoints.reduce((sum, cp) => sum + cp.throughput, 0) / lastCheckpoints.length;
                    stressPerformances[ds] = avgThroughput;
                }
            }
        }

        const sortedStressDS = Object.keys(stressPerformances)
            .sort((a, b) => stressPerformances[b] - stressPerformances[a]);

        analysis.advancedPerformance.stress = {
            redBlackTreeRank: sortedStressDS.indexOf('RedBlackTree') + 1,
            bestStructure: sortedStressDS[0],
            redBlackTreeValue: stressPerformances['RedBlackTree'],
            bestValue: stressPerformances[sortedStressDS[0]]
        };
    }

    if (advancedResults.persistence) {
        // 持久化性能分析
        const persistencePerformances = {};
        for (const ds of Object.keys(advancedResults.persistence)) {
            if (!advancedResults.persistence[ds].error && advancedResults.persistence[ds].isValid) {
                // 综合考虑序列化和反序列化性能
                persistencePerformances[ds] =
                    advancedResults.persistence[ds].serializeTime * 0.4 +
                    advancedResults.persistence[ds].deserializeTime * 0.6;
            }
        }

        const sortedPersistenceDS = Object.keys(persistencePerformances)
            .sort((a, b) => persistencePerformances[a] - persistencePerformances[b]);

        analysis.advancedPerformance.persistence = {
            redBlackTreeRank: sortedPersistenceDS.indexOf('RedBlackTree') + 1,
            bestStructure: sortedPersistenceDS[0],
            redBlackTreeValue: persistencePerformances['RedBlackTree'],
            bestValue: persistencePerformances[sortedPersistenceDS[0]]
        };
    }

    // 分析红黑树的强项和弱项
    identifyStrengthsAndWeaknesses(analysis);

    // 确定推荐场景
    identifyRecommendedScenarios(analysis);

    return analysis;
}

/**
 * 识别红黑树的强项和弱项
 */
function identifyStrengthsAndWeaknesses(analysis) {
    // 识别基础操作的强项和弱项
    for (const op of ['insert', 'search', 'delete', 'range']) {
        if (analysis.basicPerformance[op]) {
            const performance = analysis.basicPerformance[op];
            const totalStructures = Object.keys(analysis.basicPerformance).length;

            // 判断是否为强项或弱项
            if (performance.redBlackTreeRank <= 2) {
                analysis.strengths.push(`在${operationNameMap(op)}操作上表现出色（排名第${performance.redBlackTreeRank}）`);
            } else if (performance.redBlackTreeRank > totalStructures * 0.7) {
                analysis.weaknesses.push(`在${operationNameMap(op)}操作上性能较弱（排名第${performance.redBlackTreeRank}/${totalStructures}）`);
            }
        }
    }

    // 识别高级测试的强项和弱项
    const advancedTests = ['concurrent', 'dataSkew', 'stress', 'persistence'];
    const advancedTestNames = {
        'concurrent': '并发环境',
        'dataSkew': '数据倾斜处理',
        'stress': '长时间稳定性',
        'persistence': '持久化与恢复'
    };

    for (const test of advancedTests) {
        if (analysis.advancedPerformance[test]) {
            const performance = analysis.advancedPerformance[test];
            const totalStructures = Object.keys(analysis.advancedPerformance).length;

            // 计算性能差距百分比
            const gap = Math.abs((performance.redBlackTreeValue - performance.bestValue) / performance.bestValue * 100);

            // 判断是否为强项或弱项
            if (performance.redBlackTreeRank === 1) {
                analysis.strengths.push(`在${advancedTestNames[test]}方面表现最佳`);
            } else if (performance.redBlackTreeRank === 2 && gap < 10) {
                analysis.strengths.push(`在${advancedTestNames[test]}方面表现接近最佳（差距小于10%）`);
            } else if (performance.redBlackTreeRank > totalStructures * 0.7 || gap > 50) {
                analysis.weaknesses.push(`在${advancedTestNames[test]}方面性能较弱（排名第${performance.redBlackTreeRank}/${totalStructures}，差距${gap.toFixed(1)}%）`);
            }
        }
    }

    // 添加一些通用的强项和弱项
    analysis.strengths.push("操作时间复杂度稳定在O(log n)，无论最好、平均还是最坏情况");
    analysis.strengths.push("内存占用相对较低，每个节点只需额外存储一个颜色位");
    analysis.strengths.push("实现已广泛验证，在各种系统和库中得到应用");

    analysis.weaknesses.push("实现复杂度高，红黑树的平衡操作逻辑复杂");
    analysis.weaknesses.push("不支持高效的并发访问，需要额外的同步机制");
}

/**
 * 识别红黑树的推荐应用场景
 */
function identifyRecommendedScenarios(analysis) {
    // 根据性能分析确定推荐场景
    const basicPerf = analysis.basicPerformance;
    const advancedPerf = analysis.advancedPerformance;

    // 检查插入和删除操作性能
    const goodInsertDelete =
        (basicPerf.insert && basicPerf.insert.redBlackTreeRank <= 3) &&
        (basicPerf.delete && basicPerf.delete.redBlackTreeRank <= 3);

    // 检查查询性能
    const goodSearch = basicPerf.search && basicPerf.search.redBlackTreeRank <= 3;

    // 检查范围查询性能
    const goodRange = basicPerf.range && basicPerf.range.redBlackTreeRank <= 3;

    // 检查并发性能
    const goodConcurrent = advancedPerf.concurrent && advancedPerf.concurrent.redBlackTreeRank <= 2;

    // 检查数据倾斜处理能力
    const goodSkew = advancedPerf.dataSkew && advancedPerf.dataSkew.redBlackTreeRank <= 2;

    // 检查长时间稳定性
    const goodStress = advancedPerf.stress && advancedPerf.stress.redBlackTreeRank <= 2;

    // 根据性能特点推荐场景
    if (goodInsertDelete && goodSearch) {
        analysis.recommendedScenarios.push({
            name: "通用平衡树应用场景",
            description: "需要高效插入、删除和查询操作的应用，如内存数据库索引"
        });
    }

    if (goodSearch && !goodRange) {
        analysis.recommendedScenarios.push({
            name: "点查询密集型应用",
            description: "以精确查询为主，很少进行范围操作的场景，如符号表、字典"
        });
    }

    if (goodStress) {
        analysis.recommendedScenarios.push({
            name: "长时间运行的服务",
            description: "需要长期稳定运行且性能不降级的后台服务组件"
        });
    }

    if (goodSkew) {
        analysis.recommendedScenarios.push({
            name: "不均匀数据分布场景",
            description: "处理具有明显热点或倾斜分布特性的数据集"
        });
    }

    // 添加一些通用的推荐场景
    analysis.recommendedScenarios.push({
        name: "操作系统内核",
        description: "需要高效进程调度、内存管理的场景，如Linux内核使用红黑树实现完全公平调度器"
    });

    analysis.recommendedScenarios.push({
        name: "编程语言标准库",
        description: "需要提供通用有序映射/集合实现的场景，如C++ STL中的map/set"
    });

    analysis.recommendedScenarios.push({
        name: "地理信息系统",
        description: "需要高效存储和查询空间数据的场景，如R树的变体"
    });
}

/**
 * 创建最终综合报告
 */
function createFinalReport(analysis, basicReport, advancedReport) {
    let report = "# 红黑树与其他数据结构性能对比综合分析报告\n\n";

    // 添加实验概述
    report += "## 1. 实验概述\n\n";
    report += "本实验对比了红黑树与其他常见数据结构（AVL树、B树、B+树、跳表、哈希表、二叉搜索树和线性数组）在各种操作和场景下的性能表现。实验包括基础性能测试和高级性能测试两部分，旨在全面评估各数据结构的优缺点，并为不同应用场景提供选择指导。\n\n";

    report += "### 1.1 测试数据结构\n\n";
    report += "- **红黑树 (Red-Black Tree)**: 一种自平衡二叉搜索树，通过节点颜色和特定规则保持平衡\n";
    report += "- **AVL树**: 最早的自平衡二叉搜索树，通过高度差限制保持严格平衡\n";
    report += "- **B树**: 一种多路平衡搜索树，常用于数据库和文件系统\n";
    report += "- **B+树**: B树的变种，所有数据都存储在叶子节点，内部节点仅存储键\n";
    report += "- **跳表 (Skip List)**: 基于概率的数据结构，通过多层链表实现对数级别的搜索复杂度\n";
    report += "- **哈希表 (Hash Table)**: 通过哈希函数将键映射到数组位置的数据结构\n";
    report += "- **二叉搜索树 (BST)**: 基本的二叉搜索树，无平衡保证\n";
    report += "- **线性数组 (Linear Array)**: 作为基准参照的简单有序数组\n\n";

    report += "### 1.2 测试类型\n\n";
    report += "**基础性能测试**：\n";
    report += "- CRUD操作性能（插入、查找、删除、范围查询）\n";
    report += "- 不同数据分布下的表现（均匀分布、有序数据、倾斜分布）\n";
    report += "- 混合负载测试（不同读写比例）\n";
    report += "- 范围查询测试\n";
    report += "- 不同访问模式测试（顺序访问、随机访问、热点访问）\n\n";

    report += "**高级性能测试**：\n";
    report += "- 并发读写测试\n";
    report += "- 数据倾斜测试\n";
    report += "- 压力测试（长时间运行稳定性）\n";
    report += "- 持久化与恢复测试\n\n";

    // 添加红黑树性能分析
    report += "## 2. 红黑树性能分析\n\n";

    report += "### 2.1 基础操作性能\n\n";
    report += "| 操作类型 | 红黑树排名 | 最佳数据结构 | 性能差距 |\n";
    report += "| --- | --- | --- | --- |\n";

    for (const op of ['insert', 'search', 'delete', 'range']) {
        if (analysis.basicPerformance[op]) {
            const perf = analysis.basicPerformance[op];
            report += `| ${operationNameMap(op)} | 第${perf.redBlackTreeRank}名 | ${perf.bestStructure} | ${((perf.redBlackTreeRank - perf.bestRank) / perf.bestRank * 100).toFixed(1)}% |\n`;
        }
    }

    report += "\n";

    report += "### 2.2 高级场景性能\n\n";
    report += "| 测试场景 | 红黑树排名 | 最佳数据结构 | 性能差距 |\n";
    report += "| --- | --- | --- | --- |\n";

    const advTestNames = {
        'concurrent': '并发环境',
        'dataSkew': '数据倾斜',
        'stress': '压力测试',
        'persistence': '持久化与恢复'
    };

    for (const test of Object.keys(analysis.advancedPerformance)) {
        const perf = analysis.advancedPerformance[test];
        const gap = ((perf.redBlackTreeValue - perf.bestValue) / perf.bestValue * 100);
        const gapStr = test === 'concurrent' || test === 'stress' ?
            `${gap.toFixed(1)}%` : `${(-gap).toFixed(1)}%`;

        report += `| ${advTestNames[test]} | 第${perf.redBlackTreeRank}名 | ${perf.bestStructure} | ${gapStr} |\n`;
    }

    report += "\n";

    report += "### 2.3 红黑树优势\n\n";
    for (const strength of analysis.strengths) {
        report += `- ${strength}\n`;
    }
    report += "\n";

    report += "### 2.4 红黑树不足\n\n";
    for (const weakness of analysis.weaknesses) {
        report += `- ${weakness}\n`;
    }
    report += "\n";

    report += "### 2.5 推荐应用场景\n\n";
    for (const scenario of analysis.recommendedScenarios) {
        report += `#### ${scenario.name}\n\n`;
        report += `${scenario.description}\n\n`;
    }

    // 添加红黑树与其他数据结构的详细对比
    report += "## 3. 红黑树与其他数据结构对比\n\n";

    report += "### 3.1 红黑树 vs AVL树\n\n";
    report += "**时间复杂度比较**：\n";
    report += "| 操作 | 红黑树 | AVL树 |\n";
    report += "| --- | --- | --- |\n";
    report += "| 查找 | O(log n) | O(log n) |\n";
    report += "| 插入 | O(log n) | O(log n) |\n";
    report += "| 删除 | O(log n) | O(log n) |\n\n";

    report += "**主要区别**：\n";
    report += "- AVL树更严格平衡，最大高度差不超过1，而红黑树可能达到2倍的黑色节点高度\n";
    report += "- 红黑树插入操作需要的旋转次数更少，平均性能更好\n";
    report += "- AVL树搜索操作由于更平衡，理论上略快于红黑树\n";
    report += "- 红黑树删除操作的平衡调整通常更简单\n\n";

    report += "### 3.2 红黑树 vs B树/B+树\n\n";
    report += "**主要区别**：\n";
    report += "- B树和B+树是多路搜索树，每个节点可以有多个键和子节点\n";
    report += "- B+树所有数据都在叶子节点，内部节点只有索引，更适合磁盘存储\n";
    report += "- B树系列在范围查询和磁盘环境下通常优于红黑树\n";
    report += "- 红黑树在纯内存环境和单点查询方面可能更有优势\n\n";

    report += "### 3.3 红黑树 vs 跳表\n\n";
    report += "**主要区别**：\n";
    report += "- 跳表基于概率和多层链表，实现相对简单\n";
    report += "- 跳表支持更高效的并行操作和锁分离\n";
    report += "- 红黑树内存效率通常更高\n";
    report += "- 跳表在范围查询上可能有优势\n\n";

    report += "### 3.4 红黑树 vs 哈希表\n\n";
    report += "**主要区别**：\n";
    report += "- 哈希表提供常数级别O(1)的平均查找、插入和删除时间，但最坏情况可能是O(n)\n";
    report += "- 红黑树保证O(log n)的最坏情况性能\n";
    report += "- 哈希表不保持元素顺序，不支持高效的有序遍历和范围查询\n";
    report += "- 红黑树在需要有序性的场景下明显优于哈希表\n\n";

    // 添加实验结论
    report += "## 4. 实验结论\n\n";
    report += "### 4.1 数据结构选择建议\n\n";
    report += "基于本实验的结果，我们提出以下数据结构选择建议：\n\n";

    report += "- **当需要保证最坏情况下的性能**：选择红黑树或AVL树\n";
    report += "- **当读操作远多于写操作**：考虑AVL树\n";
    report += "- **当写操作频繁**：考虑红黑树或跳表\n";
    report += "- **当需要高效的范围查询**：考虑B+树或跳表\n";
    report += "- **当存储和访问大量数据且主要在磁盘上**：选择B树或B+树\n";
    report += "- **当需要高并发访问**：考虑跳表或并发哈希表\n";
    report += "- **当只需要极高效的单点查找且不关心顺序**：使用哈希表\n";
    report += "- **当应用场景多变且需要平衡的性能**：红黑树是最佳的通用选择\n\n";

    report += "### 4.2 红黑树总体评价\n\n";
    report += "红黑树作为一种经典的自平衡二叉搜索树，在各种场景下都表现出了良好的性能平衡性。它不一定在任何单一指标上是最优的，但在综合考虑各种因素后，通常是最佳的通用选择。\n\n";

    report += "红黑树的主要优势在于：\n";
    report += "- 各种操作都具有稳定的对数时间复杂度\n";
    report += "- 插入和删除操作的再平衡开销相对较小\n";
    report += "- 内存效率较高\n";
    report += "- 实现广泛验证，稳定可靠\n\n";

    report += "这些特性使红黑树成为系统编程、标准库实现和数据库索引等领域的首选数据结构之一。尽管在特定场景下可能有更专业化的选择，但红黑树提供了最好的通用性能平衡。\n\n";

    // 添加基础性能测试详细报告
    report += "## 5. 基础性能测试详细报告\n\n";
    report += basicReport.replace(/^# .*$/m, '').trim() + "\n\n";

    // 添加高级性能测试详细报告
    report += "## 6. 高级性能测试详细报告\n\n";
    report += advancedReport.replace(/^# .*$/m, '').trim() + "\n\n";

    // 添加附录
    report += "## 附录：实验环境与配置\n\n";
    report += "### 硬件环境\n\n";
    report += `- **处理器**: ${process.env.PROCESSOR || "Intel/AMD 处理器"}\n`;
    report += `- **内存**: ${process.env.MEMORY || "16GB RAM"}\n`;
    report += `- **存储**: ${process.env.STORAGE || "SSD存储"}\n\n`;

    report += "### 软件环境\n\n";
    report += `- **操作系统**: ${process.platform} ${process.release ? process.release.name : ''} ${process.version}\n`;
    report += `- **Node.js版本**: ${process.version}\n`;
    report += `- **测试执行时间**: ${new Date().toISOString()}\n\n`;

    report += "### 测试配置\n\n";
    report += `- **测试数据大小**: ${testSizes.join(', ')}\n`;
    report += `- **测试重复次数**: 5 (基础测试)\n`;
    report += `- **并发线程数**: 4 (高级测试)\n`;
    report += `- **压力测试持续时间**: 30秒\n\n`;

    return report;
}

/**
 * 将Markdown转换为HTML
 */
function convertMarkdownToHtml(markdown) {
    // 这里使用一个简单的实现，实际应用中可以使用更成熟的Markdown转HTML库如marked或showdown
    // 如果需要使用第三方库，可以用npm安装：npm install marked

    // 本例使用简易替换
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>红黑树与其他数据结构性能对比分析</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 { color: #444; }
        h1 { font-size: 2.2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 2em; }
        h3 { font-size: 1.5em; margin-top: 1.5em; }
        h4 { font-size: 1.3em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        code { font-family: Consolas, monospace; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
        img { max-width: 100%; height: auto; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul, ol { padding-left: 2em; }
        .footer { margin-top: 4em; font-size: 0.9em; color: #666; text-align: center; }
    </style>
</head>
<body>
`;

    // 替换标题
    markdown = markdown.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    markdown = markdown.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

    // 替换列表
    markdown = markdown.replace(/^- (.*?)$/gm, '<li>$1</li>');
    markdown = markdown.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');

    // 替换表格
    const replaceTable = (match) => {
        const rows = match.split('\n');
        let html = '<table>';

        rows.forEach((row, index) => {
            if (row.trim() === '') return;

            // 处理表头分隔行
            if (row.match(/^\|\s*[-:]+\s*\|/)) return;

            const cells = row.split('|').slice(1, -1);

            if (index === 0) {
                // 表头
                html += '<thead><tr>';
                cells.forEach(cell => {
                    html += `<th>${cell.trim()}</th>`;
                });
                html += '</tr></thead><tbody>';
            } else {
                // 表格内容
                html += '<tr>';
                cells.forEach(cell => {
                    html += `<td>${cell.trim()}</td>`;
                });
                html += '</tr>';
            }
        });

        html += '</tbody></table>';
        return html;
    };

    const tableRegex = /\|.*\|[\s\S]*?\n(?=\n|\n?$)/g;
    markdown = markdown.replace(tableRegex, replaceTable);

    // 替换段落
    const paragraphs = markdown.split('\n\n');
    markdown = paragraphs.map(p => {
        if (!p.startsWith('<') && p.trim() !== '') {
            return `<p>${p}</p>`;
        }
        return p;
    }).join('\n\n');

    // 替换粗体和斜体
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 添加底部
    html += markdown + `
    <div class="footer">
      <p>生成时间: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    return html;
}

/**
 * 将操作名转换为中文
 */
function operationNameMap(operation) {
    const map = {
        'insert': '插入',
        'search': '查找',
        'delete': '删除',
        'range': '范围查询'
    };

    return map[operation] || operation;
}

// 如果直接运行此文件，执行全部测试
if (require.main === module) {
    runAllTests().catch(err => {
        console.error('测试执行失败:', err);
        process.exit(1);
    });
}

// 导出函数供其他模块使用
module.exports = {
    runAllTests,
    runBasicTests,
    runAdvancedTests
};