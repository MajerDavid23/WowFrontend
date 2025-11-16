<template>
  <div class="forgot">
    <h2>Elfelejtett jelszó</h2>
    <form @submit.prevent="sendResetEmail">
      <input v-model="email" type="email" placeholder="Email cím" required />
      <button type="submit">Jelszó visszaállítása</button>
    </form>
    <p v-if="message" :class="{ success: success, error: !success }">{{ message }}</p>
    <router-link to="/login">Vissza a bejelentkezéshez</router-link>
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
.forgot {
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
