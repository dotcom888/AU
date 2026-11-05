<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { EmotionType, EmotionConfig, ThemeColor } from '../types/pet'
import { Terminal } from 'lucide-vue-next'
import { GrokBall } from '../utils/grok-ball'

const props = defineProps<{
  emotion: EmotionType
  config: EmotionConfig
  theme: ThemeColor
  speech: string
  speechVisible: boolean
  systemBubble: string | null
  isLightMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'pet-click'): void
}>()

// 1. Emotion mapping: Map business emotions to Grok Ball 32 built-in emotion IDs
// Idle -> '02' (待机放空)
// Happy -> '10' (开心雀跃)
// Shy -> '14' (委屈害羞)
// Sleepy -> '00' (休眠 / 带 3D 浮动 zzz 粒子)
const GROK_EMOTION_MAP: Record<EmotionType, string> = {
  idle: '02',
  happy: '10',
  shy: '14',
  sleepy: '00'
}

// Color theme mapping for Grok Ball body & eye colors

const THEME_COLOR_MAP: Record<ThemeColor, { body: string; eye: string }> = {
  cyan: { body: '#0f2438', eye: '#00f2fe' },
  yellow: { body: '#2e2508', eye: '#ffd200' },
  'pink-purple': { body: '#2d1136', eye: '#e040fb' },
  'deep-blue': { body: '#0d1a38', eye: '#3b82f6' }
}

const mountRef = ref<HTMLDivElement | null>(null)
let grokInstance: any = null

// Mouse Pointer Tracking Listener (Gaze calculation: normalized -1 to 1)
const onPointerMove = (e: MouseEvent) => {
  if (!grokInstance || !mountRef.value) return
  const rect = mountRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  // Calculate relative normalized vector
  const nx = (e.clientX - centerX) / (window.innerWidth / 2)
  const ny = (e.clientY - centerY) / (window.innerHeight / 2)
  
  grokInstance.setGaze(nx, ny)
}

const onPointerLeave = () => {
  if (grokInstance) {
    grokInstance.clearGaze()
  }
}

// Click interaction: Trigger spin & bounce on Grok Ball
const onPetClick = () => {
  if (grokInstance) {
    grokInstance.bounce()
    grokInstance.spin()
  }
  emit('pet-click')
}

// Watch emotion changes and bridge to Grok Ball API
watch(
  () => props.emotion,
  (newEmotion) => {
    if (!grokInstance) return
    const targetEmotionId = GROK_EMOTION_MAP[newEmotion] || '02'
    grokInstance.setEmotion(targetEmotionId)
  }
)

// Watch theme changes and update Grok Ball body & eye colors
watch(
  () => props.theme,
  (newTheme) => {
    if (!grokInstance) return
    const colors = THEME_COLOR_MAP[newTheme] || THEME_COLOR_MAP.cyan
    if (typeof grokInstance.setTheme === 'function') {
      grokInstance.setTheme(colors.body, colors.eye)
    }
  }
)

onMounted(() => {
  if (!mountRef.value) return
  
  const initialEmotionId = GROK_EMOTION_MAP[props.emotion] || '02'
  const colors = THEME_COLOR_MAP[props.theme] || THEME_COLOR_MAP.cyan

  // Initialize Grok Ball with SVG engine
  grokInstance = GrokBall.create(mountRef.value, {
    emotion: initialEmotionId,
    color: colors.body,
    eyeColor: colors.eye,
    eyeScale: 1.15,
    autostart: true,
    idle: false
  })

  // Attach mouse gaze tracking
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('mouseleave', onPointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('mouseleave', onPointerLeave)
  if (grokInstance) {
    grokInstance.destroy()
    grokInstance = null
  }
})
</script>

<template>
  <div class="pet-stage" :class="{ 'light-mode': isLightMode }">
    <!-- Giant Behind-Sphere Ambient Aura (Follows State with 0.8s Transition) -->
    <div class="giant-state-aura" :class="'aura-state-' + emotion"></div>

    <!-- System Broadcast Alert Banner (Glassmorphism) -->
    <transition name="hud-slide">
      <div v-if="systemBubble" class="system-hud-banner">
        <div class="hud-icon-wrap">
          <Terminal :size="15" class="hud-icon" />
        </div>
        <div class="hud-text-content">
          <span class="hud-label">SYSTEM_ALERT:</span>
          <span class="hud-msg">{{ systemBubble }}</span>
        </div>
      </div>
    </transition>

    <!-- Pet Dynamic Dialogue Bubble (Glassmorphism) -->
    <transition name="bubble-pop">
      <div v-if="speechVisible" class="speech-bubble-wrapper">
        <div class="speech-bubble" :class="'bubble-' + emotion">
          <div class="bubble-header">
            <span class="tag-name">小灵</span>
            <span class="tag-state">[{{ config.code }}]</span>
          </div>
          <p class="bubble-text">{{ speech }}</p>
          <div class="bubble-beak"></div>
        </div>
      </div>
    </transition>

    <!-- Grok Ball Mount Anchor -->
    <div 
      class="grok-ball-stage-anchor"
      :class="'state-' + emotion"
      @click="onPetClick"
      title="点击互动 (触发加速自旋与弹跳)">

      <!-- Grok Ball SVG Mount Target -->
      <div ref="mountRef" class="grok-ball-mount"></div>

      <!-- Soft Ground Breathing Shadow -->
      <div class="ground-shadow"></div>
    </div>

  </div>
</template>

<style scoped>
.pet-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  padding: 1.5rem;
  user-select: none;
}

/* Giant Behind-Sphere Aura Halo with 0.8s Smooth Transition */
.giant-state-aura {
  position: absolute;
  top: 52%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(85px);
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: screen;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: auraBreath 4.5s ease-in-out infinite alternate;
}

.aura-state-idle {
  background: radial-gradient(circle, rgba(0, 242, 254, 0.44) 0%, rgba(0, 242, 254, 0.16) 45%, transparent 72%);
  box-shadow: 0 0 100px rgba(0, 242, 254, 0.35);
}

.aura-state-happy {
  background: radial-gradient(circle, rgba(255, 210, 0, 0.5) 0%, rgba(255, 170, 0, 0.18) 45%, transparent 72%);
  box-shadow: 0 0 110px rgba(255, 210, 0, 0.4);
}

.aura-state-shy {
  background: radial-gradient(circle, rgba(224, 64, 251, 0.46) 0%, rgba(255, 45, 117, 0.18) 45%, transparent 72%);
  box-shadow: 0 0 100px rgba(224, 64, 251, 0.36);
}

.aura-state-sleepy {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.46) 0%, rgba(30, 58, 138, 0.2) 45%, transparent 72%);
  box-shadow: 0 0 100px rgba(59, 130, 246, 0.38);
}

@keyframes auraBreath {
  0% { transform: translate(-50%, -50%) scale(0.88); opacity: 0.75; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
}

/* Glassmorphism System Alert */
.system-hud-banner {
  position: absolute;
  top: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 1.15rem;
  background: rgba(13, 17, 28, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  z-index: 20;
  max-width: 90%;
}

.hud-icon {
  color: #00f2fe;
}

.hud-label {
  font-size: 0.72rem;
  font-family: monospace;
  font-weight: 700;
  color: #00f2fe;
  margin-right: 0.45rem;
  letter-spacing: 0.06em;
}

.hud-msg {
  font-size: 0.82rem;
  color: #E0E0E0;
  letter-spacing: 0.04em;
}

/* Glassmorphic Speech Bubble */
.speech-bubble-wrapper {
  margin-bottom: 1.8rem;
  z-index: 10;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.5));
}

.speech-bubble {
  position: relative;
  padding: 0.95rem 1.35rem;
  max-width: 420px;
  border-radius: 16px;
  background: rgba(13, 17, 28, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.bubble-idle { border-color: rgba(0, 242, 254, 0.22); }
.bubble-happy { border-color: rgba(255, 210, 0, 0.25); }
.bubble-shy { border-color: rgba(224, 64, 251, 0.25); }
.bubble-sleepy { border-color: rgba(59, 130, 246, 0.25); }

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
  font-family: monospace;
}

.tag-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
}

.tag-state {
  font-size: 0.68rem;
  color: #64748b;
  letter-spacing: 0.04em;
}

.bubble-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #E0E0E0;
  letter-spacing: 0.05em;
}

.bubble-beak {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 14px;
  height: 14px;
  background: rgba(13, 17, 28, 0.7);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Grok Ball Stage Anchor */
.grok-ball-stage-anchor {
  position: relative;
  width: 260px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  animation: petBreathingFloat 4.2s ease-in-out infinite;
}

.state-idle {
  --state-glow: rgba(0, 242, 254, 0.4);
  --state-color: #00f2fe;
}
.state-happy {
  --state-glow: rgba(255, 210, 0, 0.5);
  --state-color: #ffd200;
}
.state-shy {
  --state-glow: rgba(224, 64, 251, 0.42);
  --state-color: #e040fb;
}
.state-sleepy {
  --state-glow: rgba(59, 130, 246, 0.4);
  --state-color: #3b82f6;
}

/* Mount Target for Grok Ball Pure SVG */
.grok-ball-mount {
  width: 210px;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 28px var(--state-glow));
  transition: filter 0.8s ease;
}

.grok-ball-mount :deep(svg) {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Soft Ground Shadow */
.ground-shadow {
  position: absolute;
  bottom: -15px;
  width: 160px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.72) 0%, transparent 70%);
  filter: blur(8px);
  pointer-events: none;
  animation: shadowBreathe 4.2s ease-in-out infinite;
}


@keyframes petBreathingFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-14px) scale(1.02);
  }
}

@keyframes shadowBreathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.72;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.42;
  }
}

.bubble-pop-enter-active, .bubble-pop-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-pop-enter-from, .bubble-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

.hud-slide-enter-active, .hud-slide-leave-active {
  transition: all 0.35s ease;
}
.hud-slide-enter-from, .hud-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scoped Light Mode Styling for Pet Stage */
.pet-stage.light-mode .speech-bubble-wrapper {
  filter: none;
}

.pet-stage.light-mode .speech-bubble {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(203, 213, 225, 0.95);
  box-shadow: 0 14px 34px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
  backdrop-filter: blur(16px);
}

.pet-stage.light-mode .speech-bubble.bubble-idle {
  border-color: rgba(2, 132, 199, 0.45);
  box-shadow: 0 14px 34px -4px rgba(2, 132, 199, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 #ffffff;
}
.pet-stage.light-mode .speech-bubble.bubble-happy {
  border-color: rgba(217, 119, 6, 0.5);
  box-shadow: 0 14px 34px -4px rgba(217, 119, 6, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 #ffffff;
}
.pet-stage.light-mode .speech-bubble.bubble-shy {
  border-color: rgba(192, 38, 211, 0.45);
  box-shadow: 0 14px 34px -4px rgba(192, 38, 211, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 #ffffff;
}
.pet-stage.light-mode .speech-bubble.bubble-sleepy {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 14px 34px -4px rgba(37, 99, 235, 0.15), 0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 #ffffff;
}

.pet-stage.light-mode .tag-name {
  color: #0f172a;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.pet-stage.light-mode .tag-state {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  border: 1px solid rgba(2, 132, 199, 0.25);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
}

.pet-stage.light-mode .speech-bubble.bubble-happy .tag-state {
  color: #b45309;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.3);
}

.pet-stage.light-mode .speech-bubble.bubble-shy .tag-state {
  color: #c026d3;
  background: rgba(192, 38, 211, 0.1);
  border-color: rgba(192, 38, 211, 0.3);
}

.pet-stage.light-mode .speech-bubble.bubble-sleepy .tag-state {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.3);
}

.pet-stage.light-mode .bubble-text {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: 0.02em;
}

.pet-stage.light-mode .bubble-beak {
  background: rgba(255, 255, 255, 0.96);
  border-right: 1.5px solid rgba(203, 213, 225, 0.95);
  border-bottom: 1.5px solid rgba(203, 213, 225, 0.95);
}

.pet-stage.light-mode .speech-bubble.bubble-idle .bubble-beak {
  border-right-color: rgba(2, 132, 199, 0.45);
  border-bottom-color: rgba(2, 132, 199, 0.45);
}
.pet-stage.light-mode .speech-bubble.bubble-happy .bubble-beak {
  border-right-color: rgba(217, 119, 6, 0.5);
  border-bottom-color: rgba(217, 119, 6, 0.5);
}
.pet-stage.light-mode .speech-bubble.bubble-shy .bubble-beak {
  border-right-color: rgba(192, 38, 211, 0.45);
  border-bottom-color: rgba(192, 38, 211, 0.45);
}
.pet-stage.light-mode .speech-bubble.bubble-sleepy .bubble-beak {
  border-right-color: rgba(37, 99, 235, 0.45);
  border-bottom-color: rgba(37, 99, 235, 0.45);
}

.pet-stage.light-mode .system-hud-banner {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(203, 213, 225, 0.95);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
}

.pet-stage.light-mode .hud-icon {
  color: #0284c7;
}

.pet-stage.light-mode .hud-label {
  color: #0284c7;
  font-weight: 700;
}

.pet-stage.light-mode .hud-msg {
  color: #0f172a;
  font-weight: 500;
}

.pet-stage.light-mode .giant-state-aura {
  mix-blend-mode: multiply;
  filter: blur(95px);
  opacity: 0.38;
}

.pet-stage.light-mode .ground-shadow {
  background: radial-gradient(ellipse at center, rgba(71, 85, 105, 0.22) 0%, transparent 70%);
}
</style>
