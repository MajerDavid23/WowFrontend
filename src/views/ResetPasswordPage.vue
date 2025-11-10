<template>
  <div class="reset">
    <h2>Új jelszó beállítása</h2>

    <form @submit.prevent="resetPassword">
      <input v-model="newPassword" type="password" placeholder="Új jelszó" required />
      <button type="submit">Jelszó módosítása</button>
    </form>

    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
    <router-link to="/login">Vissza a bejelentkezéshez</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthService from "../services/AuthService";

const route = useRoute();
const router = useRouter();
const token = ref("");
const newPassword = ref("");
const message = ref("");
const success = ref(false);

onMounted(() => {
  token.value = route.query.token;
});

const resetPassword = async () => {
  try {
    await AuthService.resetPassword(token.value, newPassword.value);
    success.value = true;
    message.value = "✅ Jelszó sikeresen megváltoztatva!";

    setTimeout(() => {
      router.push({ path: "/login", query: { successReset: "true" } });
    }, 2000);
  } catch (err) {
    success.value = false;
    message.value = "❌ Hiba történt: " + (err.response?.data || "Ismeretlen hiba");
  }
};
</script>

<style scoped>
.reset {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 100px auto;
  color: white;
}
input {
  margin: 5px 0;
  padding: 8px;
}
button {
  padding: 8px;
  background: #42b883;
  border: none;
  color: white;
  cursor: pointer;
}
button:hover {
  background: #2c9f75;
}
.success {
  color: #00ff88;
}
.error {
  color: #ff4b4b;
}
</style>
