<script setup lang="ts">
import { ref } from 'vue'
import { Send, Heart, Sparkles, Moon, MessageSquare } from 'lucide-vue-next'

defineProps<{
  isLightMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'quick-action', action: 'pat' | 'praise' | 'sleep'): void
  (e: 'send-message', text: string): void
}>()

const inputText = ref('')

const handleSend = () => {
  const trimmed = inputText.value.trim()
  if (trimmed) {
    emit('send-message', trimmed)
    inputText.value = ''
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="interactive-dock" :class="{ 'light-mode': isLightMode }">
    <!-- 4. Top: 3 Quick Interaction Buttons with transparent gradient & hover float -->
    <div class="quick-actions-bar">
      <button 
        type="button"
        class="cyber-btn btn-pat" @click="emit('quick-action', 'pat')">
        <span class="btn-glow"></span>
        <Heart :size="15" class="btn-icon icon-pat" />
        <span class="btn-text">摸摸头</span>
      </button>

      <button 
        type="button"
        class="cyber-btn btn-praise" @click="emit('quick-action', 'praise')">
        <span class="btn-glow"></span>
        <Sparkles :size="15" class="btn-icon icon-praise" />
        <span class="btn-text">夸夸它</span>
      </button>

      <button 
        type="button"
        class="cyber-btn btn-sleep" @click="emit('quick-action', 'sleep')">
        <span class="btn-glow"></span>
        <Moon :size="15" class="btn-icon icon-sleep" />
        <span class="btn-text">哄它睡觉</span>
      </button>
    </div>

    <!-- 1 & 4. Bottom: Glassmorphic Semantic Text Input Box -->
    <div class="input-container">
      <div class="input-wrapper">
        <div class="input-prefix">
          <MessageSquare :size="15" class="prefix-icon" />
        </div>
        <input
          v-model="inputText"
          type="text"
          class="cyber-input"
          placeholder="输入想对小灵说的话... 按回车发送 (如: 小灵真棒 / 摸摸 / 困啦晚安)"
          @keydown="onKeyDown"
        />
        <button 
          type="button"
          class="send-btn"
          :disabled="!inputText.trim()"
          @click="handleSend"
        >
          <Send :size="14" />
          <span class="send-label">发送</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interactive-dock {
  width: 100%;
  max-width: 660px;
  margin: 0 auto;
  padding: 0.8rem 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  z-index: 10;
}

.quick-actions-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}

/* 1 & 4. Glassmorphic Buttons with Transparent Gradient */
.cyber-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.72rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  color: #E0E0E0;
  font-size: 0.84rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cyber-btn:hover {
  transform: translateY(-3px);
  color: #ffffff;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
}

.cyber-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn-pat:hover {
  border-color: rgba(224, 64, 251, 0.4);
  box-shadow: 0 10px 28px rgba(224, 64, 251, 0.25), 0 0 16px rgba(224, 64, 251, 0.2);
}
.btn-pat .icon-pat {
  color: #e040fb;
  transition: transform 0.25s ease;
}
.btn-pat:hover .icon-pat {
  transform: scale(1.2);
}

.btn-praise:hover {
  border-color: rgba(255, 210, 0, 0.4);
  box-shadow: 0 10px 28px rgba(255, 210, 0, 0.25), 0 0 16px rgba(255, 210, 0, 0.2);
}
.btn-praise .icon-praise {
  color: #ffd200;
  transition: transform 0.25s ease;
}
.btn-praise:hover .icon-praise {
  transform: scale(1.2) rotate(12deg);
}

.btn-sleep:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 28px rgba(59, 130, 246, 0.25), 0 0 16px rgba(59, 130, 246, 0.2);
}
.btn-sleep .icon-sleep {
  color: #60a5fa;
  transition: transform 0.25s ease;
}
.btn-sleep:hover .icon-sleep {
  transform: scale(1.2) rotate(-12deg);
}

/* 1 & 4. Input Container */
.input-container {
  position: relative;
  border-radius: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(11, 15, 25, 0.52);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0.32rem 0.42rem 0.32rem 0.95rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  border-color: rgba(0, 242, 254, 0.45);
  box-shadow: 0 12px 36px rgba(0, 242, 254, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.prefix-icon {
  color: #64748b;
  margin-right: 0.6rem;
}

.cyber-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E0E0E0;
  font-size: 0.86rem;
  letter-spacing: 0.05em;
  padding: 0.5rem 0;
}

.cyber-input::placeholder {
  color: #64748b;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
}

.send-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 242, 254, 0.3);
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.85) 0%, rgba(2, 132, 199, 0.85) 100%);
  color: #040814;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.send-btn:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
  color: #64748b;
}

@media (max-width: 640px) {
  .quick-actions-bar {
    grid-template-columns: 1fr;
  }
}

/* Scoped Light Mode Styling for Interactive Dock */
.interactive-dock.light-mode .cyber-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(203, 213, 225, 0.95);
  color: #0f172a;
  font-weight: 600;
  font-size: 0.86rem;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
}

.interactive-dock.light-mode .cyber-btn:hover {
  background: #ffffff;
  color: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.1), inset 0 1px 0 #ffffff;
}

.interactive-dock.light-mode .btn-pat:hover {
  border-color: rgba(192, 38, 211, 0.65);
  box-shadow: 0 8px 24px rgba(192, 38, 211, 0.2), inset 0 1px 0 #ffffff;
}
.interactive-dock.light-mode .btn-praise:hover {
  border-color: rgba(217, 119, 6, 0.65);
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.2), inset 0 1px 0 #ffffff;
}
.interactive-dock.light-mode .btn-sleep:hover {
  border-color: rgba(37, 99, 235, 0.65);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2), inset 0 1px 0 #ffffff;
}

.interactive-dock.light-mode .btn-pat .icon-pat {
  color: #c026d3;
}
.interactive-dock.light-mode .btn-praise .icon-praise {
  color: #d97706;
}
.interactive-dock.light-mode .btn-sleep .icon-sleep {
  color: #2563eb;
}

.interactive-dock.light-mode .input-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(203, 213, 225, 0.95);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
  backdrop-filter: blur(14px);
}

.interactive-dock.light-mode .input-wrapper:focus-within {
  border-color: #0284c7;
  box-shadow: 0 8px 28px rgba(2, 132, 199, 0.2), 0 0 0 3px rgba(2, 132, 199, 0.15), inset 0 1px 0 #ffffff;
  background: #ffffff;
}

.interactive-dock.light-mode .prefix-icon {
  color: #0284c7;
}

.interactive-dock.light-mode .cyber-input {
  color: #0f172a;
  font-weight: 500;
  font-size: 0.88rem;
}

.interactive-dock.light-mode .cyber-input::placeholder {
  color: #64748b;
  font-size: 0.84rem;
}

.interactive-dock.light-mode .send-btn {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: 1px solid #0284c7;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.84rem;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.interactive-dock.light-mode .send-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.45);
  transform: translateY(-1px);
}

.interactive-dock.light-mode .send-btn:disabled {
  background: rgba(226, 232, 240, 0.85);
  border-color: rgba(203, 213, 225, 0.9);
  color: #94a3b8;
  box-shadow: none;
}
</style>
