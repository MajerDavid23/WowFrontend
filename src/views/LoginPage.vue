<template>
  <div class="login">
    <h2>Bejelentkezés</h2>

    <form @submit.prevent="loginUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Jelszó" required />
      <button type="submit">Belépés</button>
    </form>

    <p v-if="resetMessage" class="success-box">{{ resetMessage }}</p>
    <p v-if="message" :class="{'error-box': isError, 'success-box': !isError}">
      {{ message }}
    </p>

    <div class="links">
      <router-link to="/forgot-password" class="forgot-link">
        Elfelejtettem a jelszavam
      </router-link>
      <router-link to="/register" class="register-link">
        Nincs még fiókod? <b>Regisztráció</b>
      </router-link>
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
    resetMessage.value = "✅ Jelszavad frissítve, jelentkezz be újra!";
  }

  if (route.query.activated === "true") {
    resetMessage.value = "✅ Fiókod sikeresen aktiválva, most már bejelentkezhetsz!";
  }
});

const loginUser = async () => {
  try {
    const res = await AuthService.login(email.value, password.value);
    isError.value = false;
    message.value = "✅ Sikeres bejelentkezés!";
    console.log("Backend válasz:", res.data);

    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
      
      setTimeout(() => {
        console.log("➡️ Navigálás /simulator oldalra...");
        router.push({ name: "simulator" });
      }, 1000);

    } else {
      isError.value = true;
      message.value = "Hiba: A szerver nem küldött belépési tokent.";
      console.error("A bejelentkezési válasz nem tartalmazott tokent!", res.data);
    }

  } catch (err) {
    const backendMsg =
      typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Ismeretlen hiba";
    isError.value = true;
    message.value = backendMsg;
  }
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 100px auto;
  color: white;
}

h2 {
  margin-bottom: 10px;
  text-align: center;
}

input {
  margin: 5px 0;
  padding: 8px;
  width: 100%;
  border-radius: 4px;
  border: none;
  outline: none;
}

button {
  padding: 8px;
  background: #42b883;
  border: none;
  color: white;
  cursor: pointer;
  width: 100%;
  margin-top: 5px;
  border-radius: 4px;
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

.links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 8px;
}

.forgot-link,
.register-link {
  color: #42b883;
  text-decoration: underline;
  cursor: pointer;
}

.forgot-link:hover,
.register-link:hover {
  color: #2c9f75;
}
</style>