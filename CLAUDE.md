# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 mobile-first food menu application that displays meals from TheMealDB API. The app allows users to browse meals, view details, and save favorites to localStorage.

## Architecture

### Core Technology Stack
- **Vue 3** with Composition API (`<script setup>`)
- **Vue Router** with hash history mode
- **Axios** for API requests
- No state management library (uses localStorage for favorites, local state for other data)

### Key Architectural Patterns

**API Layer**: Centralized in `src/api/food.js` using axios. Currently contains a single endpoint that fetches meal data from TheMealDB external API.

**Routing Structure**: Three main routes defined in `src/router/index.js`:
- `/` - Home page with meal list
- `/detail/:id` - Detail view for individual meal (receives meal ID as route param)
- `/favorite` - User's saved favorites

**Data Flow**:
- Home view fetches data from API on mount, stores in local ref
- FoodCard component receives food data as props and navigates to detail on click
- Favorite system uses localStorage with key 'favorites', storing full meal objects as JSON
- Detail view receives meal ID via route params

**Component Organization**:
- `views/` - Page-level components that handle data fetching and business logic
- `components/` - Reusable UI components (FoodCard, TabBar)
- Views are responsible for fetching data; components are presentational

### Styling
- Global styles in `src/assets/style.css`
- Component-specific styles use scoped CSS
- Mobile-first design with viewport meta tag set in index.html

### State Management Pattern
- No Vuex/Pinia - uses local component state with Vue 3 ref()
- Persistent data (favorites) stored in localStorage
- Each view manages its own loading/error states independently

## Important Notes

**Favorites Feature**: The app stores entire meal objects in localStorage under the 'favorites' key. When modifying favorite functionality, ensure you're reading/writing the correct data structure (array of meal objects with at least `idMeal` and `strMeal` properties).

**External API Dependency**: The app depends on TheMealDB API (themealdb.com). The API call in `src/api/food.js` searches for all meals with empty search parameter.

**Router Navigation**: FoodCard components handle navigation programmatically using `$router.push()`. Detail route expects numeric meal ID from the API.

**Error Handling**: Views implement try-catch with loading states and display errors via alert() and inline error messages.
