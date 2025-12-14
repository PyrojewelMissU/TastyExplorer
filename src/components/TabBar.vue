<template>
    <div class="tab-bar">
        <div class="tab-bar-container">
            <router-link to="/" class="tab" active-class="active">
                <span class="icon">🏠</span>
                <span class="label">首页</span>
            </router-link>
            <router-link to="/favorite" class="tab" active-class="active">
                <span class="icon">❤️</span>
                <span class="label">收藏</span>
            </router-link>
            <div class="tab import-tab" @click="handleImport">
                <span class="icon">🔄</span>
                <span class="label">导入菜单</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const handleImport = () => {
    // 触发自定义事件,通知Home组件执行批量导入
    window.dispatchEvent(new CustomEvent('batch-import'))
}
</script>

<style scoped>
.tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #eee;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.tab-bar-container {
    display: flex;
    width: 100%;
    margin: 0 auto;
}

.tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    text-decoration: none;
    color: #999;
    transition: all 0.3s;
    cursor: pointer;
}

.tab:active {
    background-color: #f8f8f8;
}

.tab.active {
    color: #667eea;
}

/* 导入按钮特殊样式 */
.import-tab {
    color: #764ba2;
    font-weight: 500;
}

.import-tab:hover {
    background-color: #f8f8f8;
}

.import-tab:active {
    background-color: #f0f0f0;
}

.icon {
    font-size: 20px;
    margin-bottom: 4px;
    transition: transform 0.3s;
}

.tab.active .icon {
    transform: scale(1.2);
}

.import-tab .icon {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.label {
    font-size: 12px;
}

/* 响应式设计 - 平板和桌面端 */
@media (min-width: 768px) {
    .tab-bar-container {
        max-width: 600px;
    }
}
</style>
