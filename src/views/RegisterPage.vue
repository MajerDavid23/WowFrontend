<template>
  <div class="auth-container">
    <h2>Regisztráció</h2>

    <form @submit.prevent="registerUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Jelszó" required />
      <button type="submit">Regisztráció</button>
    </form>

    <p v-if="message" :class="['message-box', isError ? 'message-error' : 'message-success']">
      {{ message }}
    </p>

    <router-link to="/login" class="auth-links">Már van fiókod? Bejelentkezés</router-link>
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
    message.value = "Regisztráció sikeres! Ellenőrizd az emailed az aktiváló linkért.";
    console.log("Backend válasz:", res.data);
  } catch (err) {
    const backendMsg = typeof err.response?.data === "string"
      ? err.response.data
      : err.response?.data?.message || "Ismeretlen hiba";

    isError.value = true;
    message.value = backendMsg;
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
