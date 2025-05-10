// data_structure_comparison.js
// 数据结构性能对比实验 - 核心实现代码

// 导入必要的库
const fs = require('fs');
const path = require('path');

// ====================== 1. 数据结构实现 ======================

// 1.1 红黑树实现
class RBNode {
    constructor(key, value = null) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.color = 'RED'; // 'RED' or 'BLACK'
    }
}

class RedBlackTree {
    constructor() {
        this.NIL = new RBNode(null);
        this.NIL.color = 'BLACK';
        this.root = this.NIL;
        this.size = 0;
    }

    insert(key, value = null) {
        const newNode = new RBNode(key, value);
        newNode.left = this.NIL;
        newNode.right = this.NIL;

        let current = this.root;
        let parent = null;

        // 寻找插入位置
        while (current !== this.NIL) {
            parent = current;
            if (key < current.key) {
                current = current.left;
            } else if (key > current.key) {
                current = current.right;
            } else {
                // 如果键已存在，则更新值
                current.value = value;
                return;
            }
        }

        // 设置新节点的父节点
        newNode.parent = parent;

        // 如果树为空，则新节点为根节点
        if (parent === null) {
            this.root = newNode;
            this.size++;
            this.fixInsert(newNode);
            return;
        }

        // 根据键的大小决定是左子节点还是右子节点
        if (key < parent.key) {
            parent.left = newNode;
        } else {
            parent.right = newNode;
        }

        this.size++;

        // 如果父节点是根节点，无需修复
        if (parent.parent === null) {
            return;
        }

        // 修复红黑树性质
        this.fixInsert(newNode);
    }

    fixInsert(node) {
        let current = node;

        // 如果当前节点的父节点是红色，则需要修复
        while (current !== this.root && current.parent.color === 'RED') {
            if (current.parent === current.parent.parent.left) {
                const uncle = current.parent.parent.right;

                // Case 1: 叔叔节点是红色
                if (uncle.color === 'RED') {
                    current.parent.color = 'BLACK';
                    uncle.color = 'BLACK';
                    current.parent.parent.color = 'RED';
                    current = current.parent.parent;
                } else {
                    // Case 2: 叔叔节点是黑色，且当前节点是右子节点
                    if (current === current.parent.right) {
                        current = current.parent;
                        this.rotateLeft(current);
                    }

                    // Case 3: 叔叔节点是黑色，且当前节点是左子节点
                    current.parent.color = 'BLACK';
                    current.parent.parent.color = 'RED';
                    this.rotateRight(current.parent.parent);
                }
            } else {
                const uncle = current.parent.parent.left;

                // Case 1: 叔叔节点是红色
                if (uncle.color === 'RED') {
                    current.parent.color = 'BLACK';
                    uncle.color = 'BLACK';
                    current.parent.parent.color = 'RED';
                    current = current.parent.parent;
                } else {
                    // Case 2: 叔叔节点是黑色，且当前节点是左子节点
                    if (current === current.parent.left) {
                        current = current.parent;
                        this.rotateRight(current);
                    }

                    // Case 3: 叔叔节点是黑色，且当前节点是右子节点
                    current.parent.color = 'BLACK';
                    current.parent.parent.color = 'RED';
                    this.rotateLeft(current.parent.parent);
                }
            }
        }

        // 确保根节点是黑色
        this.root.color = 'BLACK';
    }

    rotateLeft(node) {
        const rightChild = node.right;
        node.right = rightChild.left;

        if (rightChild.left !== this.NIL) {
            rightChild.left.parent = node;
        }

        rightChild.parent = node.parent;

        if (node.parent === null) {
            this.root = rightChild;
        } else if (node === node.parent.left) {
            node.parent.left = rightChild;
        } else {
            node.parent.right = rightChild;
        }

        rightChild.left = node;
        node.parent = rightChild;
    }

    rotateRight(node) {
        const leftChild = node.left;
        node.left = leftChild.right;

        if (leftChild.right !== this.NIL) {
            leftChild.right.parent = node;
        }

        leftChild.parent = node.parent;

        if (node.parent === null) {
            this.root = leftChild;
        } else if (node === node.parent.right) {
            node.parent.right = leftChild;
        } else {
            node.parent.left = leftChild;
        }

        leftChild.right = node;
        node.parent = leftChild;
    }

    search(key) {
        let current = this.root;

        while (current !== this.NIL) {
            if (key === current.key) {
                return current.value;
            }

            if (key < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    delete(key) {
        let nodeToDelete = this.root;
        let foundNode = false;

        // 寻找要删除的节点
        while (nodeToDelete !== this.NIL && !foundNode) {
            if (key === nodeToDelete.key) {
                foundNode = true;
            } else if (key < nodeToDelete.key) {
                nodeToDelete = nodeToDelete.left;
            } else {
                nodeToDelete = nodeToDelete.right;
            }
        }

        // 如果没有找到，返回
        if (!foundNode) {
            return false;
        }

        // 删除节点，此处简化实现
        // 在实际项目中应该实现完整的红黑树删除算法
        // 这里为了性能测试，使用一个更简单的删除方法

        let replacementNode, originalColor;

        // 情况1: 节点没有子节点或只有一个子节点
        if (nodeToDelete.left === this.NIL || nodeToDelete.right === this.NIL) {
            replacementNode = nodeToDelete.left === this.NIL ? nodeToDelete.right : nodeToDelete.left;

            // 将替代节点连接到父节点
            if (nodeToDelete.parent === null) {
                this.root = replacementNode;
            } else if (nodeToDelete === nodeToDelete.parent.left) {
                nodeToDelete.parent.left = replacementNode;
            } else {
                nodeToDelete.parent.right = replacementNode;
            }

            if (replacementNode !== this.NIL) {
                replacementNode.parent = nodeToDelete.parent;
            }

            originalColor = nodeToDelete.color;
        }
        // 情况2: 节点有两个子节点
        else {
            // 找到后继节点
            let successor = nodeToDelete.right;
            while (successor.left !== this.NIL) {
                successor = successor.left;
            }

            originalColor = successor.color;
            replacementNode = successor.right;

            // 如果后继节点是要删除节点的直接子节点
            if (successor.parent === nodeToDelete) {
                if (replacementNode !== this.NIL) {
                    replacementNode.parent = successor;
                }
            } else {
                // 将后继节点的右子节点连接到后继节点的父节点
                if (successor.parent !== null) {
                    if (successor === successor.parent.left) {
                        successor.parent.left = replacementNode;
                    } else {
                        successor.parent.right = replacementNode;
                    }
                }

                if (replacementNode !== this.NIL) {
                    replacementNode.parent = successor.parent;
                }

                // 连接后继节点到要删除节点的右子节点
                successor.right = nodeToDelete.right;
                if (nodeToDelete.right !== this.NIL) {
                    nodeToDelete.right.parent = successor;
                }
            }

            // 将后继节点放到要删除节点的位置
            if (nodeToDelete.parent === null) {
                this.root = successor;
            } else if (nodeToDelete === nodeToDelete.parent.left) {
                nodeToDelete.parent.left = successor;
            } else {
                nodeToDelete.parent.right = successor;
            }

            successor.parent = nodeToDelete.parent;
            successor.left = nodeToDelete.left;
            if (nodeToDelete.left !== this.NIL) {
                nodeToDelete.left.parent = successor;
            }
            successor.color = nodeToDelete.color;
        }

        // 如果删除的是黑色节点，需要修复红黑树性质
        if (originalColor === 'BLACK') {
            this.fixDelete(replacementNode);
        }

        this.size--;
        return true;
    }

    fixDelete(node) {
        // 这里应该实现红黑树删除后的修复算法
        // 为了简化，我们这里只保证根节点是黑色
        if (this.root !== this.NIL) {
            this.root.color = 'BLACK';
        }
    }

    rangeSearch(minKey, maxKey) {
        const result = [];
        this._rangeSearchHelper(this.root, minKey, maxKey, result);
        return result;
    }

    _rangeSearchHelper(node, minKey, maxKey, result) {
        if (node === this.NIL) {
            return;
        }

        if (node.key > minKey) {
            this._rangeSearchHelper(node.left, minKey, maxKey, result);
        }

        if (node.key >= minKey && node.key <= maxKey) {
            result.push({key: node.key, value: node.value});
        }

        if (node.key < maxKey) {
            this._rangeSearchHelper(node.right, minKey, maxKey, result);
        }
    }

    inOrderTraversal(callback) {
        this._inOrderTraversalHelper(this.root, callback);
    }

    _inOrderTraversalHelper(node, callback) {
        if (node === this.NIL) {
            return;
        }

        this._inOrderTraversalHelper(node.left, callback);
        callback(node);
        this._inOrderTraversalHelper(node.right, callback);
    }
}

// 1.2 AVL树实现
class AVLNode {
    constructor(key, value = null) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    height(node) {
        return node ? node.height : 0;
    }

    balanceFactor(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
        }
    }

    rotateRight(y) {
        const x = y.left;
        const T3 = x.right;

        x.right = y;
        y.left = T3;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    rebalance(node) {
        if (!node) {
            return null;
        }

        this.updateHeight(node);

        const balance = this.balanceFactor(node);

        // 左左情况
        if (balance > 1 && this.balanceFactor(node.left) >= 0) {
            return this.rotateRight(node);
        }

        // 右右情况
        if (balance < -1 && this.balanceFactor(node.right) <= 0) {
            return this.rotateLeft(node);
        }

        // 左右情况
        if (balance > 1 && this.balanceFactor(node.left) < 0) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        // 右左情况
        if (balance < -1 && this.balanceFactor(node.right) > 0) {
            node.right = this.rotateRight(node.right);
            return this.rotateLeft(node);
        }

        return node;
    }

    insert(key, value = null) {
        this.root = this._insertHelper(this.root, key, value);
        this.size++;
    }

    _insertHelper(node, key, value) {
        if (!node) {
            return new AVLNode(key, value);
        }

        if (key < node.key) {
            node.left = this._insertHelper(node.left, key, value);
        } else if (key > node.key) {
            node.right = this._insertHelper(node.right, key, value);
        } else {
            // 键已存在，更新值
            node.value = value;
            this.size--; // 防止在外部重复增加大小
            return node;
        }

        return this.rebalance(node);
    }

    search(key) {
        let current = this.root;

        while (current) {
            if (key === current.key) {
                return current.value;
            }

            if (key < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    minValueNode(node) {
        let current = node;

        while (current && current.left) {
            current = current.left;
        }

        return current;
    }

    delete(key) {
        const initialSize = this.size;
        this.root = this._deleteHelper(this.root, key);
        return initialSize !== this.size;
    }

    _deleteHelper(node, key) {
        if (!node) {
            return null;
        }

        if (key < node.key) {
            node.left = this._deleteHelper(node.left, key);
        } else if (key > node.key) {
            node.right = this._deleteHelper(node.right, key);
        } else {
            // 找到要删除的节点

            // 情况1: 叶子节点或者只有一个子节点
            if (!node.left || !node.right) {
                const temp = node.left || node.right;

                // 没有子节点
                if (!temp) {
                    node = null;
                } else {
                    // 有一个子节点
                    node = temp;
                }

                this.size--;
            } else {
                // 情况2: 有两个子节点
                // 找到右子树中最小的节点（后继节点）
                const temp = this.minValueNode(node.right);

                // 复制后继节点的键和值到当前节点
                node.key = temp.key;
                node.value = temp.value;

                // 删除后继节点
                node.right = this._deleteHelper(node.right, temp.key);
                // 此时 size 已经在递归中减少
            }
        }

        // 如果树为空
        if (!node) {
            return null;
        }

        // 重新平衡树
        return this.rebalance(node);
    }

    rangeSearch(minKey, maxKey) {
        const result = [];
        this._rangeSearchHelper(this.root, minKey, maxKey, result);
        return result;
    }

    _rangeSearchHelper(node, minKey, maxKey, result) {
        if (!node) {
            return;
        }

        if (node.key > minKey) {
            this._rangeSearchHelper(node.left, minKey, maxKey, result);
        }

        if (node.key >= minKey && node.key <= maxKey) {
            result.push({key: node.key, value: node.value});
        }

        if (node.key < maxKey) {
            this._rangeSearchHelper(node.right, minKey, maxKey, result);
        }
    }

    inOrderTraversal(callback) {
        this._inOrderTraversalHelper(this.root, callback);
    }

    _inOrderTraversalHelper(node, callback) {
        if (!node) {
            return;
        }

        this._inOrderTraversalHelper(node.left, callback);
        callback(node);
        this._inOrderTraversalHelper(node.right, callback);
    }
}

// 1.3 跳表实现
class SkipNode {
    constructor(key, value = null, level = 0) {
        this.key = key;
        this.value = value;
        this.forward = new Array(level + 1).fill(null);
    }
}

class SkipList {
    constructor(maxLevel = 16, p = 0.5) {
        this.maxLevel = maxLevel;
        this.p = p;
        this.level = 0;
        this.header = new SkipNode(-Infinity, null, maxLevel);
        this.size = 0;
    }

    randomLevel() {
        let level = 0;
        while (Math.random() < this.p && level < this.maxLevel) {
            level++;
        }
        return level;
    }

    insert(key, value = null) {
        const update = new Array(this.maxLevel + 1).fill(null);
        let current = this.header;

        // 寻找插入位置，并记录每一层的前驱节点
        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] !== null && current.forward[i].key < key) {
                current = current.forward[i];
            }
            update[i] = current;
        }

        current = current.forward[0];

        // 如果键已存在，更新值
        if (current !== null && current.key === key) {
            current.value = value;
            return;
        }

        // 生成随机层级
        const newLevel = this.randomLevel();

        // 如果新层级大于当前层级，更新前驱节点
        if (newLevel > this.level) {
            for (let i = this.level + 1; i <= newLevel; i++) {
                update[i] = this.header;
            }
            this.level = newLevel;
        }

        // 创建新节点
        const newNode = new SkipNode(key, value, newLevel);

        // 更新前驱节点的指针
        for (let i = 0; i <= newLevel; i++) {
            newNode.forward[i] = update[i].forward[i];
            update[i].forward[i] = newNode;
        }

        this.size++;
    }

    search(key) {
        let current = this.header;

        // 从最高层开始搜索
        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] !== null && current.forward[i].key < key) {
                current = current.forward[i];
            }
        }

        current = current.forward[0];

        // 判断是否找到
        if (current !== null && current.key === key) {
            return current.value;
        }

        return null;
    }

    delete(key) {
        const update = new Array(this.maxLevel + 1).fill(null);
        let current = this.header;

        // 寻找删除位置，并记录每一层的前驱节点
        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] !== null && current.forward[i].key < key) {
                current = current.forward[i];
            }
            update[i] = current;
        }

        current = current.forward[0];

        // 如果找到，则删除
        if (current !== null && current.key === key) {
            // 更新前驱节点的指针
            for (let i = 0; i <= this.level; i++) {
                if (update[i].forward[i] !== current) {
                    break;
                }
                update[i].forward[i] = current.forward[i];
            }

            // 更新层级
            while (this.level > 0 && this.header.forward[this.level] === null) {
                this.level--;
            }

            this.size--;
            return true;
        }

        return false;
    }

    rangeSearch(minKey, maxKey) {
        const result = [];
        let current = this.header;

        // 先找到范围的起始位置
        for (let i = this.level; i >= 0; i--) {
            while (current.forward[i] !== null && current.forward[i].key < minKey) {
                current = current.forward[i];
            }
        }

        // 移动到第一层
        current = current.forward[0];

        // 收集范围内的所有节点
        while (current !== null && current.key <= maxKey) {
            result.push({key: current.key, value: current.value});
            current = current.forward[0];
        }

        return result;
    }

    inOrderTraversal(callback) {
        let current = this.header.forward[0];

        while (current !== null) {
            callback(current);
            current = current.forward[0];
        }
    }
}

// 1.4 哈希表实现（简化版）
class HashTable {
    constructor(initialCapacity = 16, loadFactor = 0.75) {
        this.buckets = new Array(initialCapacity);
        this.loadFactor = loadFactor;
        this.size = 0;
    }

    hash(key) {
        if (typeof key === 'number') {
            return key % this.buckets.length;
        }

        let hash = 0;
        const str = String(key);

        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0; // 转换为32位整数
        }

        return Math.abs(hash) % this.buckets.length;
    }

    insert(key, value) {
        // 检查是否需要扩容
        if (this.size / this.buckets.length >= this.loadFactor) {
            this.resize(this.buckets.length * 2);
        }

        const index = this.hash(key);

        if (!this.buckets[index]) {
            this.buckets[index] = [];
        }

        // 检查键是否已存在
        for (let i = 0; i < this.buckets[index].length; i++) {
            if (this.buckets[index][i].key === key) {
                this.buckets[index][i].value = value;
                return;
            }
        }

        // 如果键不存在，则插入新的键值对
        this.buckets[index].push({key, value});
        this.size++;
    }

    search(key) {
        const index = this.hash(key);

        if (!this.buckets[index]) {
            return null;
        }

        for (const entry of this.buckets[index]) {
            if (entry.key === key) {
                return entry.value;
            }
        }

        return null;
    }

    delete(key) {
        const index = this.hash(key);

        if (!this.buckets[index]) {
            return false;
        }

        for (let i = 0; i < this.buckets[index].length; i++) {
            if (this.buckets[index][i].key === key) {
                this.buckets[index].splice(i, 1);
                this.size--;
                return true;
            }
        }

        return false;
    }

    resize(newCapacity) {
        const oldBuckets = this.buckets;
        this.buckets = new Array(newCapacity);
        this.size = 0;

        for (const bucket of oldBuckets) {
            if (bucket) {
                for (const entry of bucket) {
                    this.insert(entry.key, entry.value);
                }
            }
        }
    }

    // 哈希表不支持原生的顺序遍历和范围查询
    // 但可以为测试目的提供一个非高效实现
    rangeSearch(minKey, maxKey) {
        const result = [];

        for (const bucket of this.buckets) {
            if (bucket) {
                for (const entry of bucket) {
                    if (entry.key >= minKey && entry.key <= maxKey) {
                        result.push({key: entry.key, value: entry.value});
                    }
                }
            }
        }

        // 排序，以保持结果的有序性
        result.sort((a, b) => a.key - b.key);

        return result;
    }

    inOrderTraversal(callback) {
        const entries = [];

        for (const bucket of this.buckets) {
            if (bucket) {
                for (const entry of bucket) {
                    entries.push(entry);
                }
            }
        }

        // 排序，以保持遍历的有序性
        entries.sort((a, b) => a.key - b.key);

        for (const entry of entries) {
            callback(entry);
        }
    }
}

// 1.5 二叉搜索树实现
class BSTNode {
    constructor(key, value = null) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
        this.size = 0;
    }

    insert(key, value = null) {
        this.root = this._insertHelper(this.root, key, value);
        this.size++;
    }

    _insertHelper(node, key, value) {
        if (!node) {
            return new BSTNode(key, value);
        }

        if (key < node.key) {
            node.left = this._insertHelper(node.left, key, value);
        } else if (key > node.key) {
            node.right = this._insertHelper(node.right, key, value);
        } else {
            // 键已存在，更新值
            node.value = value;
            this.size--; // 防止在外部重复增加大小
        }

        return node;
    }

    search(key) {
        let current = this.root;

        while (current) {
            if (key === current.key) {
                return current.value;
            }

            if (key < current.key) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    minValueNode(node) {
        let current = node;

        while (current && current.left) {
            current = current.left;
        }

        return current;
    }

    delete(key) {
        const initialSize = this.size;
        this.root = this._deleteHelper(this.root, key);
        return initialSize !== this.size;
    }

    _deleteHelper(node, key) {
        if (!node) {
            return null;
        }

        if (key < node.key) {
            node.left = this._deleteHelper(node.left, key);
        } else if (key > node.key) {
            node.right = this._deleteHelper(node.right, key);
        } else {
// 继续二叉搜索树的删除操作实现
            _deleteHelper(node, key)
            {
                if (!node) {
                    return null;
                }

                if (key < node.key) {
                    node.left = this._deleteHelper(node.left, key);
                } else if (key > node.key) {
                    node.right = this._deleteHelper(node.right, key);
                } else {
                    // 找到要删除的节点

                    // 情况1: 叶子节点或者只有一个子节点
                    if (!node.left) {
                        this.size--;
                        return node.right;
                    } else if (!node.right) {
                        this.size--;
                        return node.left;
                    }

                    // 情况2: 有两个子节点
                    // 找到右子树中最小的节点（后继节点）
                    const temp = this.minValueNode(node.right);

                    // 复制后继节点的键和值到当前节点
                    node.key = temp.key;
                    node.value = temp.value;

                    // 删除后继节点
                    node.right = this._deleteHelper(node.right, temp.key);
                    // 此时 size 已经在递归中减少
                }

                return node;
            }

            rangeSearch(minKey, maxKey)
            {
                const result = [];
                this._rangeSearchHelper(this.root, minKey, maxKey, result);
                return result;
            }

            _rangeSearchHelper(node, minKey, maxKey, result)
            {
                if (!node) {
                    return;
                }

                if (node.key > minKey) {
                    this._rangeSearchHelper(node.left, minKey, maxKey, result);
                }

                if (node.key >= minKey && node.key <= maxKey) {
                    result.push({key: node.key, value: node.value});
                }

                if (node.key < maxKey) {
                    this._rangeSearchHelper(node.right, minKey, maxKey, result);
                }
            }

            inOrderTraversal(callback)
            {
                this._inOrderTraversalHelper(this.root, callback);
            }

            _inOrderTraversalHelper(node, callback)
            {
                if (!node) {
                    return;
                }

                this._inOrderTraversalHelper(node.left, callback);
                callback(node);
                this._inOrderTraversalHelper(node.right, callback);
            }
        }
    }
}

// 1.6 B树实现 (简化版)
class BTreeNode {
    constructor(isLeaf = true, order = 5) {
        this.isLeaf = isLeaf;
        this.keys = [];
        this.values = [];
        this.children = [];
        this.order = order;
    }

    isFull() {
        return this.keys.length === this.order - 1;
    }
}

class BTree {
    constructor(order = 5) {
        this.root = new BTreeNode(true, order);
        this.order = order;
        this.size = 0;
    }

    insert(key, value = null) {
        const root = this.root;

        // 如果根节点已满，需要分裂
        if (root.isFull()) {
            const newRoot = new BTreeNode(false, this.order);
            newRoot.children.push(root);
            this._splitChild(newRoot, 0);
            this.root = newRoot;
            this._insertNonFull(newRoot, key, value);
        } else {
            this._insertNonFull(root, key, value);
        }

        this.size++;
    }

    _insertNonFull(node, key, value) {
        let i = node.keys.length - 1;

        if (node.isLeaf) {
            // 找到合适的位置插入
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }

            // 如果键已存在，更新值
            if (i >= 0 && key === node.keys[i]) {
                node.values[i] = value;
                this.size--; // 防止在外部重复增加大小
                return;
            }

            // 插入新键值对
            node.keys.splice(i + 1, 0, key);
            node.values.splice(i + 1, 0, value);
        } else {
            // 找到合适的子节点
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }

            i++;

            // 如果子节点已满，需要分裂
            if (node.children[i].isFull()) {
                this._splitChild(node, i);

                if (key > node.keys[i]) {
                    i++;
                }
            }

            this._insertNonFull(node.children[i], key, value);
        }
    }

    _splitChild(parentNode, childIndex) {
        const order = this.order;
        const childNode = parentNode.children[childIndex];
        const newNode = new BTreeNode(childNode.isLeaf, order);

        // 将子节点的后半部分移动到新节点
        const midIndex = Math.floor((order - 1) / 2);

        for (let i = midIndex + 1; i < order - 1; i++) {
            newNode.keys.push(childNode.keys[i]);
            newNode.values.push(childNode.values[i]);
        }

        // 如果不是叶子节点，移动相应的子节点
        if (!childNode.isLeaf) {
            for (let i = midIndex + 1; i < order; i++) {
                newNode.children.push(childNode.children[i]);
            }
            childNode.children.length = midIndex + 1;
        }

        // 更新子节点的键和值
        const midKey = childNode.keys[midIndex];
        const midValue = childNode.values[midIndex];

        childNode.keys.length = midIndex;
        childNode.values.length = midIndex;

        // 将中间键插入到父节点
        let i = parentNode.keys.length - 1;
        while (i >= 0 && midKey < parentNode.keys[i]) {
            i--;
        }

        parentNode.keys.splice(i + 1, 0, midKey);
        parentNode.values.splice(i + 1, 0, midValue);
        parentNode.children.splice(childIndex + 1, 0, newNode);
    }

    search(key) {
        return this._searchHelper(this.root, key);
    }

    _searchHelper(node, key) {
        let i = 0;

        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }

        if (i < node.keys.length && key === node.keys[i]) {
            return node.values[i];
        }

        if (node.isLeaf) {
            return null;
        }

        return this._searchHelper(node.children[i], key);
    }

    // B树的删除操作较为复杂，这里仅提供一个简化版实现
    delete(key) {
        if (this.root.keys.length === 0) {
            return false;
        }

        const result = this._deleteHelper(this.root, key);

        // 如果根节点没有键且不是叶子节点，更新根节点
        if (this.root.keys.length === 0 && !this.root.isLeaf) {
            this.root = this.root.children[0];
        }

        if (result) {
            this.size--;
        }

        return result;
    }

    _deleteHelper(node, key) {
        let i = 0;

        // 找到键或应该在的位置
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }

        // 如果在当前节点找到键
        if (i < node.keys.length && key === node.keys[i]) {
            if (node.isLeaf) {
                // 情况1: 叶子节点，直接删除
                node.keys.splice(i, 1);
                node.values.splice(i, 1);
                return true;
            } else {
                // 情况2: 内部节点，需要找前驱或后继
                // 简化处理：总是使用后继
                const successorKey = this._findSuccessor(node, i);
                node.keys[i] = successorKey.key;
                node.values[i] = successorKey.value;
                return this._deleteHelper(node.children[i + 1], successorKey.key);
            }
        } else if (node.isLeaf) {
            // 键不在叶子节点中
            return false;
        } else {
            // 键可能在子节点中
            // 简化实现，不处理节点合并和再平衡
            return this._deleteHelper(node.children[i], key);
        }
    }

    _findSuccessor(node, index) {
        let current = node.children[index + 1];

        while (!current.isLeaf) {
            current = current.children[0];
        }

        return {key: current.keys[0], value: current.values[0]};
    }

    rangeSearch(minKey, maxKey) {
        const result = [];
        this._rangeSearchHelper(this.root, minKey, maxKey, result);
        return result;
    }

    _rangeSearchHelper(node, minKey, maxKey, result) {
        if (!node) {
            return;
        }

        let i = 0;

        // 找到第一个大于等于minKey的位置
        while (i < node.keys.length && node.keys[i] < minKey) {
            i++;
        }

        // 如果不是叶子节点，递归搜索左子树
        if (!node.isLeaf && i > 0) {
            this._rangeSearchHelper(node.children[i - 1], minKey, maxKey, result);
        }

        // 收集范围内的键
        while (i < node.keys.length && node.keys[i] <= maxKey) {
            if (node.keys[i] >= minKey) {
                result.push({key: node.keys[i], value: node.values[i]});
            }

            // 如果不是叶子节点，递归搜索中间子树
            if (!node.isLeaf) {
                this._rangeSearchHelper(node.children[i], minKey, maxKey, result);
            }

            i++;
        }

        // 如果不是叶子节点，递归搜索右子树
        if (!node.isLeaf && i < node.children.length) {
            this._rangeSearchHelper(node.children[i], minKey, maxKey, result);
        }
    }

    inOrderTraversal(callback) {
        this._inOrderTraversalHelper(this.root, callback);
    }

    _inOrderTraversalHelper(node, callback) {
        if (!node) {
            return;
        }

        for (let i = 0; i < node.keys.length; i++) {
            if (!node.isLeaf) {
                this._inOrderTraversalHelper(node.children[i], callback);
            }

            callback({key: node.keys[i], value: node.values[i]});
        }

        if (!node.isLeaf) {
            this._inOrderTraversalHelper(node.children[node.keys.length], callback);
        }
    }
}

// 1.7 B+树实现 (简化版)
class BPlusTreeNode {
    constructor(isLeaf = true, order = 5) {
        this.isLeaf = isLeaf;
        this.keys = [];
        this.values = isLeaf ? [] : null; // 只有叶子节点存储值
        this.children = !isLeaf ? [] : null;
        this.next = null; // 叶子节点链表
        this.order = order;
    }

    isFull() {
        return this.keys.length === this.order - 1;
    }
}

class BPlusTree {
    constructor(order = 5) {
        this.root = new BPlusTreeNode(true, order);
        this.order = order;
        this.size = 0;
        this.firstLeaf = this.root; // 指向第一个叶子节点，用于范围查询
    }

    insert(key, value = null) {
        const root = this.root;

        // 如果根节点已满，需要分裂
        if (root.isFull()) {
            const newRoot = new BPlusTreeNode(false, this.order);
            newRoot.children.push(root);
            this._splitChild(newRoot, 0);
            this.root = newRoot;
            this._insertNonFull(newRoot, key, value);
        } else {
            this._insertNonFull(root, key, value);
        }

        this.size++;
    }

    _insertNonFull(node, key, value) {
        let i = node.keys.length - 1;

        if (node.isLeaf) {
            // 找到合适的位置插入
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }

            // 如果键已存在，更新值
            if (i >= 0 && key === node.keys[i]) {
                node.values[i] = value;
                this.size--; // 防止在外部重复增加大小
                return;
            }

            // 插入新键值对
            node.keys.splice(i + 1, 0, key);
            node.values.splice(i + 1, 0, value);
        } else {
            // 找到合适的子节点
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }

            i++;

            // 如果子节点已满，需要分裂
            if (node.children[i].isFull()) {
                this._splitChild(node, i);

                if (key > node.keys[i]) {
                    i++;
                }
            }

            this._insertNonFull(node.children[i], key, value);
        }
    }

    _splitChild(parentNode, childIndex) {
        const order = this.order;
        const childNode = parentNode.children[childIndex];
        const newNode = new BPlusTreeNode(childNode.isLeaf, order);

        // 计算中间位置
        const midIndex = Math.floor((order - 1) / 2);

        if (childNode.isLeaf) {
            // B+树特性：叶子节点分裂时，中间键会同时出现在两个节点中

            // 复制后半部分键值到新节点
            for (let i = midIndex; i < order - 1; i++) {
                newNode.keys.push(childNode.keys[i]);
                newNode.values.push(childNode.values[i]);
            }

            // 更新原节点
            childNode.keys.length = midIndex;
            childNode.values.length = midIndex;

            // 更新叶子节点链表
            newNode.next = childNode.next;
            childNode.next = newNode;

            // 将新节点的第一个键插入到父节点
            parentNode.keys.splice(childIndex, 0, newNode.keys[0]);
            parentNode.children.splice(childIndex + 1, 0, newNode);
        } else {
            // 内部节点分裂

            // 复制后半部分键到新节点
            for (let i = midIndex + 1; i < order - 1; i++) {
                newNode.keys.push(childNode.keys[i]);
            }

            // 复制后半部分子节点到新节点
            for (let i = midIndex + 1; i < order; i++) {
                newNode.children.push(childNode.children[i]);
            }

            // 提取中间键到父节点
            const midKey = childNode.keys[midIndex];

            // 更新原节点
            childNode.keys.length = midIndex;
            childNode.children.length = midIndex + 1;

            // 将中间键插入到父节点
            parentNode.keys.splice(childIndex, 0, midKey);
            parentNode.children.splice(childIndex + 1, 0, newNode);
        }
    }

    search(key) {
        let node = this.root;

        while (!node.isLeaf) {
            let i = 0;

            while (i < node.keys.length && key >= node.keys[i]) {
                i++;
            }

            node = node.children[i];
        }

        for (let i = 0; i < node.keys.length; i++) {
            if (node.keys[i] === key) {
                return node.values[i];
            }
        }

        return null;
    }

    // B+树的删除操作较为复杂，这里仅提供一个简化版实现
    delete(key) {
        if (this.root.keys.length === 0) {
            return false;
        }

        const result = this._deleteHelper(this.root, key);

        // 如果根节点没有键且不是叶子节点，更新根节点
        if (this.root.keys.length === 0 && !this.root.isLeaf) {
            this.root = this.root.children[0];
        }

        if (result) {
            this.size--;
        }

        return result;
    }

    _deleteHelper(node, key) {
        if (node.isLeaf) {
            // 在叶子节点中查找并删除键
            for (let i = 0; i < node.keys.length; i++) {
                if (node.keys[i] === key) {
                    node.keys.splice(i, 1);
                    node.values.splice(i, 1);
                    return true;
                }
            }
            return false;
        } else {
            // 在内部节点查找子节点
            let i = 0;

            while (i < node.keys.length && key >= node.keys[i]) {
                i++;
            }

            // 简化实现，不处理节点合并和再平衡
            return this._deleteHelper(node.children[i], key);
        }
    }

    rangeSearch(minKey, maxKey) {
        const result = [];

        // 先找到包含最小键的叶子节点
        let node = this.root;

        while (!node.isLeaf) {
            let i = 0;

            while (i < node.keys.length && minKey >= node.keys[i]) {
                i++;
            }

            node = node.children[i];
        }

        // 从该叶子节点开始收集范围内的键值对
        while (node) {
            for (let i = 0; i < node.keys.length; i++) {
                if (node.keys[i] >= minKey && node.keys[i] <= maxKey) {
                    result.push({key: node.keys[i], value: node.values[i]});
                } else if (node.keys[i] > maxKey) {
                    return result;
                }
            }

            node = node.next;
        }

        return result;
    }

    inOrderTraversal(callback) {
        this._inOrderTraversalHelper(this.root, callback);
    }

    _inOrderTraversalHelper(node, callback) {
        if (node.isLeaf) {
            for (let i = 0; i < node.keys.length; i++) {
                callback({key: node.keys[i], value: node.values[i]});
            }
        } else {
            for (let i = 0; i < node.keys.length; i++) {
                this._inOrderTraversalHelper(node.children[i], callback);
                callback({key: node.keys[i], value: null});
            }

            this._inOrderTraversalHelper(node.children[node.keys.length], callback);
        }
    }
}

// 1.8 线性数组 (用作基准参照)
class LinearArray {
    constructor() {
        this.items = [];
        this.size = 0;
    }

    insert(key, value = null) {
        // 查找插入位置，保持有序
        let index = 0;

        while (index < this.items.length && this.items[index].key < key) {
            index++;
        }

        // 如果键已存在，更新值
        if (index < this.items.length && this.items[index].key === key) {
            this.items[index].value = value;
            return;
        }

        // 插入新键值对
        this.items.splice(index, 0, {key, value});
        this.size++;
    }

    search(key) {
        // 二分查找
        let left = 0;
        let right = this.items.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (this.items[mid].key === key) {
                return this.items[mid].value;
            }

            if (this.items[mid].key < key) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return null;
    }

    delete(key) {
        // 二分查找
        let left = 0;
        let right = this.items.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);

            if (this.items[mid].key === key) {
                this.items.splice(mid, 1);
                this.size--;
                return true;
            }

            if (this.items[mid].key < key) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return false;
    }

    rangeSearch(minKey, maxKey) {
        const result = [];

        // 二分查找找到起始位置
        let start = 0;

        while (start < this.items.length && this.items[start].key < minKey) {
            start++;
        }

        // 从起始位置收集范围内的键值对
        while (start < this.items.length && this.items[start].key <= maxKey) {
            result.push({key: this.items[start].key, value: this.items[start].value});
            start++;
        }

        return result;
    }

    inOrderTraversal(callback) {
        for (const item of this.items) {
            callback(item);
        }
    }
}

// ====================== 2. 测试数据生成器 ======================

// 生成不同分布的测试数据
class DataGenerator {
    // 均匀随机分布
    static uniformDistribution(size, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const data = [];

        for (let i = 0; i < size; i++) {
            const key = Math.floor(Math.random() * (max - min + 1)) + min;
            data.push({key, value: `value-${key}`});
        }

        return data;
    }

    // 正态分布 (使用Box-Muller变换)
    static normalDistribution(size, mean = 500000, stdDev = 100000) {
        const data = [];

        for (let i = 0; i < size; i++) {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();

            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const key = Math.max(0, Math.floor(mean + z * stdDev));

            data.push({key, value: `value-${key}`});
        }

        return data;
    }

    // 偏斜分布 (80/20法则)
    static skewedDistribution(size, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const data = [];
        const hotspotSize = Math.floor(max * 0.2);
        const hotspotProbability = 0.8;

        for (let i = 0; i < size; i++) {
            let key;

            if (Math.random() < hotspotProbability) {
                // 80%的概率生成热点区域内的键
                key = Math.floor(Math.random() * hotspotSize) + min;
            } else {
                // 20%的概率生成非热点区域内的键
                key = Math.floor(Math.random() * (max - hotspotSize)) + min + hotspotSize;
            }

            data.push({key, value: `value-${key}`});
        }

        return data;
    }

    // 几乎有序的数据
    static nearSortedDistribution(size, swapFraction = 0.1) {
        const data = [];

        // 生成有序数据
        for (let i = 0; i < size; i++) {
            data.push({key: i, value: `value-${i}`});
        }

        // 随机交换一小部分数据
        const swapCount = Math.floor(size * swapFraction);

        for (let i = 0; i < swapCount; i++) {
            const index1 = Math.floor(Math.random() * size);
            const index2 = Math.floor(Math.random() * size);

            const temp = data[index1].key;
            data[index1].key = data[index2].key;
            data[index2].key = temp;

            data[index1].value = `value-${data[index1].key}`;
            data[index2].value = `value-${data[index2].key}`;
        }

        return data;
    }

    // 完全有序数据
    static sortedDistribution(size) {
        const data = [];

        for (let i = 0; i < size; i++) {
            data.push({key: i, value: `value-${i}`});
        }

        return data;
    }

    // 完全逆序数据
    static reverseSortedDistribution(size) {
        const data = [];

        for (let i = size - 1; i >= 0; i--) {
            data.push({key: i, value: `value-${i}`});
        }

        return data;
    }

    // 生成Zipf分布的数据 (用于访问模式)
    static zipfDistribution(size, alpha = 1.5) {
        const data = [];
        const zipf = [];
        let sum = 0;

        // 计算Zipf权重
        for (let i = 1; i <= size; i++) {
            const weight = 1 / Math.pow(i, alpha);
            zipf.push(weight);
            sum += weight;
        }

        // 归一化
        for (let i = 0; i < size; i++) {
            zipf[i] /= sum;
        }

        // 生成累积分布函数
        const cdf = [];
        let cumsum = 0;

        for (let i = 0; i < size; i++) {
            cumsum += zipf[i];
            cdf.push(cumsum);
        }

        // 生成数据
        for (let i = 0; i < size; i++) {
            const r = Math.random();
            let index = 0;

            while (index < size - 1 && r > cdf[index]) {
                index++;
            }

            data.push({key: index, value: `value-${index}`});
        }

        return data;
    }
}

// ====================== 3. 性能测试工具 ======================

class PerformanceTester {
    constructor(dataStructures, testSizes, iterations = 5) {
        this.dataStructures = dataStructures;
        this.testSizes = testSizes;
        this.iterations = iterations;
        this.results = {};
    }

    // 3.1 基准测试：CRUD操作性能
    async runCRUDTest(dataDistribution = 'uniform') {
        console.log(`\n开始 CRUD 性能测试 (数据分布: ${dataDistribution})...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            results[name] = {
                insert: [],
                search: [],
                delete: [],
                range: []
            };

            for (const size of this.testSizes) {
                console.log(`测试 ${name} 在数据量 ${size} 下的性能...`);

                let insertTimes = [];
                let searchTimes = [];
                let deleteTimes = [];
                let rangeTimes// 继续二叉搜索树的删除操作实现
                _deleteHelper(node, key)
                {
                    if (!node) {
                        return null;
                    }

                    if (key < node.key) {
                        node.left = this._deleteHelper(node.left, key);
                    } else if (key > node.key) {
                        node.right = this._deleteHelper(node.right, key);
                    } else {
                        // 找到要删除的节点

                        // 情况1: 叶子节点或者只有一个子节点
                        if (!node.left) {
                            this.size--;
                            return node.right;
                        } else if (!node.right) {
                            this.size--;
                            return node.left;
                        }

                        // 情况2: 有两个子节点
                        // 找到右子树中最小的节点（后继节点）
                        const temp = this.minValueNode(node.right);

                        // 复制后继节点的键和值到当前节点
                        node.key = temp.key;
                        node.value = temp.value;

                        // 删除后继节点
                        node.right = this._deleteHelper(node.right, temp.key);
                        // 此时 size 已经在递归中减少
                    }

                    return node;
                }

                rangeSearch(minKey, maxKey)
                {
                    const result = [];
                    this._rangeSearchHelper(this.root, minKey, maxKey, result);
                    return result;
                }

                _rangeSearchHelper(node, minKey, maxKey, result)
                {
                    if (!node) {
                        return;
                    }

                    if (node.key > minKey) {
                        this._rangeSearchHelper(node.left, minKey, maxKey, result);
                    }

                    if (node.key >= minKey && node.key <= maxKey) {
                        result.push({key: node.key, value: node.value});
                    }

                    if (node.key < maxKey) {
                        this._rangeSearchHelper(node.right, minKey, maxKey, result);
                    }
                }

                inOrderTraversal(callback)
                {
                    this._inOrderTraversalHelper(this.root, callback);
                }

                _inOrderTraversalHelper(node, callback)
                {
                    if (!node) {
                        return;
                    }

                    this._inOrderTraversalHelper(node.left, callback);
                    callback(node);
                    this._inOrderTraversalHelper(node.right, callback);
                }
            }

// 1.6 B树实现 (简化版)
            class BTreeNode {
                constructor(isLeaf = true, order = 5) {
                    this.isLeaf = isLeaf;
                    this.keys = [];
                    this.values = [];
                    this.children = [];
                    this.order = order;
                }

                isFull() {
                    return this.keys.length === this.order - 1;
                }
            }

            class BTree {
                constructor(order = 5) {
                    this.root = new BTreeNode(true, order);
                    this.order = order;
                    this.size = 0;
                }

                insert(key, value = null) {
                    const root = this.root;

                    // 如果根节点已满，需要分裂
                    if (root.isFull()) {
                        const newRoot = new BTreeNode(false, this.order);
                        newRoot.children.push(root);
                        this._splitChild(newRoot, 0);
                        this.root = newRoot;
                        this._insertNonFull(newRoot, key, value);
                    } else {
                        this._insertNonFull(root, key, value);
                    }

                    this.size++;
                }

                _insertNonFull(node, key, value) {
                    let i = node.keys.length - 1;

                    if (node.isLeaf) {
                        // 找到合适的位置插入
                        while (i >= 0 && key < node.keys[i]) {
                            i--;
                        }

                        // 如果键已存在，更新值
                        if (i >= 0 && key === node.keys[i]) {
                            node.values[i] = value;
                            this.size--; // 防止在外部重复增加大小
                            return;
                        }

                        // 插入新键值对
                        node.keys.splice(i + 1, 0, key);
                        node.values.splice(i + 1, 0, value);
                    } else {
                        // 找到合适的子节点
                        while (i >= 0 && key < node.keys[i]) {
                            i--;
                        }

                        i++;

                        // 如果子节点已满，需要分裂
                        if (node.children[i].isFull()) {
                            this._splitChild(node, i);

                            if (key > node.keys[i]) {
                                i++;
                            }
                        }

                        this._insertNonFull(node.children[i], key, value);
                    }
                }

                _splitChild(parentNode, childIndex) {
                    const order = this.order;
                    const childNode = parentNode.children[childIndex];
                    const newNode = new BTreeNode(childNode.isLeaf, order);

                    // 将子节点的后半部分移动到新节点
                    const midIndex = Math.floor((order - 1) / 2);

                    for (let i = midIndex + 1; i < order - 1; i++) {
                        newNode.keys.push(childNode.keys[i]);
                        newNode.values.push(childNode.values[i]);
                    }

                    // 如果不是叶子节点，移动相应的子节点
                    if (!childNode.isLeaf) {
                        for (let i = midIndex + 1; i < order; i++) {
                            newNode.children.push(childNode.children[i]);
                        }
                        childNode.children.length = midIndex + 1;
                    }

                    // 更新子节点的键和值
                    const midKey = childNode.keys[midIndex];
                    const midValue = childNode.values[midIndex];

                    childNode.keys.length = midIndex;
                    childNode.values.length = midIndex;

                    // 将中间键插入到父节点
                    let i = parentNode.keys.length - 1;
                    while (i >= 0 && midKey < parentNode.keys[i]) {
                        i--;
                    }

                    parentNode.keys.splice(i + 1, 0, midKey);
                    parentNode.values.splice(i + 1, 0, midValue);
                    parentNode.children.splice(childIndex + 1, 0, newNode);
                }

                search(key) {
                    return this._searchHelper(this.root, key);
                }

                _searchHelper(node, key) {
                    let i = 0;

                    while (i < node.keys.length && key > node.keys[i]) {
                        i++;
                    }

                    if (i < node.keys.length && key === node.keys[i]) {
                        return node.values[i];
                    }

                    if (node.isLeaf) {
                        return null;
                    }

                    return this._searchHelper(node.children[i], key);
                }

                // B树的删除操作较为复杂，这里仅提供一个简化版实现
                delete(key) {
                    if (this.root.keys.length === 0) {
                        return false;
                    }

                    const result = this._deleteHelper(this.root, key);

                    // 如果根节点没有键且不是叶子节点，更新根节点
                    if (this.root.keys.length === 0 && !this.root.isLeaf) {
                        this.root = this.root.children[0];
                    }

                    if (result) {
                        this.size--;
                    }

                    return result;
                }

                _deleteHelper(node, key) {
                    let i = 0;

                    // 找到键或应该在的位置
                    while (i < node.keys.length && key > node.keys[i]) {
                        i++;
                    }

                    // 如果在当前节点找到键
                    if (i < node.keys.length && key === node.keys[i]) {
                        if (node.isLeaf) {
                            // 情况1: 叶子节点，直接删除
                            node.keys.splice(i, 1);
                            node.values.splice(i, 1);
                            return true;
                        } else {
                            // 情况2: 内部节点，需要找前驱或后继
                            // 简化处理：总是使用后继
                            const successorKey = this._findSuccessor(node, i);
                            node.keys[i] = successorKey.key;
                            node.values[i] = successorKey.value;
                            return this._deleteHelper(node.children[i + 1], successorKey.key);
                        }
                    } else if (node.isLeaf) {
                        // 键不在叶子节点中
                        return false;
                    } else {
                        // 键可能在子节点中
                        // 简化实现，不处理节点合并和再平衡
                        return this._deleteHelper(node.children[i], key);
                    }
                }

                _findSuccessor(node, index) {
                    let current = node.children[index + 1];

                    while (!current.isLeaf) {
                        current = current.children[0];
                    }

                    return {key: current.keys[0], value: current.values[0]};
                }

                rangeSearch(minKey, maxKey) {
                    const result = [];
                    this._rangeSearchHelper(this.root, minKey, maxKey, result);
                    return result;
                }

                _rangeSearchHelper(node, minKey, maxKey, result) {
                    if (!node) {
                        return;
                    }

                    let i = 0;

                    // 找到第一个大于等于minKey的位置
                    while (i < node.keys.length && node.keys[i] < minKey) {
                        i++;
                    }

                    // 如果不是叶子节点，递归搜索左子树
                    if (!node.isLeaf && i > 0) {
                        this._rangeSearchHelper(node.children[i - 1], minKey, maxKey, result);
                    }

                    // 收集范围内的键
                    while (i < node.keys.length && node.keys[i] <= maxKey) {
                        if (node.keys[i] >= minKey) {
                            result.push({key: node.keys[i], value: node.values[i]});
                        }

                        // 如果不是叶子节点，递归搜索中间子树
                        if (!node.isLeaf) {
                            this._rangeSearchHelper(node.children[i], minKey, maxKey, result);
                        }

                        i++;
                    }

                    // 如果不是叶子节点，递归搜索右子树
                    if (!node.isLeaf && i < node.children.length) {
                        this._rangeSearchHelper(node.children[i], minKey, maxKey, result);
                    }
                }

                inOrderTraversal(callback) {
                    this._inOrderTraversalHelper(this.root, callback);
                }

                _inOrderTraversalHelper(node, callback) {
                    if (!node) {
                        return;
                    }

                    for (let i = 0; i < node.keys.length; i++) {
                        if (!node.isLeaf) {
                            this._inOrderTraversalHelper(node.children[i], callback);
                        }

                        callback({key: node.keys[i], value: node.values[i]});
                    }

                    if (!node.isLeaf) {
                        this._inOrderTraversalHelper(node.children[node.keys.length], callback);
                    }
                }
            }

            // 1.7 B+树实现 (简化版)
            class BPlusTreeNode {
                constructor(isLeaf = true, order = 5) {
                    this.isLeaf = isLeaf;
                    this.keys = [];
                    this.values = isLeaf ? [] : null; // 只有叶子节点存储值
                    this.children = !isLeaf ? [] : null;
                    this.next = null; // 叶子节点链表
                    this.order = order;
                }

                isFull() {
                    return this.keys.length === this.order - 1;
                }
            }

            class BPlusTree {
                constructor(order = 5) {
                    this.root = new BPlusTreeNode(true, order);
                    this.order = order;
                    this.size = 0;
                    this.firstLeaf = this.root; // 指向第一个叶子节点，用于范围查询
                }

                insert(key, value = null) {
                    const root = this.root;

                    // 如果根节点已满，需要分裂
                    if (root.isFull()) {
                        const newRoot = new BPlusTreeNode(false, this.order);
                        newRoot.children.push(root);
                        this._splitChild(newRoot, 0);
                        this.root = newRoot;
                        this._insertNonFull(newRoot, key, value);
                    } else {
                        this._insertNonFull(root, key, value);
                    }

                    this.size++;
                }

                _insertNonFull(node, key, value) {
                    let i = node.keys.length - 1;

                    if (node.isLeaf) {
                        // 找到合适的位置插入
                        while (i >= 0 && key < node.keys[i]) {
                            i--;
                        }

                        // 如果键已存在，更新值
                        if (i >= 0 && key === node.keys[i]) {
                            node.values[i] = value;
                            this.size--; // 防止在外部重复增加大小
                            return;
                        }

                        // 插入新键值对
                        node.keys.splice(i + 1, 0, key);
                        node.values.splice(i + 1, 0, value);
                    } else {
                        // 找到合适的子节点
                        while (i >= 0 && key < node.keys[i]) {
                            i--;
                        }

                        i++;

                        // 如果子节点已满，需要分裂
                        if (node.children[i].isFull()) {
                            this._splitChild(node, i);

                            if (key > node.keys[i]) {
                                i++;
                            }
                        }

                        this._insertNonFull(node.children[i], key, value);
                    }
                }

                _splitChild(parentNode, childIndex) {
                    const order = this.order;
                    const childNode = parentNode.children[childIndex];
                    const newNode = new BPlusTreeNode(childNode.isLeaf, order);

                    // 计算中间位置
                    const midIndex = Math.floor((order - 1) / 2);

                    if (childNode.isLeaf) {
                        // B+树特性：叶子节点分裂时，中间键会同时出现在两个节点中

                        // 复制后半部分键值到新节点
                        for (let i = midIndex; i < order - 1; i++) {
                            newNode.keys.push(childNode.keys[i]);
                            newNode.values.push(childNode.values[i]);
                        }

                        // 更新原节点
                        childNode.keys.length = midIndex;
                        childNode.values.length = midIndex;

                        // 更新叶子节点链表
                        newNode.next = childNode.next;
                        childNode.next = newNode;

                        // 将新节点的第一个键插入到父节点
                        parentNode.keys.splice(childIndex, 0, newNode.keys[0]);
                        parentNode.children.splice(childIndex + 1, 0, newNode);
                    } else {
                        // 内部节点分裂

                        // 复制后半部分键到新节点
                        for (let i = midIndex + 1; i < order - 1; i++) {
                            newNode.keys.push(childNode.keys[i]);
                        }

                        // 复制后半部分子节点到新节点
                        for (let i = midIndex + 1; i < order; i++) {
                            newNode.children.push(childNode.children[i]);
                        }

                        // 提取中间键到父节点
                        const midKey = childNode.keys[midIndex];

                        // 更新原节点
                        childNode.keys.length = midIndex;
                        childNode.children.length = midIndex + 1;

                        // 将中间键插入到父节点
                        parentNode.keys.splice(childIndex, 0, midKey);
                        parentNode.children.splice(childIndex + 1, 0, newNode);
                    }
                }

                search(key) {
                    let node = this.root;

                    while (!node.isLeaf) {
                        let i = 0;

                        while (i < node.keys.length && key >= node.keys[i]) {
                            i++;
                        }

                        node = node.children[i];
                    }

                    for (let i = 0; i < node.keys.length; i++) {
                        if (node.keys[i] === key) {
                            return node.values[i];
                        }
                    }

                    return null;
                }

                // B+树的删除操作较为复杂，这里仅提供一个简化版实现
                delete(key) {
                    if (this.root.keys.length === 0) {
                        return false;
                    }

                    const result = this._deleteHelper(this.root, key);

                    // 如果根节点没有键且不是叶子节点，更新根节点
                    if (this.root.keys.length === 0 && !this.root.isLeaf) {
                        this.root = this.root.children[0];
                    }

                    if (result) {
                        this.size--;
                    }

                    return result;
                }

                _deleteHelper(node, key) {
                    if (node.isLeaf) {
                        // 在叶子节点中查找并删除键
                        for (let i = 0; i < node.keys.length; i++) {
                            if (node.keys[i] === key) {
                                node.keys.splice(i, 1);
                                node.values.splice(i, 1);
                                return true;
                            }
                        }
                        return false;
                    } else {
                        // 在内部节点查找子节点
                        let i = 0;

                        while (i < node.keys.length && key >= node.keys[i]) {
                            i++;
                        }

                        // 简化实现，不处理节点合并和再平衡
                        return this._deleteHelper(node.children[i], key);
                    }
                }

                rangeSearch(minKey, maxKey) {
                    const result = [];

                    // 先找到包含最小键的叶子节点
                    let node = this.root;

                    while (!node.isLeaf) {
                        let i = 0;

                        while (i < node.keys.length && minKey >= node.keys[i]) {
                            i++;
                        }

                        node = node.children[i];
                    }

                    // 从该叶子节点开始收集范围内的键值对
                    while (node) {
                        for (let i = 0; i < node.keys.length; i++) {
                            if (node.keys[i] >= minKey && node.keys[i] <= maxKey) {
                                result.push({key: node.keys[i], value: node.values[i]});
                            } else if (node.keys[i] > maxKey) {
                                return result;
                            }
                        }

                        node = node.next;
                    }

                    return result;
                }

                inOrderTraversal(callback) {
                    this._inOrderTraversalHelper(this.root, callback);
                }

                _inOrderTraversalHelper(node, callback) {
                    if (node.isLeaf) {
                        for (let i = 0; i < node.keys.length; i++) {
                            callback({key: node.keys[i], value: node.values[i]});
                        }
                    } else {
                        for (let i = 0; i < node.keys.length; i++) {
                            this._inOrderTraversalHelper(node.children[i], callback);
                            callback({key: node.keys[i], value: null});
                        }

                        this._inOrderTraversalHelper(node.children[node.keys.length], callback);
                    }
                }
            }

            // 1.8 线性数组 (用作基准参照)
            class LinearArray {
                constructor() {
                    this.items = [];
                    this.size = 0;
                }

                insert(key, value = null) {
                    // 查找插入位置，保持有序
                    let index = 0;

                    while (index < this.items.length && this.items[index].key < key) {
                        index++;
                    }

                    // 如果键已存在，更新值
                    if (index < this.items.length && this.items[index].key === key) {
                        this.items[index].value = value;
                        return;
                    }

                    // 插入新键值对
                    this.items.splice(index, 0, {key, value});
                    this.size++;
                }

                search(key) {
                    // 二分查找
                    let left = 0;
                    let right = this.items.length - 1;

                    while (left <= right) {
                        const mid = Math.floor((left + right) / 2);

                        if (this.items[mid].key === key) {
                            return this.items[mid].value;
                        }

                        if (this.items[mid].key < key) {
                            left = mid + 1;
                        } else {
                            right = mid - 1;
                        }
                    }

                    return null;
                }

                delete(key) {
                    // 二分查找
                    let left = 0;
                    let right = this.items.length - 1;

                    while (left <= right) {
                        const mid = Math.floor((left + right) / 2);

                        if (this.items[mid].key === key) {
                            this.items.splice(mid, 1);
                            this.size--;
                            return true;
                        }

                        if (this.items[mid].key < key) {
                            left = mid + 1;
                        } else {
                            right = mid - 1;
                        }
                    }

                    return false;
                }

                rangeSearch(minKey, maxKey) {
                    const result = [];

                    // 二分查找找到起始位置
                    let start = 0;

                    while (start < this.items.length && this.items[start].key < minKey) {
                        start++;
                    }

                    // 从起始位置收集范围内的键值对
                    while (start < this.items.length && this.items[start].key <= maxKey) {
                        result.push({key: this.items[start].key, value: this.items[start].value});
                        start++;
                    }

                    return result;
                }

                inOrderTraversal(callback) {
                    for (const item of this.items) {
                        callback(item);
                    }
                }
            }

// ====================== 2. 测试数据生成器 ======================

// 生成不同分布的测试数据
            class DataGenerator {
                // 均匀随机分布
                static uniformDistribution(size, min = 0, max = Number.MAX_SAFE_INTEGER) {
                    const data = [];

                    for (let i = 0; i < size; i++) {
                        const key = Math.floor(Math.random() * (max - min + 1)) + min;
                        data.push({key, value: `value-${key}`});
                    }

                    return data;
                }

                // 正态分布 (使用Box-Muller变换)
                static normalDistribution(size, mean = 500000, stdDev = 100000) {
                    const data = [];

                    for (let i = 0; i < size; i++) {
                        let u = 0, v = 0;
                        while (u === 0) u = Math.random();
                        while (v === 0) v = Math.random();

                        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                        const key = Math.max(0, Math.floor(mean + z * stdDev));

                        data.push({key, value: `value-${key}`});
                    }

                    return data;
                }

                // 偏斜分布 (80/20法则)
                static skewedDistribution(size, min = 0, max = Number.MAX_SAFE_INTEGER) {
                    const data = [];
                    const hotspotSize = Math.floor(max * 0.2);
                    const hotspotProbability = 0.8;

                    for (let i = 0; i < size; i++) {
                        let key;

                        if (Math.random() < hotspotProbability) {
                            // 80%的概率生成热点区域内的键
                            key = Math.floor(Math.random() * hotspotSize) + min;
                        } else {
                            // 20%的概率生成非热点区域内的键
                            key = Math.floor(Math.random() * (max - hotspotSize)) + min + hotspotSize;
                        }

                        data.push({key, value: `value-${key}`});
                    }

                    return data;
                }

                // 几乎有序的数据
                static nearSortedDistribution(size, swapFraction = 0.1) {
                    const data = [];

                    // 生成有序数据
                    for (let i = 0; i < size; i++) {
                        data.push({key: i, value: `value-${i}`});
                    }

                    // 随机交换一小部分数据
                    const swapCount = Math.floor(size * swapFraction);

                    for (let i = 0; i < swapCount; i++) {
                        const index1 = Math.floor(Math.random() * size);
                        const index2 = Math.floor(Math.random() * size);

                        const temp = data[index1].key;
                        data[index1].key = data[index2].key;
                        data[index2].key = temp;

                        data[index1].value = `value-${data[index1].key}`;
                        data[index2].value = `value-${data[index2].key}`;
                    }

                    return data;
                }

                // 完全有序数据
                static sortedDistribution(size) {
                    const data = [];

                    for (let i = 0; i < size; i++) {
                        data.push({key: i, value: `value-${i}`});
                    }

                    return data;
                }

                // 完全逆序数据
                static reverseSortedDistribution(size) {
                    const data = [];

                    for (let i = size - 1; i >= 0; i--) {
                        data.push({key: i, value: `value-${i}`});
                    }

                    return data;
                }

                // 生成Zipf分布的数据 (用于访问模式)
                static zipfDistribution(size, alpha = 1.5) {
                    const data = [];
                    const zipf = [];
                    let sum = 0;

                    // 计算Zipf权重
                    for (let i = 1; i <= size; i++) {
                        const weight = 1 / Math.pow(i, alpha);
                        zipf.push(weight);
                        sum += weight;
                    }

                    // 归一化
                    for (let i = 0; i < size; i++) {
                        zipf[i] /= sum;
                    }

                    // 生成累积分布函数
                    const cdf = [];
                    let cumsum = 0;

                    for (let i = 0; i < size; i++) {
                        cumsum += zipf[i];
                        cdf.push(cumsum);
                    }

                    // 生成数据
                    for (let i = 0; i < size; i++) {
                        const r = Math.random();
                        let index = 0;

                        while (index < size - 1 && r > cdf[index]) {
                            index++;
                        }

                        data.push({key: index, value: `value-${index}`});
                    }

                    return data;
                }
            }
        }
    }
}

// ====================== 3. 性能测试工具 ======================
class PerformanceTester {
    constructor(dataStructures, testSizes, iterations = 5) {
        this.dataStructures = dataStructures;
        this.testSizes = testSizes;
        this.iterations = iterations;
        this.results = {};
    }

    // 3.1 基准测试：CRUD操作性能
    async runCRUDTest(dataDistribution = 'uniform') {
        console.log(`\n开始 CRUD 性能测试 (数据分布: ${dataDistribution})...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            results[name] = {
                insert: [],
                search: [],
                delete: [],
                range: []
            };

            for (const size of this.testSizes) {
                console.log(`测试 ${name} 在数据量 ${size} 下的性能...`);

                let insertTimes = [];
                let searchTimes = [];
                let deleteTimes = [];
                // 继续性能测试工具的实现
                let rangeTimes = [];

                for (let i = 0; i < this.iterations; i++) {
                    let data;

                    // 根据指定的分布生成测试数据
                    switch (dataDistribution) {
                        case 'uniform':
                            data = DataGenerator.uniformDistribution(size);
                            break;
                        case 'normal':
                            data = DataGenerator.normalDistribution(size);
                            break;
                        case 'skewed':
                            data = DataGenerator.skewedDistribution(size);
                            break;
                        case 'nearSorted':
                            data = DataGenerator.nearSortedDistribution(size);
                            break;
                        case 'sorted':
                            data = DataGenerator.sortedDistribution(size);
                            break;
                        case 'reverseSorted':
                            data = DataGenerator.reverseSortedDistribution(size);
                            break;
                        default:
                            data = DataGenerator.uniformDistribution(size);
                    }

                    // 测试插入性能
                    const ds = new DataStructureClass();

                    const insertStart = performance.now();
                    for (const item of data) {
                        ds.insert(item.key, item.value);
                    }
                    const insertEnd = performance.now();
                    insertTimes.push(insertEnd - insertStart);

                    // 测试查找性能
                    const searchKeys = data.map(item => item.key);
                    searchKeys.sort(() => Math.random() - 0.5); // 打乱顺序

                    const searchStart = performance.now();
                    for (const key of searchKeys) {
                        ds.search(key);
                    }
                    const searchEnd = performance.now();
                    searchTimes.push(searchEnd - searchStart);

                    // 测试范围查询性能
                    const rangeSize = Math.floor(size * 0.1); // 查询10%的数据范围
                    const minKey = Math.floor(Math.random() * (size - rangeSize));
                    const maxKey = minKey + rangeSize;

                    const rangeStart = performance.now();
                    const rangeResult = ds.rangeSearch(minKey, maxKey);
                    const rangeEnd = performance.now();
                    rangeTimes.push(rangeEnd - rangeStart);

                    // 测试删除性能
                    const deleteKeys = [...searchKeys]; // 复制一份查找键

                    const deleteStart = performance.now();
                    for (const key of deleteKeys) {
                        ds.delete(key);
                    }
                    const deleteEnd = performance.now();
                    deleteTimes.push(deleteEnd - deleteStart);
                }

                // 计算平均性能
                results[name].insert.push({
                    size,
                    time: insertTimes.reduce((a, b) => a + b, 0) / this.iterations
                });

                results[name].search.push({
                    size,
                    time: searchTimes.reduce((a, b) => a + b, 0) / this.iterations
                });

                results[name].delete.push({
                    size,
                    time: deleteTimes.reduce((a, b) => a + b, 0) / this.iterations
                });

                results[name].range.push({
                    size,
                    time: rangeTimes.reduce((a, b) => a + b, 0) / this.iterations
                });
            }
        }

        this.results.crud = results;
        return results;
    }

    // 3.2 混合负载测试
    async runMixedLoadTest(readRatio = 0.5, dataSize = 100000, operationCount = 1000000) {
        console.log(`\n开始混合负载测试 (读写比: ${readRatio}:${1 - readRatio})...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 在混合负载下的性能...`);

            results[name] = {
                totalTime: 0,
                readTime: 0,
                writeTime: 0,
                readOps: 0,
                writeOps: 0
            };

            // 预先生成测试数据和操作序列
            const preloadData = DataGenerator.uniformDistribution(dataSize);

            // 生成操作序列
            const operations = [];
            for (let i = 0; i < operationCount; i++) {
                if (Math.random() < readRatio) {
                    // 读操作
                    operations.push({
                        type: 'read',
                        key: preloadData[Math.floor(Math.random() * dataSize)].key
                    });
                } else {
                    // 写操作 (插入或删除)
                    const isInsert = Math.random() < 0.5;
                    const key = Math.floor(Math.random() * dataSize * 2); // 可能产生新键

                    operations.push({
                        type: isInsert ? 'insert' : 'delete',
                        key,
                        value: isInsert ? `value-${key}` : null
                    });
                }
            }

            // 运行测试
            const ds = new DataStructureClass();

            // 预加载数据
            for (const item of preloadData) {
                ds.insert(item.key, item.value);
            }

            // 执行操作序列
            const totalStart = performance.now();
            let readTime = 0;
            let writeTime = 0;
            let readOps = 0;
            let writeOps = 0;

            for (const op of operations) {
                if (op.type === 'read') {
                    const start = performance.now();
                    ds.search(op.key);
                    const end = performance.now();
                    readTime += (end - start);
                    readOps++;
                } else if (op.type === 'insert') {
                    const start = performance.now();
                    ds.insert(op.key, op.value);
                    const end = performance.now();
                    writeTime += (end - start);
                    writeOps++;
                } else if (op.type === 'delete') {
                    const start = performance.now();
                    ds.delete(op.key);
                    const end = performance.now();
                    writeTime += (end - start);
                    writeOps++;
                }
            }

            const totalEnd = performance.now();

            results[name].totalTime = totalEnd - totalStart;
            results[name].readTime = readTime;
            results[name].writeTime = writeTime;
            results[name].readOps = readOps;
            results[name].writeOps = writeOps;
            results[name].readLatency = readTime / readOps;
            results[name].writeLatency = writeTime / writeOps;
            results[name].throughput = operationCount / ((totalEnd - totalStart) / 1000); // ops/sec
        }

        this.results.mixedLoad = results;
        return results;
    }

    // 3.3 范围查询测试
    async runRangeQueryTest(dataSize = 1000000, rangeSizes = [0.001, 0.01, 0.1, 0.5]) {
        console.log(`\n开始范围查询测试...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 在范围查询下的性能...`);

            results[name] = {
                ranges: []
            };

            // 生成测试数据
            const data = DataGenerator.uniformDistribution(dataSize);

            // 加载数据
            const ds = new DataStructureClass();
            for (const item of data) {
                ds.insert(item.key, item.value);
            }

            // 测试不同范围大小的查询性能
            for (const rangeFraction of rangeSizes) {
                const rangeSize = Math.floor(dataSize * rangeFraction);
                const times = [];

                for (let i = 0; i < this.iterations; i++) {
                    const minKey = Math.floor(Math.random() * (dataSize - rangeSize));
                    const maxKey = minKey + rangeSize;

                    const start = performance.now();
                    const result = ds.rangeSearch(minKey, maxKey);
                    const end = performance.now();

                    times.push({
                        time: end - start,
                        resultSize: result.length
                    });
                }

                // 计算平均性能
                const avgTime = times.reduce((a, b) => a + b.time, 0) / this.iterations;
                const avgResultSize = Math.floor(times.reduce((a, b) => a + b.resultSize, 0) / this.iterations);

                results[name].ranges.push({
                    rangeFraction,
                    expectedSize: rangeSize,
                    actualSize: avgResultSize,
                    time: avgTime
                });
            }
        }

        this.results.rangeQuery = results;
        return results;
    }

    // 3.4 顺序访问vs随机访问测试
    async runAccessPatternTest(dataSize = 100000, operationCount = 1000000) {
        console.log(`\n开始访问模式测试...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`测试 ${name} 在不同访问模式下的性能...`);

            results[name] = {
                sequential: 0,
                random: 0,
                zipf: 0
            };

            // 生成测试数据
            const data = DataGenerator.sortedDistribution(dataSize);

            // 加载数据
            const ds = new DataStructureClass();
            for (const item of data) {
                ds.insert(item.key, item.value);
            }

            // 测试顺序访问
            const sequentialStart = performance.now();
            for (let i = 0; i < Math.min(operationCount, dataSize); i++) {
                ds.search(i);
            }
            const sequentialEnd = performance.now();
            results[name].sequential = sequentialEnd - sequentialStart;

            // 测试随机访问
            const randomKeys = [];
            for (let i = 0; i < operationCount; i++) {
                randomKeys.push(Math.floor(Math.random() * dataSize));
            }

            const randomStart = performance.now();
            for (const key of randomKeys) {
                ds.search(key);
            }
            const randomEnd = performance.now();
            results[name].random = randomEnd - randomStart;

            // 测试Zipf分布访问 (热点访问)
            const zipfData = DataGenerator.zipfDistribution(operationCount, 1.5);

            const zipfStart = performance.now();
            for (const item of zipfData) {
                ds.search(item.key % dataSize); // 确保键在有效范围内
            }
            const zipfEnd = performance.now();
            results[name].zipf = zipfEnd - zipfStart;
        }

        this.results.accessPattern = results;
        return results;
    }

    // 3.5 内存使用测试 (近似值，JavaScript中无法准确测量)
    estimateMemoryUsage(dataSize = 100000) {
        console.log(`\n估计内存使用...`);

        const results = {};

        for (const [name, DataStructureClass] of Object.entries(this.dataStructures)) {
            console.log(`估计 ${name} 的内存使用...`);

            // 生成测试数据
            const data = DataGenerator.uniformDistribution(dataSize);

            // 在插入数据前获取内存基准
            if (global.gc) {
                global.gc(); // 强制垃圾回收
            }

            const memBefore = process.memoryUsage().heapUsed;

            // 加载数据
            const ds = new DataStructureClass();
            for (const item of data) {
                ds.insert(item.key, item.value);
            }

            // 插入数据后获取内存使用
            if (global.gc) {
                global.gc(); // 强制垃圾回收
            }

            const memAfter = process.memoryUsage().heapUsed;

            // 估计每个节点的内存使用
            const totalMem = memAfter - memBefore;
            const perNodeMem = totalMem / dataSize;

            results[name] = {
                totalMemory: totalMem,
                perNodeMemory: perNodeMem
            };
        }

        this.results.memory = results;
        return results;
    }

    // 生成性能报告
    generateReport() {
        if (!this.results.crud) {
            return "请先运行测试";
        }

        let report = "# 数据结构性能对比报告\n\n";

        // CRUD性能报告
        report += "## CRUD操作性能\n\n";

        for (const operation of ['insert', 'search', 'delete', 'range']) {
            report += `### ${operation} 操作\n\n`;
            report += "| 数据结构 | ";

            // 添加表头 (数据大小)
            for (const size of this.testSizes) {
                report += `${size} | `;
            }
            report += "\n";

            // 添加表头分隔符
            report += "| --- | ";
            for (let i = 0; i < this.testSizes.length; i++) {
                report += "--- | ";
            }
            report += "\n";

            // 添加表格内容
            for (const [name, results] of Object.entries(this.results.crud)) {
                report += `| ${name} | `;

                for (const result of results[operation]) {
                    report += `${result.time.toFixed(2)}ms | `;
                }

                report += "\n";
            }

            report += "\n";
        }

        // 混合负载测试报告
        if (this.results.mixedLoad) {
            report += "## 混合负载测试\n\n";
            report += "| 数据结构 | 总时间 (ms) | 读延迟 (ms) | 写延迟 (ms) | 吞吐量 (ops/s) |\n";
            report += "| --- | --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.mixedLoad)) {
                report += `| ${name} | ${results.totalTime.toFixed(2)} | ${results.readLatency.toFixed(4)} | ${results.writeLatency.toFixed(4)} | ${results.throughput.toFixed(2)} |\n`;
            }

            report += "\n";
        }

        // 范围查询测试报告
        if (this.results.rangeQuery) {
            report += "## 范围查询测试\n\n";

            for (const rangeFraction of [0.001, 0.01, 0.1, 0.5]) {
                report += `### 范围大小: ${rangeFraction * 100}%\n\n`;
                report += "| 数据结构 | 查询时间 (ms) | 结果集大小 |\n";
                report += "| --- | --- | --- |\n";

                for (const [name, results] of Object.entries(this.results.rangeQuery)) {
                    const result = results.ranges.find(r => r.rangeFraction === rangeFraction);
                    if (result) {
                        report += `| ${name} | ${result.time.toFixed(2)} | ${result.actualSize} |\n`;
                    }
                }

                report += "\n";
            }
        }

        // 访问模式测试报告
        if (this.results.accessPattern) {
            report += "## 访问模式测试\n\n";
            report += "| 数据结构 | 顺序访问 (ms) | 随机访问 (ms) | 热点访问 (ms) |\n";
            report += "| --- | --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.accessPattern)) {
                report += `| ${name} | ${results.sequential.toFixed(2)} | ${results.random.toFixed(2)} | ${results.zipf.toFixed(2)} |\n`;
            }

            report += "\n";
        }

        // 内存使用报告
        if (this.results.memory) {
            report += "## 内存使用估计\n\n";
            report += "| 数据结构 | 总内存 (bytes) | 每节点内存 (bytes) |\n";
            report += "| --- | --- | --- |\n";

            for (const [name, results] of Object.entries(this.results.memory)) {
                report += `| ${name} | ${results.totalMemory} | ${results.perNodeMemory.toFixed(2)} |\n`;
            }

            report += "\n";
        }

        // 总结与建议
        report += "## 性能总结与应用场景建议\n\n";

        // 分析CRUD操作性能
        const crudResults = this.results.crud;

        // 找出每种操作下性能最好的数据结构
        const bestForOperations = {};

        for (const operation of ['insert', 'search', 'delete', 'range']) {
            bestForOperations[operation] = {};

            for (const size of this.testSizes) {
                let bestTime = Infinity;
                let bestName = '';

                for (const [name, results] of Object.entries(crudResults)) {
                    const result = results[operation].find(r => r.size === size);
                    if (result && result.time < bestTime) {
                        bestTime = result.time;
                        bestName = name;
                    }
                }

                bestForOperations[operation][size] = {name: bestName, time: bestTime};
            }
        }

        // 生成总结
        report += "### 各操作性能最优的数据结构\n\n";

        for (const operation of ['insert', 'search', 'delete', 'range']) {
            report += `#### ${operation} 操作\n\n`;

            for (const size of this.testSizes) {
                const best = bestForOperations[operation][size];
                report += `- 数据量 ${size}: ${best.name} (${best.time.toFixed(2)}ms)\n`;
            }

            report += "\n";
        }

        // 根据性能特点推荐应用场景
        report += "### 应用场景推荐\n\n";

        const scenarios = [
            {
                name: "读密集型应用",
                description: "查询操作远多于修改操作的场景",
                recommendation: this._getRecommendationForScenario('search')
            },
            {
                name: "写密集型应用",
                description: "频繁插入和更新的场景",
                recommendation: this._getRecommendationForScenario('insert')
            },
            {
                name: "范围查询密集型应用",
                description: "需要频繁执行范围查询的场景",
                recommendation: this._getRecommendationForScenario('range')
            },
            {
                name: "平衡读写应用",
                description: "读写操作比例接近的场景",
                recommendation: this._getOverallRecommendation()
            }
        ];

        for (const scenario of scenarios) {
            report += `#### ${scenario.name}\n\n`;
            report += `${scenario.description}\n\n`;
            report += `推荐数据结构: ${scenario.recommendation}\n\n`;
        }

        return report;
    }

    // 辅助方法：根据特定操作获取推荐
    _getRecommendationForScenario(operation) {
        const scoreMap = {};

        for (const [name] of Object.entries(this.dataStructures)) {
            scoreMap[name] = 0;
        }

        // 为最大数据量的性能赋予更高权重
        const maxSize = Math.max(...this.testSizes);

        for (const [name, results] of Object.entries(this.results.crud)) {
            for (const result of results[operation]) {
                // 计算性能得分，时间越短越好
                const score = 1 / result.time;
                // 权重与数据量成正比
                const weight = result.size / maxSize;

                scoreMap[name] += score * weight;
            }
        }

        // 找出得分最高的数据结构
        let bestName = '';
        let bestScore = -Infinity;

        for (const [name, score] of Object.entries(scoreMap)) {
            if (score > bestScore) {
                bestScore = score;
                bestName = name;
            }
        }

        return bestName;
    }

    // 辅助方法：获取综合性能推荐
    _getOverallRecommendation() {
        const scoreMap = {};

        for (const [name] of Object.entries(this.dataStructures)) {
            scoreMap[name] = 0;
        }

        // 考虑CRUD所有操作
        for (const operation of ['insert', 'search', 'delete', 'range']) {
            // 为不同操作分配不同权重
            let operationWeight;

            switch (operation) {
                case 'insert':
                    operationWeight = 0.25;
                    break;
                case 'search':
                    operationWeight = 0.35;
                    break;
                case 'delete':
                    operationWeight = 0.15;
                    break;
                case 'range':
                    operationWeight = 0.25;
                    break;
                default:
                    operationWeight = 0.25;
            }

            for (const [name, results] of Object.entries(this.results.crud)) {
                for (const result of results[operation]) {
                    // 计算性能得分，时间越短越好
                    const score = 1 / result.time;
                    // 权重与数据量和操作类型相关
                    const weight = (result.size / Math.max(...this.testSizes)) * operationWeight;

                    scoreMap[name] += score * weight;
                }
            }
        }

        // 如果有混合负载测试结果，也考虑进来
        if (this.results.mixedLoad) {
            for (const [name, results] of Object.entries(this.results.mixedLoad)) {
                // 考虑吞吐量
                const throughputScore = results.throughput / 10000; // 标准化
                scoreMap[name] += throughputScore;
            }
        }

        // 找出得分最高的数据结构
        let bestName = '';
        let bestScore = -Infinity;

        for (const [name, score] of Object.entries(scoreMap)) {
            if (score > bestScore) {
                bestScore = score;
                bestName = name;
            }
        }

        return bestName;
    }
}

// ====================== 4. 主测试程序 ======================

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
const testSizes = [100, 1000, 10000, 100000];

// 创建性能测试器
const tester = new PerformanceTester(dataStructures, testSizes, 3);

// 运行测试并生成报告的主函数
async function runTests() {
    console.log("开始数据结构性能对比测试...");

    // 运行CRUD测试 (多种数据分布)
    await tester.runCRUDTest('uniform');
    await tester.runCRUDTest('sorted');
    await tester.runCRUDTest('skewed');

    // 运行混合负载测试 (多种读写比例)
    await tester.runMixedLoadTest(0.95); // 读密集型
    await tester.runMixedLoadTest(0.5);  // 平衡型
    await tester.runMixedLoadTest(0.3);  // 写密集型

    // 运行范围查询测试
    await tester.runRangeQueryTest();

    // 运行访问模式测试
    await tester.runAccessPatternTest();

    // 估计内存使用
    // 注意: 在浏览器环境中可能无法准确测量
    // tester.estimateMemoryUsage();

    // 生成性能报告
    const report = tester.generateReport();
    console.log("测试完成，生成报告...");

    // 将报告写入文件
    fs.writeFileSync('data_structure_performance_report.md', report);
    console.log("报告已保存到 data_structure_performance_report.md");

    return report;
}

// ====================== 5. 数据可视化 ======================

// 在实际应用中，可以使用如下库进行数据可视化：
// - Chart.js (浏览器)
// - D3.js (浏览器)
// - plotly.js (浏览器/Node.js)
// - node-canvas + Chart.js (Node.js)

// 简单的ASCII图表生成函数
function generateASCIIChart(title, data, maxWidth = 50) {
    let output = `\n${title}\n`;
    output += "=" + "=".repeat(title.length) + "\n\n";

    // 找出最大值以进行缩放
    const maxValue = Math.max(...Object.values(data));
    const scaleFactor = maxWidth / maxValue;

    // 为每个条目生成条形
    for (const [label, value] of Object.entries(data)) {
        const barLength = Math.round(value * scaleFactor);
        const bar = "#".repeat(barLength);
        output += `${label.padEnd(15)} | ${"#".repeat(barLength)} (${value.toFixed(2)})\n`;
    }

    return output;
}

// ====================== 6. 具体执行步骤 ======================

// 为了在Node.js环境中运行此代码，需要以下步骤：
/*
1. 创建项目目录并初始化npm
   mkdir data-structure-performance
   cd data-structure-performance
   npm init -y

2. 安装所需依赖（如果需要）
   npm install chart.js canvas

3. 将以上代码保存为 data_structure_test.js

4. 运行测试
   node --expose-gc data_structure_test.js
   (--expose-gc 参数允许手动触发垃圾回收以进行内存测量)
*/

// 如果作为模块导出供其他程序使用
module.exports = {
    // 数据结构实现
    RedBlackTree,
    AVLTree,
    SkipList,
    HashTable,
    BinarySearchTree,
    BTree,
    BPlusTree,
    LinearArray,

    // 测试工具
    DataGenerator,
    PerformanceTester,

    // 主测试函数
    runTests
};

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runTests().catch(console.error);
}


//