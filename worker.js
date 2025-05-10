const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');

// 动态导入数据结构
// 注意：在实际使用时，需要确保数据结构的实现支持在工作线程中使用
function importDataStructure(className) {
    // 这里假设所有数据结构都在data_structures.js中定义
    const dataStructures = require('./data_structures');
    return dataStructures[className];
}

// 处理并发测试
async function handleConcurrentTest() {
    const { testFilePath, threadId, operations } = workerData;

    // 读取测试数据
    const testData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
    const DataStructureClass = importDataStructure(testData.className);

    // 创建数据结构实例
    const ds = new DataStructureClass();

    // 预装载数据
    for (const item of testData.testData) {
        ds.insert(item.key, item.value);
    }

    // 准备测试结果
    const result = {
        threadId,
        totalOps: 0,
        readTime: 0,
        writeTime: 0,
        readOps: 0,
        writeOps: 0,
        errors: 0,
        totalTime: 0
    };

    // 执行操作
    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
        try {
            if (Math.random() < testData.readRatio) {
                // 读操作
                const key = testData.testData[Math.floor(Math.random() * testData.testData.length)].key;
                const readStart = performance.now();
                ds.search(key);
                const readEnd = performance.now();
                result.readTime += (readEnd - readStart);
                result.readOps++;
            } else {
                // 写操作
                const isInsert = Math.random() < 0.5;

                if (isInsert) {
                    // 插入操作
                    const key = Math.floor(Math.random() * testData.testData.length * 10);
                    const value = `thread-${threadId}-value-${key}`;

                    const writeStart = performance.now();
                    ds.insert(key, value);
                    const writeEnd = performance.now();
                    result.writeTime += (writeEnd - writeStart);
                    result.writeOps++;
                } else {
                    // 删除操作
                    const key = testData.testData[Math.floor(Math.random() * testData.testData.length)].key;

                    const writeStart = performance.now();
                    ds.delete(key);
                    const writeEnd = performance.now();
                    result.writeTime += (writeEnd - writeStart);
                    result.writeOps++;
                }
            }

            result.totalOps++;
        } catch (error) {
            result.errors++;
        }
    }

    const endTime = performance.now();
    result.totalTime = endTime - startTime;

    // 返回结果
    parentPort.postMessage(result);
}

// 处理工作任务
async function handleWork() {
    switch (workerData.testType) {
        case 'concurrent':
            await handleConcurrentTest();
            break;
        default:
            parentPort.postMessage({ error: `Unknown test type: ${workerData.testType}` });
    }
}

// 执行任务
handleWork().catch(error => {
    parentPort.postMessage({ error: error.message });
});


// 导出高级测试类
module.exports = AdvancedPerformanceTester;


const {
  RedBlackTree, AVLTree, BTree, BPlusTree, SkipList,
  HashTable, BinarySearchTree, LinearArray
} = require('./data_structures');

const AdvancedPerformanceTester = require('./advanced_tests');

// 定义要测试的数据结构
const dataStructures = {
  'RedBlackTree': RedBlackTree,
  'AVLTree': AVLTree,
  'SkipList': SkipList,
  'BinarySearchTree': BinarySearchTree
};

// 创建高级测试器
const advancedTester = new AdvancedPerformanceTester(dataStructures, {
  concurrentThreads: 4,
  stressTestDuration: 30 * 1000 // 30秒，用于示例
});

// 运行测试
async function runAdvancedTests() {
  await advancedTester.runAllTests();

  // 生成报告
  const report = advancedTester.generateReport();
  console.log("生成高级测试报告...");

  // 保存报告
  require('fs').writeFileSync('advanced_performance_report.md', report);
  console.log("报告已保存到 advanced_performance_report.md");
}

runAdvancedTests().catch(console.error);