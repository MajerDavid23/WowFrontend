<template>
  <div class="auth-container">
    <h2>Bejelentkezés</h2>

    <form @submit.prevent="loginUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Jelszó" required />
      <button type="submit">Belépés</button>
    </form>

    <p v-if="resetMessage" class="message-box message-success">{{ resetMessage }}</p>
    <p v-if="message" :class="['message-box', isError ? 'message-error' : 'message-success']">
      {{ message }}
    </p>

    <div class="auth-links">
      <router-link to="/forgot-password">Elfelejtettem a jelszavam</router-link>
      <router-link to="/register">Nincs még fiókod? <b>Regisztráció</b></router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthService from "../services/AuthService";

const route = useRoute();
const router = useRouter();

const email = ref("");
const password = ref("");
const message = ref("");
const resetMessage = ref("");
const isError = ref(false);

onMounted(() => {
  if (route.query.successReset === "true") {
    resetMessage.value = "Jelszavad frissítve, jelentkezz be újra!";
  }

  if (route.query.activated === "true") {
    resetMessage.value = "Fiókod sikeresen aktiválva, most már bejelentkezhetsz!";
  }
});

const loginUser = async () => {
  try {
    const res = await AuthService.login(email.value, password.value);
    isError.value = false;
    message.value = "Sikeres bejelentkezés!";

    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);

      setTimeout(() => {
        router.push({ name: "simulator" });
      }, 1000);
    } else {
      isError.value = true;
      message.value = "A szerver nem küldött belépési tokent.";
    }
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

a {
  color: #42b883;
  text-decoration: underline;
}

a:hover {
  color: #2c9f75;
}
</style>
