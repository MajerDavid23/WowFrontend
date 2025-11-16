<template>
  <div class="auth-container">
    <h2>Elfelejtett jelszó</h2>

    <form @submit.prevent="sendResetEmail">
      <input v-model="email" type="email" placeholder="Email cím" required />
      <button type="submit">Jelszó visszaállítása</button>
    </form>

    <p v-if="message" :class="['message-box', success ? 'message-success' : 'message-error']">
      {{ message }}
    </p>

    <router-link to="/login" class="auth-links">Vissza a bejelentkezéshez</router-link>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AuthService from "../services/AuthService";

const email = ref("");
const message = ref("");
const success = ref(false);

const sendResetEmail = async () => {
  try {
    await AuthService.forgotPassword(email.value);
    success.value = true;
    message.value = "Ha létezik ilyen fiók, e-mailt küldtünk a visszaállításhoz!";
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
