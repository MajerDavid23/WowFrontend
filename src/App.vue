<template>
  <v-app>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>⚔️ DPS Szimulátor</v-app-bar-title>
      
      <v-spacer></v-spacer>

      <v-btn 
        v-if="isLoggedIn" 
        color="error"
        variant="elevated" 
        prepend-icon="mdi-logout" 
        @click="logout"
        class="mr-2"
      >
        Kijelentkezés
      </v-btn>
      
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); 

const isLoggedIn = computed(() => {
  return route.meta.requiresAuth === true;
});

const logout = () => {
  localStorage.removeItem('authToken');
  router.replace('/login');
};
</script>

<style>
body {
  background-color: #121212;
  color: white;
  font-family: sans-serif;
}
</style>