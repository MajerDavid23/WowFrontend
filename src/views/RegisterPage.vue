<template>
  <div class="register">
    <h2>Regisztráció</h2>

    <form @submit.prevent="registerUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Jelszó" required />
      <button type="submit">Regisztráció</button>
    </form>

    <p v-if="message" :class="{'error-box': isError, 'success-box': !isError}">
      {{ message }}
    </p>

    <router-link to="/login" class="back-link">
      Már van fiókod? Bejelentkezés
    </router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AuthService from "../services/AuthService";

const email = ref("");
const password = ref("");
const message = ref("");
const isError = ref(false);

const registerUser = async () => {
  try {
    const res = await AuthService.register(email.value, password.value);
    isError.value = false;
    message.value = "✅ Regisztráció sikeres! Ellenőrizd az emailed az aktiváló linkért.";
    console.log("Backend válasz:", res.data);
  } catch (err) {
    const backendMsg =
      typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Ismeretlen hiba";
    isError.value = true;
    message.value = "❌ " + backendMsg;
  }
};
</script>

<style scoped>
.register {
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
.error-box {
  background-color: #ff4b4b22;
  border: 1px solid #ff4b4b;
  padding: 8px;
  border-radius: 6px;
  color: #ff4b4b;
  margin-top: 10px;
}
.success-box {
  background-color: #00ff8822;
  border: 1px solid #00ff88;
  padding: 8px;
  border-radius: 6px;
  color: #00ff88;
  margin-top: 10px;
}
.back-link {
  margin-top: 15px;
  color: #42b883;
  text-align: center;
  display: block;
  text-decoration: underline;
}
.back-link:hover {
  color: #2c9f75;
}
</style>
