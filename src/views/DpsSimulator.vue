<template>
  <v-container class="py-10" fluid>
    <v-card class="mx-auto pa-6" max-width="900">
      <v-card-title class="text-h5 font-weight-bold">
        ⚔️ DPS Szimulátor
      </v-card-title>

      <v-row class="my-4" align="center">
        <v-col cols="12" md="4">
          <v-text-field v-model="realm" label="Szerver (Realm)" variant="outlined" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="character" label="Karakter neve" variant="outlined" />
        </v-col>

        <v-col cols="12" md="4">
          <v-btn color="primary" :loading="loading" @click="fetchEquipment" class="w-100">
            {{ loading ? "Betöltés..." : "Felszerelés lekérése" }}
          </v-btn>
        </v-col>
      </v-row>

      <v-alert v-if="error" type="error" class="mb-4" border="start" prominent>
        {{ error }}
      </v-alert>

      <v-table v-if="equipment.length" hover density="comfortable" class="equipment-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Tárgy neve</th>
            <th>Item Level</th>
            <th>Statok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in equipment" :key="i" class="equipment-row">
            <td>{{ item.slot }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.itemLevel }}</td>
            <td>
              <div v-if="filteredStats(item.stats)?.length">
                <div v-for="(stat, si) in filteredStats(item.stats)" :key="si">
                  <v-chip size="small" color="teal-darken-2" class="ma-1" variant="elevated">
                    +{{ stat.value }} {{ stat.type }}
                  </v-chip>
                </div>
              </div>
              <div v-else class="text-grey">—</div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card v-if="equipment.length" class="mx-auto mt-8 pa-6" max-width="900">
      <v-card-title class="text-h5 font-weight-bold">
        🧪 Több tárgy csere és DPS összehasonlítás
      </v-card-title>

      <v-row v-for="(replacement, index) in replacements" :key="index" align="center" class="mb-2">
        <v-col cols="10">
          <v-autocomplete
            v-model="replacement.itemName"
            :items="uniqueItemNames"
            label="Válassz egy új tárgyat"
            variant="outlined"
            hide-no-data
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="2">
          <v-btn color="error" icon="mdi-delete" @click="removeReplacement(index)" title="Sor törlése" />
        </v-col>
      </v-row>

      <v-btn class="mt-2" color="secondary" @click="addReplacement" prepend-icon="mdi-plus">
        Új tárgy hozzáadása
      </v-btn>

      <v-divider class="my-4" />

      <v-btn
        color="success"
        :loading="loading"
        :disabled="!replacements.length"
        @click="runSimulation"
        prepend-icon="mdi-flask"
      >
        DPS szimuláció indítása
      </v-btn>

      <div v-if="simulation" class="mt-6">
        <v-alert type="success" class="mb-2" border="start">
          <div><b>Eredeti DPS:</b> {{ simulation.originalDps.toFixed(2) }}</div>
          <div><b>Módosított DPS:</b> {{ simulation.modifiedDps.toFixed(2) }}</div>
          <div><b>Különbség:</b> {{ simulation.dpsDifference.toFixed(2) }}</div>
        </v-alert>

        <v-card class="pa-4 mb-4" color="blue-grey-lighten-5">
          <h3 class="text-h6 font-weight-medium mb-2">
            📈 Statváltozások (Rating)
          </h3>
          <v-row>
            <v-col
              v-for="(value, stat) in simulation.statDifference"
              :key="stat"
              cols="6"
              sm="4"
              md="3"
            >
              <v-chip
                :color="value > 0 ? 'green' : value < 0 ? 'red' : 'grey'"
                class="ma-1"
                size="large"
                variant="elevated"
              >
                {{ value > 0 ? '+' : '' }}{{ value }} {{ stat }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card>

        <div v-if="chartData.datasets.length">
          <h3 class="text-h6 font-weight-medium mb-2">Sebzés lebontása (DPS)</h3>
          <Bar :data="chartData" :options="chartOptions" :height="300" />
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const realm = ref("");
const character = ref("");
const equipment = ref([]);
const characterStats = ref(null);
const loading = ref(false);
const error = ref(null);
const simulation = ref(null);
const replacements = ref([{ itemName: "" }]);
const itemNames = ref([]);

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchItemNames = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/character/items", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    itemNames.value = await res.json();
  } catch (err) {
    console.error("Nem sikerült betölteni az item listát:", err);
  }
};

const fetchCharacterStats = async () => {
  try {
    const res = await fetch(
      `http://localhost:8080/api/character/${realm.value}/${character.value}/stats`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    characterStats.value = await res.json();
  } catch (err) {
    // 403 esetén sem állítsuk le a megjelenítést – lesz heurisztikus fallback
    console.error("Nem sikerült lekérni a statokat:", err);
  }
};

const uniqueItemNames = computed(() =>
  [...new Set(itemNames.value.map((name) => name))].sort()
);

const fetchEquipment = async () => {
  loading.value = true;
  error.value = null;
  simulation.value = null;
  try {
    const res = await fetch(
      `http://localhost:8080/api/character/${realm.value}/${character.value}/equipment`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    equipment.value = await res.json();
    // stats lekérés – ha 403, nem baj, fallback-et használunk
    await fetchCharacterStats();
  } catch (err) {
    error.value = `Nem sikerült lekérni a felszerelést: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const runSimulation = async () => {
  loading.value = true;
  error.value = null;
  try {
    const filtered = [
      ...new Set(
        replacements.value
          .map((r) => r.itemName.trim())
          .filter((name) => name.length > 0)
      ),
    ];

    if (filtered.length === 0) {
      error.value = "Adj meg legalább egy új tárgyat a szimulációhoz!";
      loading.value = false;
      return;
    }

    const res = await fetch(
      `http://localhost:8080/api/character/${realm.value}/${character.value}/equipment/compare-dps`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          replacements: filtered.map((name) => ({ itemName: name })),
        }),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    simulation.value = await res.json();
  } catch (err) {
    error.value = `Hiba a szimuláció során: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const addReplacement = () => replacements.value.push({ itemName: "" });
const removeReplacement = (i) => replacements.value.splice(i, 1);

/**
 * Fő stat kiválasztása:
 * 1) Ha van classId a /stats válaszból → fix mapping (STR/AGI/INT).
 * 2) Ha nincs (pl. 403), akkor heurisztika:
 *    - a három fő stat közül a legnagyobb érték marad;
 *    - holtversenyben prioritás: Strength > Agility > Intellect.
 */
const pickMainStat = (stats) => {
  const mainStats = ["STRENGTH", "AGILITY", "INTELLECT"];

  // 1) ClassId alapján
  const cid = characterStats.value?.classId;
  if (cid) {
    if ([1, 2, 6].includes(cid)) return "STRENGTH";      // Warrior, Paladin, DK
    if ([3, 4, 7, 10, 12].includes(cid)) return "AGILITY"; // Hunter, Rogue, Monk, DH, Shaman(Enh)
    if ([5, 8, 9, 11, 13].includes(cid)) return "INTELLECT"; // Mage, Priest, Warlock, Druid, Evoker
  }

  // 2) Heurisztika (ha nincs classId)
  const values = { STRENGTH: -1, AGILITY: -1, INTELLECT: -1 };
  for (const s of stats || []) {
    const t = s?.type?.toUpperCase();
    if (!t || !mainStats.includes(t)) continue;
    const v = Number(s.value) || 0;
    values[t] = Math.max(values[t], v);
  }

  // ha mind -1, nincs fő stat az itemen → maradjon "STRENGTH" by default (safe)
  if (values.STRENGTH < 0 && values.AGILITY < 0 && values.INTELLECT < 0) {
    return "STRENGTH";
  }

  // max kiválasztása, holtversenyben STR > AGI > INT
  const order = ["STRENGTH", "AGILITY", "INTELLECT"];
  let best = order[0];
  for (const k of order) {
    if (values[k] > values[best]) best = k;
  }
  return best;
};

// Szűrés: csak a kiválasztott fő stat maradjon, STAMINA rejtve, minden rating marad
const filteredStats = (stats) => {
  if (!stats) return [];
  const hiddenStats = ["STAMINA"];
  const mainStats = ["STRENGTH", "AGILITY", "INTELLECT"];
  const keepMain = pickMainStat(stats);

  return stats.filter((s) => {
    if (!s || !s.type) return false;
    const type = s.type.toUpperCase();

    if (hiddenStats.includes(type)) return false;

    // ha fő stat, csak a kiválasztott maradjon
    if (mainStats.includes(type)) return type === keepMain;

    // rating-ek (CRIT_RATING, HASTE_RATING, stb.) maradnak
    return true;
  });
};

const chartData = computed(() => {
  if (!simulation.value?.modifiedReport?.damageBySpell)
    return { labels: [], datasets: [] };
  const entries = Object.entries(simulation.value.modifiedReport.damageBySpell);
  return {
    labels: entries.map(([name]) => name),
    datasets: [
      {
        label: "DPS / Spell",
        data: entries.map(([, dps]) => dps),
        backgroundColor: "#42b983",
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { mode: "index" } },
  scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true } },
};

onMounted(fetchItemNames);
</script>

<style scoped>
.equipment-table :deep(tbody > tr.equipment-row) {
  border-bottom: 2px solid rgba(0, 0, 0, 0.12) !important;
}
.equipment-table :deep(tbody > tr.equipment-row > td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
</style>
