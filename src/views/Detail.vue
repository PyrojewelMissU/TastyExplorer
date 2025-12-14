<template>
    <div class="page detail-page">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="food" class="detail-container">
            <!-- 返回按钮 -->
            <div class="header">
                <button class="back-btn" @click="$router.back()">返回</button>
                <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite">
                    {{ isFavorite ? '已收藏' : '收藏' }}
                </button>
            </div>

            <!-- 美食图片 -->
            <div class="image-container">
                <img :src="food.strMealThumb" :alt="food.strMeal" />
            </div>

            <!-- 美食信息 -->
            <div class="info-section">
                <h1>{{ translatedName }}</h1>
                <div class="tags">
                    <span class="tag">{{ translatedCategory }}</span>
                    <span class="tag">{{ translatedArea }}</span>
                </div>
            </div>

            <!-- 配料列表 -->
            <div class="section">
                <h2>所需配料</h2>
                <ul class="ingredients-list">
                    <li v-for="(ingredient, index) in ingredients" :key="index">
                        <span class="ingredient-name">{{ ingredient.name }}</span>
                        <span class="ingredient-measure">{{ ingredient.measure }}</span>
                    </li>
                </ul>
            </div>

            <!-- 制作步骤 -->
            <div class="section">
                <h2>制作步骤</h2>
                <p class="instructions" v-if="translatedInstructions">{{ translatedInstructions }}</p>
                <p class="instructions loading-text" v-else>正在翻译制作步骤...</p>
            </div>
        </div>

        <TabBar />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFoodDetail } from '../api/food'
import TabBar from '../components/TabBar.vue'
import { translateMealName, translateCategory, translateArea, translateIngredient } from '../utils/translate'

const route = useRoute()
const food = ref(null)
const loading = ref(false)
const error = ref('')

// 翻译的数据
const translatedName = ref('')
const translatedCategory = ref('')
const translatedArea = ref('')
const translatedInstructions = ref('')
const ingredients = ref([])

// 加载翻译数据
const loadTranslations = async () => {
    if (!food.value) return

    // 并行翻译标题、分类和地区
    const [name, category, area] = await Promise.all([
        translateMealName(food.value.strMeal),
        translateCategory(food.value.strCategory),
        translateArea(food.value.strArea)
    ])

    translatedName.value = name
    translatedCategory.value = category
    translatedArea.value = area

    // 翻译制作步骤 - 分句处理以提高成功率
    if (food.value.strInstructions) {
        try {
            const { translateText } = await import('../utils/translationAPI')
            const instructions = food.value.strInstructions

            // 按句子分割(以句号、问号、感叹号分割)
            const sentences = instructions.split(/(?<=[.!?])\s+/)

            // 如果文本太长,分批翻译
            if (instructions.length > 500) {
                const translatedSentences = []
                for (let i = 0; i < sentences.length; i++) {
                    try {
                        const translated = await translateText(sentences[i].trim(), 'en', 'zh-CN')
                        translatedSentences.push(translated)
                    } catch (err) {
                        console.error(`翻译句子 ${i + 1} 失败:`, err)
                        translatedSentences.push(sentences[i]) // 失败时使用原文
                    }
                }
                translatedInstructions.value = translatedSentences.join(' ')
            } else {
                // 短文本直接翻译
                translatedInstructions.value = await translateText(instructions, 'en', 'zh-CN')
            }
        } catch (error) {
            console.error('制作步骤翻译失败:', error)
            translatedInstructions.value = food.value.strInstructions || ''
        }
    }

    // 收集配料
    const ingredientsList = []
    for (let i = 1; i <= 20; i++) {
        const ingredient = food.value[`strIngredient${i}`]
        const measure = food.value[`strMeasure${i}`]
        if (ingredient && ingredient.trim()) {
            ingredientsList.push({
                name: ingredient,
                measure: measure || ''
            })
        }
    }

    // 异步翻译所有配料
    ingredients.value = await Promise.all(
        ingredientsList.map(async (item) => ({
            name: await translateIngredient(item.name),
            measure: item.measure
        }))
    )
}

// 检查是否已收藏
const isFavorite = computed(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []
    return favorites.some(item => item.idMeal === food.value?.idMeal)
})

// 切换收藏状态
const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []
    const index = favorites.findIndex(item => item.idMeal === food.value.idMeal)

    if (index > -1) {
        // 已收藏,取消收藏
        favorites.splice(index, 1)
        showToast('已取消收藏')
    } else {
        // 未收藏,添加收藏
        favorites.push(food.value)
        showToast('已添加到收藏')
    }

    localStorage.setItem('favorites', JSON.stringify(favorites))
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

// 加载美食详情
onMounted(async () => {
    loading.value = true
    try {
        const id = route.params.id
        food.value = await getFoodDetail(id)
        if (!food.value) {
            error.value = '未找到该美食'
        } else {
            // 加载翻译
            await loadTranslations()
        }
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.detail-page {
    background: #fff;
}

.loading, .error {
    text-align: center;
    padding: 40px 20px;
    font-size: 16px;
    color: #666;
}

.error {
    color: #f56c6c;
}

.detail-container {
    padding-bottom: 60px;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.back-btn, .favorite-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.back-btn {
    background: #f0f0f0;
    color: #333;
}

.back-btn:hover {
    background: #e0e0e0;
}

.favorite-btn {
    background: #ddd;
    color: #666;
}

.favorite-btn.active {
    background: #ff6b6b;
    color: #fff;
}

.favorite-btn:hover {
    transform: scale(1.05);
}

.image-container {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-section {
    padding: 20px;
}

.info-section h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #333;
}

.tags {
    display: flex;
    gap: 10px;
}

.tag {
    padding: 4px 12px;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 12px;
    font-size: 12px;
}

.section {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
}

.section h2 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #333;
}

.ingredients-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.ingredients-list li {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 8px;
}

.ingredient-name {
    font-weight: 500;
    color: #333;
}

.ingredient-measure {
    color: #666;
}

.instructions {
    line-height: 1.8;
    color: #555;
    white-space: pre-line;
}

.loading-text {
    color: #999;
    font-style: italic;
}

.youtube-link {
    display: inline-block;
    padding: 10px 20px;
    background: #ff0000;
    color: #fff;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.3s;
}

.youtube-link:hover {
    background: #cc0000;
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

/* 响应式设计 */
@media (min-width: 768px) {
    .detail-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .image-container {
        max-height: 400px;
    }
}
</style>
