<template>
    <div class="card">
        <div class="card-image" @click="$router.push(`/detail/${food.idMeal}`)">
            <img :src="food.strMealThumb" :alt="translatedName" />
        </div>
        <div class="card-content">
            <p class="card-title" @click="$router.push(`/detail/${food.idMeal}`)">
                {{ translatedName }}
            </p>
            <button class="favorite-icon" :class="{ active: isFavorite }" @click="toggleFavorite">
                {{ isFavorite ? '♥' : '♡' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { translateMealName } from '../utils/translate'

const props = defineProps(['food'])

// 翻译的菜品名称
const translatedName = ref(props.food.strMeal)

// 异步加载翻译
onMounted(async () => {
    translatedName.value = await translateMealName(props.food.strMeal)
})

// 检查是否已收藏
const isFavorite = ref(false)

const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []
    isFavorite.value = favorites.some(item => item.idMeal === props.food.idMeal)
}

onMounted(() => {
    checkFavorite()
})

// 切换收藏状态
const toggleFavorite = (e) => {
    e.stopPropagation() // 防止触发跳转
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []
    const index = favorites.findIndex(item => item.idMeal === props.food.idMeal)

    if (index > -1) {
        favorites.splice(index, 1)
    } else {
        favorites.push(props.food)
    }

    localStorage.setItem('favorites', JSON.stringify(favorites))
    checkFavorite()

    // 触发存储事件,让其他组件知道收藏变化
    window.dispatchEvent(new Event('storage'))
}
</script>

<style scoped>
.card {
    width: 48%;
    margin-bottom: 15px;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
    width: 100%;
    height: 150px;
    overflow: hidden;
    cursor: pointer;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.card:hover .card-image img {
    transform: scale(1.1);
}

.card-content {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.favorite-icon {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #ddd;
    transition: all 0.3s;
    padding: 0;
    margin-left: 10px;
}

.favorite-icon.active {
    color: #ff6b6b;
    animation: heartbeat 0.3s;
}

.favorite-icon:hover {
    transform: scale(1.2);
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
}

/* 响应式设计 */
@media (min-width: 768px) {
    .card {
        width: 31%;
    }

    .card-image {
        height: 180px;
    }
}
</style>
