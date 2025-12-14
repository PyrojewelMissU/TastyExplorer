<template>
    <div class="page">
        <h2>我的收藏</h2>

        <div v-if="favorites.length === 0" class="empty-state">
            <div class="empty-icon">♡</div>
            <p>暂无收藏</p>
            <button class="browse-btn" @click="$router.push('/')">去浏览美食</button>
        </div>

        <div v-else class="list">
            <FoodCard v-for="item in favorites" :key="item.idMeal" :food="item" />
        </div>

        <TabBar />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FoodCard from '../components/FoodCard.vue'
import TabBar from '../components/TabBar.vue'

const favorites = ref([])

// 加载收藏列表
const loadFavorites = () => {
    favorites.value = JSON.parse(localStorage.getItem('favorites')) || []
}

// 监听storage事件,实时更新收藏列表
const handleStorageChange = () => {
    loadFavorites()
}

onMounted(() => {
    loadFavorites()
    window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 80px;
    color: #ddd;
    margin-bottom: 20px;
}

.empty-state p {
    color: #999;
    font-size: 16px;
    margin-bottom: 20px;
}

.browse-btn {
    padding: 10px 30px;
    background: #ff6b6b;
    color: #fff;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.browse-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}
</style>
