<script setup lang="ts">
import { ref } from 'vue'
import { usePetState } from './composables/usePetState'
import CyberBackground from './components/CyberBackground.vue'
import CyberPet from './components/CyberPet.vue'
import InteractiveDock from './components/InteractiveDock.vue'
import DebugPanel from './components/DebugPanel.vue'

const {
  currentEmotion,
  activeTheme,
  customThemeOverride,
  currentSpeech,
  speechVisible,
  systemBubble,
  logs,
  currentConfig,
  handleQuickAction,
  handleUserInput,
  setManualEmotion,
  setThemeOverride,
  sendSystemBubble,
  clearLogs
} = usePetState()

const isDebugOpen = ref(true)
const isLightMode = ref(false)

const toggleLightMode = () => {
  isLightMode.value = !isLightMode.value
}

const toggleDebug = () => {
  isDebugOpen.value = !isDebugOpen.value
}

const onPetDirectClick = () => {
  handleQuickAction('pat')
}
</script>

<template>
  <div class="app-viewport" :class="{ 'light-theme': isLightMode }">
    <!-- Animated Cyber Ambient Background with Breathing Aura -->
    <CyberBackground :theme="activeTheme" :is-light-mode="isLightMode" />


    <!-- Two-column Cyber Layout -->
    <div class="app-layout-container">
      <!-- Left Column: Primary Pet Interactive Viewport -->
      <main class="main-viewport">
        <!-- Center: CyberPet Creature Display Area -->
        <CyberPet
          :emotion="currentEmotion"
          :config="currentConfig"
          :speech="currentSpeech"
          :speech-visible="speechVisible"
          :system-bubble="systemBubble"
          @pet-click="onPetDirectClick"
          :theme="activeTheme"
          :is-light-mode="isLightMode"
        />


        <!-- Bottom: Interactive Dock (Input & 3 Buttons) -->
        <InteractiveDock
          :is-light-mode="isLightMode"
          @quick-action="handleQuickAction"
          @send-message="handleUserInput"
        />
      </main>

      <!-- Right Column: Collapsible Remote Debug Panel -->
      <DebugPanel
        :is-open="isDebugOpen"
        :current-emotion="currentEmotion"
        :active-theme="activeTheme"
        :custom-theme-override="customThemeOverride"
        :config="currentConfig"
        :logs="logs"
        @toggle="toggleDebug"
        @set-emotion="setManualEmotion"
        @set-theme="setThemeOverride"
        @send-system-bubble="sendSystemBubble"
        @clear-logs="clearLogs"
        :is-light-mode="isLightMode"
        @toggle-light-mode="toggleLightMode"
      />
    </div>
  </div>
</template>

<style scoped>
.app-viewport {
  transition: background-color 0.5s ease, color 0.5s ease;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #08090f;
  color: #f1f59f;
}

.app-viewport.light-theme {
  background-color: #f1f4f9;
  color: #1e293b;
}

.app-layout-container {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.main-viewport {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  min-width: 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 900px) {
  .app-layout-container {
    flex-direction: column;
  }
}
</style>
