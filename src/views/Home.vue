<template>
    <div class="page">
        <div class="header">
            <h1>美食菜单</h1>
            <p class="subtitle">探索世界各地的美味佳肴</p>
        </div>

        <!-- 菜品统计信息 -->
        <div class="info-bar" v-if="foodList.length > 0">
            <span class="info-badge">📊 当前共 {{ foodList.length }} 道菜品</span>
        </div>

        <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
        </div>

        <div v-else-if="error" class="error">
            <div class="error-icon">⚠️</div>
            <p>{{ error }}</p>
            <button @click="retry" class="retry-btn">重试</button>
        </div>

        <div v-else class="list">
            <FoodCard v-for="item in foodList" :key="item.idMeal" :food="item" />
        </div>

        <TabBar />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getFoodList } from '../api/food'
import FoodCard from '../components/FoodCard.vue'
import TabBar from '../components/TabBar.vue'

const foodList = ref([])
const loading = ref(false)
const error = ref('')

// 加载美食列表
const loadFoodList = async (forceRefresh = false) => {
    loading.value = true
    error.value = ''
    try {
        foodList.value = await getFoodList(forceRefresh)
    } catch (e) {
        error.value = e.message || '数据获取失败,请稍后重试'
    } finally {
        loading.value = false
    }
}

// 批量导入新菜单
const handleBatchImport = async () => {
    if (loading.value) return

    try {
        // 显示加载状态
        loading.value = true
        error.value = ''

        // 强制刷新,忽略缓存
        foodList.value = await getFoodList(true)
        showToast('✅ 菜单已更新!')
    } catch (e) {
        error.value = e.message || '导入失败,请稍后重试'
        showToast('❌ 导入失败')
    } finally {
        loading.value = false
    }
}

// 监听批量导入事件
const onBatchImport = () => {
    handleBatchImport()
}

// 重试
const retry = () => {
    loadFoodList()
}

// 简单的提示功能
const showToast = (message) => {
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
        toast.classList.add('show')
    }, 10)

    setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => {
            document.body.removeChild(toast)
        }, 300)
    }, 2000)
}

onMounted(() => {
    loadFoodList()
    // 监听批量导入事件
    window.addEventListener('batch-import', onBatchImport)
})

onUnmounted(() => {
    window.removeEventListener('batch-import', onBatchImport)
})
</script>

<style scoped>
.header {
    text-align: center;
    padding: 20px 10px 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    margin: -10px -10px 20px;
}

.header h1 {
    margin: 0 0 5px 0;
    font-size: 28px;
}

.subtitle {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
}

/* 信息栏 */
.info-bar {
    text-align: center;
    margin-bottom: 20px;
}

.info-badge {
    display: inline-block;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.loading {
    text-align: center;
    padding: 60px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 20px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading p {
    color: #666;
    font-size: 16px;
}

.error {
    text-align: center;
    padding: 60px 20px;
}

.error-icon {
    font-size: 60px;
    margin-bottom: 20px;
}

.error p {
    color: #f56c6c;
    font-size: 16px;
    margin-bottom: 20px;
}

.retry-btn {
    padding: 10px 30px;
    background: #667eea;
    color: #fff;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.retry-btn:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

/* Toast 提示样式 */
:global(.toast) {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 12px 24px;
    border-radius: 20px;
    font-size: 14px;
    opacity: 0;
    transition: all 0.3s;
    z-index: 9999;
}

:global(.toast.show) {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}
</style>
