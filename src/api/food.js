import axios from "axios";

// 使用真实的英文 API
const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// 缓存key
const CACHE_KEY = 'foodMenuCache';
const CACHE_TIME_KEY = 'foodMenuCacheTime';

/**
 * 批量获取菜品 - 通过按首字母搜索获取更多菜品
 * 策略: 按首字母批量获取(a-z),API会返回完整的菜品信息
 */
const fetchFoodListFromAPI = async () => {
  const allMeals = new Map(); // 使用Map去重,key为idMeal

  // 按首字母批量获取 (选择常见的首字母)
  // search.php?f={letter} 返回完整的菜品信息
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'w'];

  // 并行请求所有首字母
  const letterRequests = letters.map(letter =>
    axios.get(`${API_BASE_URL}/search.php?f=${letter}`)
      .then(res => {
        console.log(`首字母 ${letter} 获取到 ${res.data.meals?.length || 0} 个菜品`);
        return res.data.meals || [];
      })
      .catch(err => {
        console.error(`首字母 ${letter} 请求失败:`, err.message);
        return [];
      })
  );

  // 等待所有请求完成
  const results = await Promise.all(letterRequests);

  // 合并所有结果并去重
  results.forEach(meals => {
    meals.forEach(meal => {
      if (meal.idMeal && !allMeals.has(meal.idMeal)) {
        allMeals.set(meal.idMeal, meal);
      }
    });
  });

  const mealsList = Array.from(allMeals.values());

  console.log(`✅ 成功获取 ${mealsList.length} 个菜品`);

  if (mealsList.length === 0) {
    throw new Error("暂无数据");
  }

  // 打乱顺序,让菜品显示更随机
  const shuffled = mealsList.sort(() => Math.random() - 0.5);

  // 返回前200个菜品
  return shuffled.slice(0, 200);
};

/**
 * 获取菜品列表 - 优先从缓存读取
 * @param {boolean} forceRefresh - 是否强制刷新(忽略缓存)
 */
export const getFoodList = async (forceRefresh = false) => {
  try {
    // 如果不是强制刷新,尝试从缓存读取
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cacheTime) {
        console.log('📦 从缓存加载菜品');
        return JSON.parse(cachedData);
      }
    }

    // 从API获取新数据
    console.log('🔄 正在批量导入菜品...');
    const freshData = await fetchFoodListFromAPI();

    // 保存到缓存
    localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    return freshData;
  } catch (error) {
    console.error('获取菜品列表失败:', error);
    throw new Error("数据获取失败");
  }
};

/**
 * 清除菜品缓存
 */
export const clearFoodCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
};

export const getFoodDetail = async (id) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/lookup.php?i=${id}`);
    if (!res.data.meals) {
      throw new Error("未找到该美食");
    }
    return res.data.meals[0];
  } catch (error) {
    throw new Error("详情获取失败");
  }
};
