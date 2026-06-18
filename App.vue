<template>
  <transition name="page-motion" mode="out-in">
    <div v-if="authState.loading" key="auth-loading" class="app-bg flex min-h-screen items-center justify-center px-5">
      <section class="glass rounded-[28px] p-8 text-center">
        <el-skeleton animated :rows="3" />
      </section>
    </div>

    <AuthView v-else-if="!authState.user" key="auth" @authed="handleAuthed" />

    <div v-else key="app" class="app-bg">
    <header ref="navRef" class="ios-nav sticky top-0 z-30">
      <div class="app-shell mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-center">
        <button class="pressable min-w-0 text-left" @click="goHome">
          <p class="truncate text-sm font-semibold text-sea-700/90 dark:text-sea-300/90">{{ t.brand }}</p>
          <h1 class="truncate text-2xl font-black text-ink dark:text-white">{{ t.title }}</h1>
        </button>
        <nav class="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          <button class="nav-pill pressable flex items-center gap-2 px-4 py-2 text-sm font-semibold" :class="state.activeView === 'home' ? 'bg-white/40 dark:bg-white/10' : ''" @click="goHome">
            <el-icon><House /></el-icon>
            {{ t.albums }}
          </button>
          <button class="nav-pill pressable flex items-center gap-2 px-4 py-2 text-sm font-semibold" :class="state.activeView === 'timeline' ? 'bg-white/40 dark:bg-white/10' : ''" @click="state.activeView = 'timeline'">
            <el-icon><Calendar /></el-icon>
            {{ t.timeline }}
          </button>
          <button class="nav-pill pressable flex items-center gap-2 px-4 py-2 text-sm font-semibold" :class="state.activeView === 'settings' ? 'bg-white/40 dark:bg-white/10' : ''" @click="state.activeView = 'settings'">
            <el-icon><Setting /></el-icon>
            {{ t.settings }}
          </button>
          <button class="nav-pill pressable flex h-10 w-10 items-center justify-center" @click="toggleTheme">
            <el-icon><component :is="state.settings.theme === 'dark' ? Sunny : Moon" /></el-icon>
          </button>
        </nav>
      </div>
    </header>

    <main class="app-shell mx-auto max-w-7xl px-5 py-8">
      <section class="glass mb-8 rounded-[28px] p-5">
        <div class="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div class="grid gap-3 md:grid-cols-[minmax(220px,1.2fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
            <el-input v-model="state.search" :prefix-icon="Search" :placeholder="t.search" clearable />
            <el-date-picker
              v-model="state.filters.selectedDate"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="t.tripDate"
              clearable
              class="w-full"
            />
            <el-select v-model="state.filters.destination" clearable :placeholder="t.destination">
              <el-option v-for="item in allDestinations" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="flex flex-wrap gap-2">
            <el-button type="primary" :icon="Plus" @click="openAlbumDialog()">{{ t.newAlbum }}</el-button>
          </div>
        </div>
      </section>

      <transition name="page-motion" mode="out-in">
        <section v-if="state.loading" key="loading" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <el-skeleton v-for="item in 6" :key="item" animated class="rounded-[28px] bg-white/30 p-5" />
        </section>

        <section v-else-if="state.activeView === 'home'" key="home">
          <div v-if="filteredAlbums.length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AlbumCard
              v-for="(album, index) in filteredAlbums"
              :key="album.id"
              :album="album"
              :stats="albumStats.get(album.id)"
              :style="{ '--delay': `${index * 48}ms` }"
              class="stagger-in"
              @open="openAlbum"
              @edit="openAlbumDialog"
              @pin="togglePin"
              @remove="removeAlbum"
            />
          </div>
          <EmptyState v-else :title="t.emptyAlbums" :text="t.emptyAlbumsText" />
        </section>

        <AlbumDetail v-else-if="state.activeView === 'album'" key="album" :album-id="state.activeAlbumId" @back="goHome" @edit-journal="openJournalDialog" />
        <TimelineView v-else-if="state.activeView === 'timeline'" key="timeline" />
        <SettingsView v-else key="settings" @logout="handleLogout" />
      </transition>
    </main>

    <AlbumDialog v-model="albumDialogVisible" :album="editingAlbum" :journal="editingAlbumJournal" @save="handleSaveAlbum" />
    <JournalEditor v-model="journalDialogVisible" :journal="editingJournal" :albums="state.albums" :photos="state.photos" @save="handleSaveJournal" />
  </div>
  </transition>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, House, Moon, Plus, Search, Setting, Sunny } from '@element-plus/icons-vue'
import AlbumCard from './components/AlbumCard.vue'
import AlbumDetail from './components/AlbumDetail.vue'
import AlbumDialog from './components/AlbumDialog.vue'
import AuthView from './components/AuthView.vue'
import EmptyState from './components/EmptyState.vue'
import JournalEditor from './components/JournalEditor.vue'
import SettingsView from './components/SettingsView.vue'
import TimelineView from './components/TimelineView.vue'
import { authState, initAuth } from './utils/auth'
import { albumStats, allDestinations, deleteAlbum, filteredAlbums, loadState, saveAlbum, saveJournal, saveSettings, state } from './utils/store'

const albumDialogVisible = ref(false)
const editingAlbum = ref(null)
const journalDialogVisible = ref(false)
const editingJournal = ref(null)
const navRef = ref(null)
const editingAlbumJournal = computed(() => {
  if (!editingAlbum.value?.id) return null
  return state.journals.find((journal) => journal.albumId === editingAlbum.value.id) || null
})
const t = {
  brand: '\u672c\u5730\u65c5\u884c\u76f8\u518c',
  title: '\u4e2a\u4eba\u65c5\u884c\u7167\u7247\u8bb0\u5f55',
  albums: '\u76f8\u518c',
  timeline: '\u65f6\u95f4\u8f74',
  settings: '\u7528\u6237\u4e2d\u5fc3',
  search: '\u641c\u7d22\u76f8\u518c\u3001\u5907\u6ce8\u3001\u5730\u70b9\u3001\u6e38\u8bb0',
  tripDate: '\u9009\u62e9\u65c5\u884c\u65e5\u671f',
  destination: '\u76ee\u7684\u5730',
  newAlbum: '\u65b0\u5efa\u76f8\u518c',
  emptyAlbums: '\u8fd8\u6ca1\u6709\u65c5\u884c\u76f8\u518c',
  emptyAlbumsText: '\u521b\u5efa\u7b2c\u4e00\u4e2a\u76f8\u518c\uff0c\u628a\u7167\u7247\u3001\u8def\u7ebf\u548c\u6e38\u8bb0\u90fd\u5b58\u5728\u672c\u5730\u6d4f\u89c8\u5668\u91cc\u3002',
  albumSaved: '\u76f8\u518c\u5df2\u4fdd\u5b58',
  deleteAlbumTitle: '\u5220\u9664\u76f8\u518c',
  deleteAlbumConfirmPrefix: '\u786e\u5b9a\u5220\u9664\u300c',
  deleteAlbumConfirmSuffix: '\u300d\u53ca\u5176\u4e2d\u6240\u6709\u7167\u7247\u548c\u6e38\u8bb0\u5417\uff1f',
  albumDeleted: '\u76f8\u518c\u5df2\u5220\u9664',
  journalSaved: '\u6e38\u8bb0\u5df2\u4fdd\u5b58',
  journalCleared: '\u6e38\u8bb0\u5df2\u7559\u7a7a'
}

function updateNavGlass() {
  const progress = Math.min(1, (window.scrollY || 0) / 160)
  if (!navRef.value) return
  navRef.value.style.setProperty('--nav-alpha', String(progress))
  navRef.value.style.setProperty('--nav-blur', `${8 + progress * 14}px`)
  navRef.value.style.setProperty('--nav-shadow', String(progress))
}

onMounted(async () => {
  await initAuth()
  if (authState.user) await loadState()
  updateNavGlass()
  window.addEventListener('scroll', updateNavGlass, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', updateNavGlass))

function goHome() {
  state.activeView = 'home'
  state.activeAlbumId = ''
}

function openAlbum(id) {
  state.activeAlbumId = id
  state.activeView = 'album'
}

function openAlbumDialog(album = null) {
  editingAlbum.value = album
  albumDialogVisible.value = true
}

async function handleSaveAlbum(payload) {
  const album = await saveAlbum(payload.album)
  if (payload.journalContent) {
    const existing = state.journals.find((journal) => journal.albumId === album.id)
    await saveJournal({
      ...(existing || {}),
      albumId: album.id,
      title: album.name,
      content: payload.journalContent
    })
  } else {
    const existing = state.journals.find((journal) => journal.albumId === album.id)
    if (existing) {
      await saveJournal({
        ...existing,
        title: album.name,
        content: ''
      })
    }
  }
  ElMessage.success(t.albumSaved)
}

async function togglePin(album) {
  await saveAlbum({ ...album, pinned: !album.pinned })
}

async function removeAlbum(album) {
  await ElMessageBox.confirm(`${t.deleteAlbumConfirmPrefix}${album.name}${t.deleteAlbumConfirmSuffix}`, t.deleteAlbumTitle, { type: 'warning' })
  await deleteAlbum(album.id)
  ElMessage.success(t.albumDeleted)
}

function openJournalDialog(journalOrAlbum = null) {
  if (journalOrAlbum?.type === 'album') {
    const existing = state.journals.find((journal) => journal.albumId === journalOrAlbum.album.id)
    editingJournal.value = existing || { albumId: journalOrAlbum.album.id, title: journalOrAlbum.album.name, content: '' }
  } else {
    editingJournal.value = journalOrAlbum
  }
  journalDialogVisible.value = true
}

async function handleSaveJournal(journal) {
  await saveJournal(journal)
  ElMessage.success(t.journalSaved)
}

async function toggleTheme() {
  await saveSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' })
}

async function handleAuthed() {
  await loadState()
  goHome()
}

async function handleLogout() {
  await loadState()
  goHome()
}
</script>
