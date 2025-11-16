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
          <v-btn color="primary" :loading="loading" @click="loadCharacterData" class="w-100">
            {{ loading ? "Betöltés..." : "Felszerelés lekérése" }}
          </v-btn>
        </v-col>
      </v-row>

      <v-card class="mt-4 pa-4" color="amber-lighten-5" elevation="0">
        <h3 class="text-h6 mb-3">🎯 Támogatott specek</h3>
        <v-row align="center">
          <v-col cols="12" sm="6" md="4">
            <div class="d-flex align-center">
              <img
                src="https://wow.zamimg.com/images/wow/icons/large/spell_holy_auraoflight.jpg"
                alt="Retribution Paladin"
                width="40"
                height="40"
                style="border-radius: 6px; margin-right: 10px;"
              />
            </div>
          </v-col>
        </v-row>
        <div class="text-grey-darken-1 mt-2" style="font-size: 0.9rem;">
          (A jövőben bővül további DPS specekkel)
        </div>
      </v-card>

      <v-alert v-if="error" type="error" class="mb-4" border="start" prominent>
        {{ error }}
      </v-alert>

      <v-card v-if="characterStats" class="mb-6 pa-4" color="blue-grey-lighten-5">
        <h3 class="text-h6 mb-3">📊 Aktuális statok (Blizzard /stats)</h3>
        <v-row>
          <v-col cols="6" sm="4" md="3" v-for="(value, key) in displayedStats" :key="key">
            <v-chip color="indigo" class="ma-1" size="large" variant="elevated">
              {{ key }}: {{ formatStatValue(value) }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card>

      <v-table v-if="equipment.length" hover density="comfortable" class="equipment-table">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Tárgy</th>
            <th>Item Level</th>
            <th>Statok</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in equipment" :key="i" class="equipment-row">
            <td>{{ item.slot }}</td>
            <td>
              <div class="d-flex align-center">
                <img
                  :src="item.iconUrl || defaultIcon"
                  alt="Item Icon"
                  width="32"
                  height="32"
                  style="border-radius: 6px; margin-right: 8px;"
                />
                <span>{{ item.name }}</span>
              </div>
            </td>
            <td>{{ item.itemLevel }}</td>
            <td>
              <div v-if="filteredStats(item.stats)?.length">
                <v-chip
                  v-for="(stat, si) in filteredStats(item.stats)"
                  :key="si"
                  size="small"
                  color="teal-darken-2"
                  class="ma-1"
                  variant="elevated"
                >
                  +{{ stat.value }} {{ stat.type }}
                </v-chip>
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

      <v-row
        v-for="(replacement, index) in replacements"
        :key="index"
        align="center"
        class="mb-2"
      >
        <v-col :md="getSlotOptions(replacement.itemName) ? 5 : 10" cols="12">
          <v-autocomplete
            v-model="replacement.itemName"
            :items="uniqueItemNames"
            item-title="name"
            label="Válassz egy új tárgyat"
            variant="outlined"
            hide-no-data
            hide-details
            clearable
            @update:modelValue="replacement.targetSlot = null"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <img
                    :src="item.raw.iconUrl || defaultIcon"
                    alt="icon"
                    width="28"
                    height="28"
                    style="border-radius: 4px; margin-right: 6px;"
                  />
                </template>
                <v-list-item-subtitle class="d-flex align-center flex-wrap">
                  <span class="text-blue-grey-darken-1 mr-2" v-if="item.raw.itemLevel">
                     ilvl {{ item.raw.itemLevel }}
                  </span>
                  <span class="mr-2"
                        v-if="item.raw.stats?.some(s => s.type === 'STRENGTH')"
                        style="color: #c69b6d;">
                    +{{ item.raw.stats.find(s => s.type === 'STRENGTH').value }} Strength
                  </span>
                  <span class="mr-2"
                        v-if="item.raw.stats?.some(s => s.type === 'CRIT_RATING')"
                        style="color: #e50000;">
                    +{{ item.raw.stats.find(s => s.type === 'CRIT_RATING').value }} Crit
                  </span>
                  <span class="mr-2"
                        v-if="item.raw.stats?.some(s => s.type === 'HASTE_RATING')"
                        style="color: #008040;">
                    +{{ item.raw.stats.find(s => s.type === 'HASTE_RATING').value }} Haste
                  </span>
                  <span class="mr-2"
                        v-if="item.raw.stats?.some(s => s.type === 'MASTERY_RATING')"
                        style="color: #a330c9;">
                    +{{ item.raw.stats.find(s => s.type === 'MASTERY_RATING').value }} Mastery
                  </span>
                  <span class="mr-2"
                        v-if="item.raw.stats?.some(s => s.type === 'VERSATILITY_RATING')"
                        style="color: #0070dd;">
                    +{{ item.raw.stats.find(s => s.type === 'VERSATILITY_RATING').value }} Vers
                  </span>
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col md="5" cols="12" v-if="getSlotOptions(replacement.itemName)">
          <v-select
            v-model="replacement.targetSlot"
            :items="getSlotOptions(replacement.itemName)"
            label="Slot"
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col md="2" cols="12" class="text-right">
          <v-btn
            variant="text"
            color="red-darken-2"
            icon="mdi-delete"
            @click="removeReplacement(index)"
            title="Sor törlése"
          />
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

        <v-card v-if="statSummary.length" class="pa-4 mb-4" color="green-lighten-5">
          <h3 class="text-h6 mb-2">📈 Statnövekedés összesen</h3>
          <v-chip
            v-for="(entry, idx) in statSummary"
            :key="idx"
            :color="entry.value > 0 ? 'green' : entry.value < 0 ? 'red' : 'grey'"
            size="large"
            variant="elevated"
            class="ma-1"
          >
            {{ entry.value > 0 ? '+' : '' }}{{ entry.value }} {{ entry.type }}
          </v-chip>
        </v-card>

        <v-card v-if="rotationLog.length" class="pa-4 mb-4" color="grey-darken-3">
          <h3 class="text-h6 mb-2">📖 Rotációs Napló (Képességek sorrendje)</h3>
          <div style="max-height: 200px; overflow-y: auto; background-color: rgba(0,0,0,0.3); border-radius: 4px; padding: 4px 0;">
            <v-list density="compact" bg-color="transparent">
              <v-list-item v-for="(spell, idx) in rotationLog" :key="idx">
                <v-list-item-title>{{ idx + 1 }}. {{ spell }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card>

        <div v-if="chartData.datasets.length">
          <h3 class="text-h6 mb-2">Sebzés lebontása (DPS)</h3>
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

const replacements = ref([{ itemName: "", targetSlot: null }]);
const itemNames = ref([]);
const defaultIcon = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchItemNames = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/character/items/full-list", {
      headers: getAuthHeaders(),
    });
    if (res.ok) itemNames.value = await res.json();
  } catch (err) {
    console.error("Item lista hiba:", err);
  }
};

const fetchCharacterStats = async () => {
  const res = await fetch(
    `http://localhost:8080/api/character/${realm.value}/${character.value}/stats`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) {
      const errorText = await res.text();
      let msg = errorText;

      try {
        const json = JSON.parse(errorText);
        msg = json.message || msg;
      } catch (_) {}

      throw new Error(msg);
    }

  characterStats.value = await res.json();
};

const fetchEquipment = async () => {
  const res = await fetch(
    `http://localhost:8080/api/character/${realm.value}/${character.value}/equipment`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) {
      const errorText = await res.text();
      let msg = errorText;

      try {
        const json = JSON.parse(errorText);
        msg = json.message || msg;
      } catch (_) {}

      throw new Error(msg);
    }

  equipment.value = await res.json();
};

const loadCharacterData = async () => {
  if (!realm.value || !character.value) {
    error.value = "Add meg a szervert és a karakter nevét!";
    return;
  }
  loading.value = true;
  error.value = null;
  simulation.value = null;
  try {
    await fetchCharacterStats();
    await fetchEquipment();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const runSimulation = async () => {
  loading.value = true;
  error.value = null;
  try {
    const payload = replacements.value
      .map((r) => ({
        itemName: r.itemName ? r.itemName.trim() : "",
        targetSlot: r.targetSlot,
      }))
      .filter((r) => r.itemName.length > 0);

    if (!payload.length) {
      error.value = "Adj meg legalább egy új tárgyat a szimulációhoz!";
      loading.value = false;
      return;
    }

    for (const r of payload) {
      const options = getSlotOptions(r.itemName);
      if (options && !r.targetSlot) {
        error.value = `Meg kell adnod a pontos slotot a(z) '${r.itemName}' tárgyhoz! (Pl. FINGER_1)`;
        loading.value = false;
        return;
      }
    }

    const res = await fetch(
      `http://localhost:8080/api/character/${realm.value}/${character.value}/equipment/compare-dps`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          replacements: payload,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      let msg = errorText;

      try {
        const json = JSON.parse(errorText);
        msg = json.message || msg;
      } catch (_) {}

      throw new Error(msg);
    }


    simulation.value = await res.json();
  } catch (err) {
    error.value = `Hiba a szimuláció során: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const displayedStats = computed(() => {
  if (!characterStats.value) return {};
  return {
    Strength: characterStats.value.strength,
    Crit: characterStats.value.critPercent.toFixed(2) + "%",
    Haste: characterStats.value.hastePercent.toFixed(2) + "%",
    Mastery: characterStats.value.masteryPercent.toFixed(2) + "%",
    Versatility: characterStats.value.versatilityPercent.toFixed(2) + "%",
    "Weapon Speed": characterStats.value.weaponSpeed,
  };
});

const formatStatValue = (v) =>
  typeof v === "number" ? v.toLocaleString() : v;

const addReplacement = () =>
  replacements.value.push({ itemName: "", targetSlot: null });
const removeReplacement = (i) => replacements.value.splice(i, 1);

const uniqueItemNames = computed(() =>
  [...new Map(itemNames.value.map((i) => [i.name, i])).values()]
);

const getSlotOptions = (itemName) => {
  if (!itemName) return null;

  const item = uniqueItemNames.value.find((i) => i.name === itemName);
  const slot = item?.slot?.toUpperCase();

  if (slot === "FINGER") return ["FINGER_1", "FINGER_2"];
  if (slot === "TRINKET") return ["TRINKET_1", "TRINKET_2"];

  const weaponSlots = ["WEAPON", "MAIN_HAND", "OFF_HAND", "TWO_HAND"];
  if (weaponSlots.includes(slot)) {
    return ["MAIN_HAND", "OFF_HAND", "TWO_HAND"];
  }

  return null;
};

const pickMainStat = () => {
  const cid = characterStats.value?.classId;
  if ([1, 2, 6].includes(cid)) return "STRENGTH";
  if ([3, 4, 7, 10, 12].includes(cid)) return "AGILITY";
  if ([5, 8, 9, 11, 13].includes(cid)) return "INTELLECT";
  return "STRENGTH";
};

const filteredStats = (stats = []) => {
  if (!Array.isArray(stats)) return [];

  const keepMain = pickMainStat();
  const mainStats = ["STRENGTH", "AGILITY", "INTELLECT"];
  const hidden = ["STAMINA"];
  
  const apiToDisplayMap = {
    "CRITICAL STRIKE": "CRIT",
    "HASTE": "HASTE",
    "MASTERY": "MASTERY",
    "VERSATILITY": "VERSATILITY",
    "STRENGTH": "STRENGTH"
  };

  return stats
    .map((s) => ({
      type: String(s?.type || "").toUpperCase(),
      value: Number(s?.value || 0),
    }))
    .filter((s) => {
      if (!s.type || hidden.includes(s.type)) return false;

      const normalizedType = apiToDisplayMap[s.type] || s.type;
      
      if (mainStats.includes(normalizedType)) {
        return normalizedType === keepMain;
      }

      if (mainStats.includes(s.type)) {
         return s.type === keepMain;
      }

      const displayableSecondary = ["CRIT", "HASTE", "MASTERY", "VERSATILITY"];
      return displayableSecondary.includes(normalizedType);
    })
    .map(s => ({
        ...s,
        type: apiToDisplayMap[s.type] || s.type 
    }));
};


const ratingOrder = {
  STRENGTH: "STRENGTH",
  CRIT_RATING: "CRIT_RATING",
  HASTE_RATING: "HASTE_RATING",
  MASTERY_RATING: "MASTERY_RATING",
  VERSATILITY_RATING: "VERSATILITY_RATING",
};

const statDiffRaw = computed(
  () => simulation.value?.statDifference ?? {}
);

const statSummary = computed(() => {
  const diff = statDiffRaw.value || {};
  return Object.keys(ratingOrder)
    .filter((k) => (diff[k] ?? 0) !== 0)
    .map((k) => ({ type: ratingOrder[k], value: diff[k] ?? 0 }));
});

const rotationLog = computed(
  () => simulation.value?.modifiedReport?.rotationLog || []
);

const chartData = computed(() => {
  if (!simulation.value?.modifiedReport?.damageBySpell)
    return { labels: [], datasets: [] };
  const entries = Object.entries(
    simulation.value.modifiedReport.damageBySpell
  );
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