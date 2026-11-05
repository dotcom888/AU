<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeColor } from '../types/pet'

const props = defineProps<{
  theme: ThemeColor
  isLightMode?: boolean
}>()

const themeClass = computed(() => 'theme-' + props.theme)
</script>

<template>
  <div class="cyber-bg" :class="[themeClass, { 'light-mode': isLightMode }]">
    <div class="grid-ultra-subtle"></div>
    <div class="space-ambient-aura aura-left"></div>
    <div class="space-ambient-aura aura-right"></div>
  </div>
</template>

<style scoped>
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background-color: #06070c;
  pointer-events: none;
  transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-cyan {
  --ambient-core: rgba(0, 242, 254, 0.16);
  --ambient-outer: rgba(4, 93, 233, 0.06);
}

.theme-yellow {
  --ambient-core: rgba(255, 210, 0, 0.18);
  --ambient-outer: rgba(234, 179, 8, 0.06);
}

.theme-pink-purple {
  --ambient-core: rgba(224, 64, 251, 0.16);
  --ambient-outer: rgba(168, 85, 247, 0.06);
}

.theme-deep-blue {
  --ambient-core: rgba(59, 130, 246, 0.18);
  --ambient-outer: rgba(30, 58, 138, 0.06);
}

.grid-ultra-subtle {
  position: absolute;
  inset: 0;
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 80%);
}

.space-ambient-aura {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease;
}

.aura-left {
  width: 55vw;
  height: 55vw;
  max-width: 700px;
  max-height: 700px;
  left: 20%;
  top: 40%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, var(--ambient-core) 0%, var(--ambient-outer) 50%, transparent 75%);
  animation: ambientFloat 8s ease-in-out infinite alternate;
}

.aura-right {
  width: 45vw;
  height: 45vw;
  max-width: 550px;
  max-height: 550px;
  right: 12%;
  top: 25%;
  background: radial-gradient(circle, var(--ambient-core) 0%, transparent 70%);
  animation: ambientFloat 11s ease-in-out infinite alternate-reverse;
}

@keyframes ambientFloat {
  0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
  50% { transform: translate(-48%, -52%) scale(1.08); opacity: 1; }
  100% { transform: translate(-52%, -48%) scale(0.95); opacity: 0.8; }
}

.cyber-bg.light-mode {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
}

.cyber-bg.light-mode .grid-ultra-subtle {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 25%, transparent 80%);
}

.cyber-bg.light-mode .space-ambient-aura {
  mix-blend-mode: multiply;
  opacity: 0.42;
  filter: blur(130px);
}

</style>
