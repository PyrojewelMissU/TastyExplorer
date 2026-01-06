# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TastyExplorer (美味探索家) is a Vue 3 mobile-first food menu application that displays international meals from TheMealDB API with Chinese-English bilingual support. The app features batch importing, intelligent translation, offline caching, and favorites management.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Architecture

### Core Technology Stack
- **Vue 3** with Composition API (`<script setup>`)
- **Vue Router** with hash history mode
- **Vite** 5.0+ as build tool
- **Axios** for API requests
- No state management library (uses localStorage for persistent data)

### Key Architectural Patterns

**Batch Import System** ([src/api/food.js](src/api/food.js)):
- Fetches meals by searching 20 first letters (a-z) in parallel using `search.php?f={letter}`
- Uses `Promise.all()` for concurrent requests
- Deduplicates using Map with `idMeal` as key
- Randomizes and returns top 200 meals
- Implements localStorage caching with keys `foodMenuCache` and `foodMenuCacheTime`

**Translation System**:
- **Local Dictionary** ([src/utils/translate.js](src/utils/translate.js)): 200+ meal names, 300+ ingredients, categories, and areas
- **Dual API Fallback** ([src/utils/translationAPI.js](src/utils/translationAPI.js)): MyMemory API (primary) → LibreTranslate (fallback)
- **In-memory Cache**: Map-based cache to avoid redundant API calls
- **Translation Functions**: `translateMealName()`, `translateCategory()`, `translateArea()`, `translateIngredient()`
- Strategy: Check local dictionary first, then call API, return original text on failure

**Data Flow**:
1. Home view checks cache on mount → if empty, triggers batch import
2. Batch import fetches from 20 API endpoints in parallel → dedupes → caches → displays
3. Meal names translated asynchronously after display
4. Detail view receives `idMeal` via route param → fetches full details → translates all fields (name, category, area, ingredients 1-20, instructions)
5. Favorites stored in localStorage with key `'favorites'` as array of full meal objects
6. Cross-component sync via `storage` event on localStorage changes

**Routing Structure** ([src/router/index.js](src/router/index.js)):
- `/` - Home page with meal list
- `/detail/:id` - Detail view (expects `idMeal` as route param)
- `/favorite` - Favorites list

**Component Organization**:
- `views/Home.vue` - Handles batch import, caching, displays meal grid
- `views/Detail.vue` - Fetches meal by ID, translates all fields, parses 20 ingredient/measure pairs
- `views/Favorite.vue` - Reads from localStorage `'favorites'` key
- `components/FoodCard.vue` - Presentational card, receives meal as prop
- `components/TabBar.vue` - Bottom navigation with Home/Favorite/Import tabs

**API Integration**:
- Base URL: `https://www.themealdb.com/api/json/v1/1`
- Batch fetch: `GET /search.php?f={letter}` for letters a-z (20 requests)
- Detail fetch: `GET /lookup.php?i={idMeal}`

### State Management Pattern
- No Vuex/Pinia - uses local component state with `ref()` and `reactive()`
- Persistent data in localStorage:
  - `'favorites'`: Array of meal objects
  - `'foodMenuCache'`: Array of 200 meals
  - `'foodMenuCacheTime'`: Timestamp of cache creation
- Translation cache: In-memory Map in `translationAPI.js`
- Cross-component updates: `window.dispatchEvent(new Event('storage'))` + `addEventListener('storage')`

### Styling
- Global styles in `src/assets/style.css`
- Scoped component styles
- Mobile-first responsive design
- No external UI library - pure CSS

## Important Implementation Details

**Favorites Cross-Component Sync**:
When toggling favorites in Detail view, code must dispatch storage event: `localStorage.setItem('favorites', JSON.stringify(favorites)); window.dispatchEvent(new Event('storage'));`
Home/Favorite views listen via `window.addEventListener('storage', loadFavorites)`.

**Ingredient Parsing**:
TheMealDB returns ingredients in 20 separate fields (`strIngredient1` to `strIngredient20` + `strMeasure1` to `strMeasure20`). Detail view loops through these fields, filters empty values, translates each ingredient name, and pairs with measures.

**Cache Strategy**:
`getFoodList(forceRefresh)` in [src/api/food.js](src/api/food.js) checks `forceRefresh` flag. If false, returns cached data. If true or no cache, calls `fetchFoodListFromAPI()` and saves to localStorage. "Import Menu" button in TabBar clears cache via `clearFoodCache()`.

**Translation Fallback Chain**:
1. Check local dictionary in `translate.js`
2. Try MyMemory API (1000 requests/day limit)
3. Fall back to LibreTranslate API
4. Return original English text if all fail

**API Considerations**:
- TheMealDB free tier has no rate limits but can be slow
- Translation APIs are free but have daily limits
- Always implement graceful degradation (show English on translation failure)

**Error Handling**:
Views use try-catch with loading states. Errors display via `alert()` and inline error messages. API failures should not crash the app.
