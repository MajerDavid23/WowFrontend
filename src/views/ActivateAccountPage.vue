<template>
  <div class="activate">
    <h2>Fiók aktiválása</h2>

    <p v-if="loading">🔄 Fiók aktiválása folyamatban...</p>
    <p v-else :class="{ success: success, error: !success }">{{ message }}</p>

    <router-link v-if="!loading" to="/login">Vissza a bejelentkezéshez</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);
const message = ref("");

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    loading.value = false;
    success.value = false;
    message.value = "Hiányzó aktiválási token.";
    return;
  }

  try {
    const res = await axios.get(`http://localhost:8080/api/auth/activate?token=${token}`);
    success.value = true;
    message.value = "✅ A fiókod sikeresen aktiválva!";
    console.log("Backend válasz:", res.data);
  } catch (err) {
    success.value = false;
    message.value =
      "Hiba történt az aktiválás során: " +
      (err.response?.data || "Ismeretlen hiba");
  } finally {
    loading.value = false;
  }

  if (success.value) {
    setTimeout(() => {
      router.push({ path: "/login", query: { activated: "true" } });
    }, 2000);
  }
});
</script>

<style scoped>
.activate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: white;
  text-align: center;
}
.success {
  color: #00ff88;
}
.error {
  color: #ff4b4b;
}
a {
  color: #42b883;
  margin-top: 15px;
  text-decoration: underline;
}
a:hover {
  color: #2c9f75;
}
</style>
