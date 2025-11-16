<template>
  <div class="auth-container">
    <h2>Új jelszó beállítása</h2>

    <form @submit.prevent="resetPassword">
      <input v-model="newPassword" type="password" placeholder="Új jelszó" required />
      <button type="submit">Jelszó módosítása</button>
    </form>

    <p v-if="message" :class="['message-box', success ? 'message-success' : 'message-error']">
      {{ message }}
    </p>

    <router-link class="auth-links" to="/login">Vissza a bejelentkezéshez</router-link>
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
    message.value = "Jelszó sikeresen megváltoztatva!";

    setTimeout(() => {
      router.push({ path: "/login", query: { successReset: "true" } });
    }, 2000);
  } catch (err) {
    success.value = false;
    message.value = "Hiba történt: " + (err.response?.data || "Ismeretlen hiba");
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  max-width: 320px;
  margin: 80px auto;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  color: #222;
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 15px;
  text-align: center;
}

input {
  margin: 6px 0;
  padding: 10px;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 15px;
}

button {
  padding: 10px;
  background: #42b883;
  border: none;
  color: white;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
}

button:hover {
  background: #329867;
}

.message-box {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid;
  margin-top: 12px;
  font-weight: 500;
}

.message-success {
  background: #e6fff3;
  border-color: #12c27a;
  color: #0f9a63;
}

.message-error {
  background: #ffe6e6;
  border-color: #e53939;
  color: #c62828;
}

.auth-links {
  margin-top: 18px;
  text-align: center;
  display: block;
  color: #42b883;
  text-decoration: underline;
}

.auth-links:hover {
  color: #2c9f75;
}
</style>
