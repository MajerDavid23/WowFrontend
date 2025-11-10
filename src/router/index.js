import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import DpsSimulator from "@/views/DpsSimulator.vue";
import ActivateAccountPage from "@/views/ActivateAccountPage.vue";
import ForgotPasswordPage from "@/views/ForgotPasswordPage.vue"; 

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/activate-account", component: ActivateAccountPage },
  { path: "/forgot-password", component: ForgotPasswordPage }, 
  {
    path: "/simulator",
    name: "simulator",
    component: DpsSimulator,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");
  if (to.meta.requiresAuth && !token) next("/login");
  else next();
});

export default router;
