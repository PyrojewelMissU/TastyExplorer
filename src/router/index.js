import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Detail from "../views/Detail.vue";
import Favorite from "../views/Favorite.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/detail/:id", component: Detail },
  { path: "/favorite", component: Favorite },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
