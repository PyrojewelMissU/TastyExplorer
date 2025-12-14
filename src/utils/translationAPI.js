/**
 * 翻译服务 - 使用免费翻译API
 */

// 缓存翻译结果,避免重复请求
const translationCache = new Map();

/**
 * 使用 MyMemory 免费翻译API (无需密钥)
 * 限制: 每天1000次请求
 */
const translateWithMyMemory = async (text, fromLang = 'en', toLang = 'zh') => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }
    return null;
  } catch (error) {
    console.error('MyMemory翻译失败:', error);
    return null;
  }
};

/**
 * 使用 LibreTranslate 免费翻译API (无需密钥)
 * 完全免费开源
 */
const translateWithLibre = async (text, fromLang = 'en', toLang = 'zh') => {
  try {
    const url = 'https://libretranslate.de/translate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text'
      })
    });
    const data = await response.json();

    if (data.translatedText) {
      return data.translatedText;
    }
    return null;
  } catch (error) {
    console.error('LibreTranslate翻译失败:', error);
    return null;
  }
};

/**
 * 主翻译函数 - 带缓存和降级策略
 */
export const translateText = async (text, fromLang = 'en', toLang = 'zh-CN') => {
  if (!text || typeof text !== 'string') return text;

  // 去除首尾空格
  const trimmedText = text.trim();
  if (!trimmedText) return text;

  // 检查缓存
  const cacheKey = `${fromLang}:${toLang}:${trimmedText}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // 尝试使用 MyMemory API
    let translated = await translateWithMyMemory(trimmedText, fromLang, 'zh');

    // 如果 MyMemory 失败,尝试 LibreTranslate
    if (!translated) {
      translated = await translateWithLibre(trimmedText, fromLang, 'zh');
    }

    // 如果翻译成功,缓存结果
    if (translated) {
      translationCache.set(cacheKey, translated);
      return translated;
    }

    // 所有API都失败,返回原文
    return text;
  } catch (error) {
    console.error('翻译失败:', error);
    return text;
  }
};

/**
 * 批量翻译函数 - 优化性能
 */
export const translateBatch = async (texts, fromLang = 'en', toLang = 'zh-CN') => {
  const results = await Promise.all(
    texts.map(text => translateText(text, fromLang, toLang))
  );
  return results;
};

/**
 * 清除翻译缓存
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * 获取缓存大小
 */
export const getCacheSize = () => {
  return translationCache.size;
};
