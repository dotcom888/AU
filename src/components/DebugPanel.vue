<script setup lang="ts">
import { ref } from 'vue'
import type { EmotionType, ThemeColor, LogEntry, EmotionConfig } from '../types/pet'
import { 
  Terminal,
  Sun,
  Moon, 
  Activity, 
  Send, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Sliders,
  Radio
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  currentEmotion: EmotionType
  activeTheme: ThemeColor
  customThemeOverride: ThemeColor | null
  config: EmotionConfig
  logs: LogEntry[]
  isLightMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'set-emotion', emotion: EmotionType): void
  (e: 'set-theme', theme: ThemeColor | null): void
  (e: 'send-system-bubble', message: string): void
  (e: 'clear-logs'): void
  (e: 'toggle-light-mode'): void
}>()

const customBubbleText = ref('')

const handleInjectBubble = () => {
  const text = customBubbleText.value.trim()
  if (text) {
    emit('send-system-bubble', text)
    customBubbleText.value = ''
  }
}

const themeOptions: { key: ThemeColor; label: string; color: string }[] = [
  { key: 'cyan', label: "赛博青", color: "#00f2fe" },
  { key: 'yellow', label: "黄色", color: "#ffd200" },
  { key: 'pink-purple', label: "粉紫色", color: "#e040fb" },
  { key: 'deep-blue', label: "深蓝色", color: "#3b82f6" }
]

const emotionOptions: { key: EmotionType; label: string; code: string }[] = [
  { key: 'idle', label: "待机 Idle", code: "ST_IDLE" },
  { key: 'happy', label: "开心 Happy", code: "ST_HAPPY" },
  { key: 'shy', label: "害羞 Shy", code: "ST_SHY" },
  { key: 'sleepy', label: "犯困 Sleepy", code: "ST_SLEEP" }
]
</script>

<template>
  <aside 
    class="debug-sidebar"
    :class="{ 'is-collapsed': !isOpen, 'light-mode': isLightMode }"
  >
    <!-- Floating toggle tab visible when collapsed -->
    <button 
      type="button"
      class="floating-expand-btn"
      :title="isOpen ? '收起调试面板' : '展开调试面板'"
      @click="emit('toggle')"
    >
      <ChevronLeft v-if="!isOpen" :size="16" />
      <ChevronRight v-else :size="16" />
      <span v-if="!isOpen" class="vertical-text">远程调试台</span>
    </button>

    <!-- Panel Main Body (Glassmorphism) -->
    <div class="panel-inner">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-title-box">
          <Terminal :size="16" class="title-icon" />
          <div>
            <h2 class="title-main">DEBUG_TELEMETRY</h2>
            <p class="title-sub">状态监控与远程调试台</p>
          </div>
        </div>

        <div class="header-controls">
          <!-- Light / Dark Mode Icon Toggle Button (Pure Icon) -->
          <button 
            type="button" 
            class="mode-switch-btn"
            :title="isLightMode ? '切换至深色模式' : '切换至浅色模式'"
            @click="emit('toggle-light-mode')"
          >
            <Moon v-if="isLightMode" :size="15" class="mode-icon icon-moon" />
            <Sun v-else :size="15" class="mode-icon icon-sun" />
          </button>
          <span class="badge-online">
            <span class="dot-pulse"></span>
            ONLINE
          </span>
          <button 
            type="button"
            class="icon-close-btn"
            title="收起控制面板"
            @click="emit('toggle')"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>

      <div class="panel-content-scroll">
        <!-- Section 1: Realtime Telemetry Monitor -->
        <section class="panel-section">
          <div class="section-title">
            <Activity :size="14" />
            <span>实时状态监控 (STATE MONITOR)</span>
          </div>

          <div class="telemetry-card">
            <div class="state-badge-row">
              <div class="state-code-box">
                <span class="code-label">当前状态码</span>
                <span class="code-val" :class="'code-' + currentEmotion">{{ config.code }}</span>
              </div>
              <div class="state-name-box">
                <span class="name-label">动作模式</span>
                <span class="name-val">{{ config.label }}</span>
              </div>
            </div>
            <p class="state-desc">{{ config.description }}</p>
          </div>
        </section>

        <!-- Section 2: Manual Override Controls -->
        <section class="panel-section">
          <div class="section-title">
            <Sliders :size="14" />
            <span>手动调试开关 (MANUAL OVERRIDE)</span>
          </div>

          <!-- Emotion Forced Switch -->
          <div class="control-group">
            <label class="control-label">强制切换动作情绪：</label>
            <div class="emotion-btn-grid">
              <button 
                v-for="opt in emotionOptions" 
                :key="opt.key"
                type="button"
                class="emotion-switch-btn"
                :class="{ active: currentEmotion === opt.key }"
                @click="emit('set-emotion', opt.key)"
              >
                <span class="btn-dot"></span>
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Theme Color Switch -->
          <div class="control-group">
            <div class="theme-label-row">
              <label class="control-label">场景灯光主题色：</label>
              <button 
                v-if="customThemeOverride" 
                type="button"
                class="theme-reset-link" @click="emit('set-theme', null)">恢复自动联动</button>
            </div>
            
            <div class="theme-swatch-row">
              <button 
                v-for="t in themeOptions" 
                :key="t.key"
                type="button"
                class="theme-swatch-btn"
                :class="{ selected: activeTheme === t.key && (!customThemeOverride || customThemeOverride === t.key) }"
                :style="{ '--swatch-color': t.color }"
                @click="emit('set-theme', t.key)"
              >
                <span class="color-circle"></span>
                <span class="theme-name">{{ t.label }}</span>
              </button>
            </div>
          </div>

          <!-- System Bubble Broadcast Injection -->
          <div class="control-group">
            <label class="control-label">发送系统提示气泡 (BROADCAST)：</label>
            <div class="bubble-inject-form">
              <input 
                v-model="customBubbleText"
                type="text"
                class="inject-input"
                placeholder="输入系统广播消息..."
                @keydown.enter="handleInjectBubble"
              />
              <button 
                type="button" 
                class="inject-btn" :disabled="!customBubbleText.trim()" @click="handleInjectBubble"><Send :size="13" /><span>发送</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Section 3: Activity & Event Logs -->
        <section class="panel-section log-section">
          <div class="section-title-between">
            <div class="section-title">
              <Radio :size="14" />
              <span>互动历史日志 ({{ logs.length }})</span>
            </div>
            <button 
              type="button" 
              class="clear-log-btn" title="清空日志" @click="emit('clear-logs')"><Trash2 :size="12" /><span>清空</span></button>
          </div>

          <div class="log-terminal">
            <div v-if="logs.length === 0" class="log-empty">暂无历史事件，与伴侣宠物互动后将在此记录</div>
            <div 
              v-for="log in logs" 
              :key="log.id"
              class="log-row"
              :class="'log-lvl-' + log.level.toLowerCase()"
            >
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-tag">[{{ log.level }}]</span>
              <span class="log-msg">{{ log.message }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* 1. Sidebar with Glassmorphism */
.debug-sidebar {
  position: relative;
  width: 380px;
  height: 100%;
  background: rgba(10, 14, 25, 0.52);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -15px 0 45px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  z-index: 30;
  display: flex;
  flex-direction: column;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.debug-sidebar.is-collapsed {
  width: 0;
  border-left-color: transparent;
  transform: translateX(100%);
}

.floating-expand-btn {
  position: absolute;
  left: -34px;
  top: 76px;
  width: 34px;
  padding: 10px 5px;
  border-radius: 8px 0 0 8px;
  background: rgba(12, 17, 28, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-right: none;
  color: #00f2fe;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: -6px 6px 20px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
  z-index: 40;
}

.floating-expand-btn:hover {
  background: rgba(20, 30, 48, 0.88);
  color: #ffffff;
}

.vertical-text {
  writing-mode: vertical-lr;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  font-family: monospace;
  color: #E0E0E0;
}

.panel-inner {
  display: flex;
  flex-direction: column;
  width: 380px;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.015);
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.title-icon {
  color: #00f2fe;
}

.title-main {
  margin: 0;
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: #E0E0E0;
  letter-spacing: 0.06em;
}

.title-sub {
  margin: 0;
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.03em;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-online {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  font-size: 0.68rem;
  font-family: monospace;
  font-weight: 700;
  color: #4ade80;
}

.dot-pulse {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
  animation: dotBlink 1.5s infinite;
}

.icon-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.icon-close-btn:hover {
  color: #E0E0E0;
  background: rgba(255, 255, 255, 0.08);
}

.panel-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.15rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.06em;
}

.section-title-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 1. Glassmorphic Telemetry Card */
.telemetry-card {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.state-badge-row {
  display: flex;
  gap: 0.65rem;
}

.state-code-box, .state-name-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.code-label, .name-label {
  font-size: 0.65rem;
  color: #64748b;
  font-family: monospace;
  letter-spacing: 0.04em;
}

.code-val {
  font-family: monospace;
  font-size: 0.86rem;
  font-weight: 700;
}

.code-idle { color: #00f2fe; }
.code-happy { color: #ffd200; }
.code-shy { color: #e040fb; }
.code-sleepy { color: #3b82f6; }

.name-val {
  font-size: 0.82rem;
  font-weight: 500;
  color: #E0E0E0;
  letter-spacing: 0.04em;
}

.state-desc {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
  letter-spacing: 0.03em;
}



/* Control Group */
.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
}

.control-label {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.theme-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-reset-link {
  background: transparent;
  border: none;
  font-size: 0.68rem;
  color: #00f2fe;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  letter-spacing: 0.03em;
}

.emotion-btn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
}

.emotion-switch-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #64748b;
  transition: all 0.2s ease;
}

.emotion-switch-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  color: #E0E0E0;
}

.emotion-switch-btn.active {
  background: rgba(0, 242, 254, 0.1);
  border-color: rgba(0, 242, 254, 0.45);
  color: #E0E0E0;
  font-weight: 600;
}

.emotion-switch-btn.active .btn-dot {
  background: #00f2fe;
  box-shadow: 0 0 6px #00f2fe;
}

/* Theme Swatches */
.theme-swatch-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
}

.theme-swatch-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.2rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-swatch-btn .color-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--swatch-color);
  box-shadow: 0 0 6px var(--swatch-color);
}

.theme-name {
  font-size: 0.68rem;
  color: #94a3b8;
  letter-spacing: 0.03em;
}

.theme-swatch-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-swatch-btn.selected {
  border-color: var(--swatch-color);
  background: rgba(255, 255, 255, 0.06);
}

.theme-swatch-btn.selected .theme-name {
  color: #E0E0E0;
  font-weight: 600;
}

/* System Bubble Inject Form */
.bubble-inject-form {
  display: flex;
  gap: 0.45rem;
}

.inject-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  color: #E0E0E0;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  outline: none;
}

.inject-input:focus {
  border-color: rgba(0, 242, 254, 0.45);
}

.inject-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: rgba(0, 242, 254, 0.85);
  color: #040814;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.25s ease;
}

.inject-btn:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 12px rgba(0, 242, 254, 0.35);
}

.inject-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.06);
  color: #64748b;
}

/* Log Terminal */
.log-section {
  flex: 1;
}

.clear-log-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: none;
  font-size: 0.68rem;
  color: #64748b;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
}

.clear-log-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.log-terminal {
  height: 400px;
  min-height: 380px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(6, 8, 14, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 0.6rem 0.7rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.log-empty {
  color: #475569;
  text-align: center;
  margin-top: 3.2rem;
}

.log-row {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  word-break: break-all;
}

.log-time {
  color: #475569;
  flex-shrink: 0;
}

.log-tag {
  font-weight: 700;
  flex-shrink: 0;
}

.log-lvl-user_input .log-tag { color: #38bdf8; }
.log-lvl-quick_action .log-tag { color: #facc15; }
.log-lvl-override .log-tag { color: #f43f5e; }
.log-lvl-system .log-tag { color: #e040fb; }
.log-lvl-ambient .log-tag { color: #34d399; }

.log-msg {
  color: #cbd5e1;
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}


/* Light Theme Overrides for Debug Sidebar */
:global(.light-theme) .debug-sidebar {
  background: rgba(255, 255, 255, 0.78);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: -15px 0 45px rgba(0, 0, 0, 0.06);
}

:global(.light-theme) .title-main {
  color: #0f172a;
}

:global(.light-theme) .title-sub {
  color: #64748b;
}

:global(.light-theme) .section-title {
  color: #334155;
}

:global(.light-theme) .telemetry-card,
:global(.light-theme) .control-group {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}

:global(.light-theme) .state-code-box,
:global(.light-theme) .state-name-box {
  background: rgba(241, 245, 249, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

:global(.light-theme) .name-val {
  color: #0f172a;
}

:global(.light-theme) .control-label {
  color: #475569;
}

:global(.light-theme) .emotion-switch-btn {
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #334155;
}

:global(.light-theme) .emotion-switch-btn:hover {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(0, 0, 0, 0.15);
}

:global(.light-theme) .emotion-switch-btn.active {
  background: rgba(0, 242, 254, 0.14);
  border-color: rgba(0, 180, 216, 0.5);
  color: #0369a1;
}

:global(.light-theme) .theme-swatch-btn {
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

:global(.light-theme) .theme-swatch-btn.selected {
  background: #ffffff;
}

:global(.light-theme) .theme-name {
  color: #475569;
}

:global(.light-theme) .theme-swatch-btn.selected .theme-name {
  color: #0f172a;
}

:global(.light-theme) .inject-input {
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #0f172a;
}

:global(.light-theme) .log-terminal {
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.03);
}

:global(.light-theme) .log-msg {
  color: #334155;
}

:global(.light-theme) .log-time {
  color: #94a3b8;
}

:global(.light-theme) .mode-switch-btn {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #1e293b;
}

:global(.light-theme) .mode-switch-btn:hover {
  background: rgba(0, 0, 0, 0.09);
  color: #0f172a;
}

:global(.light-theme) .floating-expand-btn {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #0284c7;
}

:global(.light-theme) .vertical-text {
  color: #334155;
}


/* Light / Dark Mode Toggle Icon Button */
.mode-switch-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E0E0E0;
  cursor: pointer;
  transition: all 0.25s ease;
}

.mode-switch-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

.mode-icon.icon-sun {
  color: #fbbf24;
}

.mode-icon.icon-moon {
  color: #38bdf8;
}

/* Scoped Light Mode Styling for Debug Sidebar */
.debug-sidebar.light-mode {
  background: rgba(255, 255, 255, 0.88);
  border-left: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: -10px 0 32px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(20px);
}

.debug-sidebar.light-mode .title-main {
  color: #0f172a;
}

.debug-sidebar.light-mode .title-sub {
  color: #64748b;
}

.debug-sidebar.light-mode .section-title {
  color: #334155;
}

.debug-sidebar.light-mode .telemetry-card,
.debug-sidebar.light-mode .control-group {
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.85);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.debug-sidebar.light-mode .state-code-box,
.debug-sidebar.light-mode .state-name-box {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
}

.debug-sidebar.light-mode .name-val {
  color: #0f172a;
}

.debug-sidebar.light-mode .code-label,
.debug-sidebar.light-mode .name-label {
  color: #64748b;
}

.debug-sidebar.light-mode .control-label {
  color: #475569;
}

.debug-sidebar.light-mode .emotion-switch-btn {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: #334155;
}

.debug-sidebar.light-mode .emotion-switch-btn:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: rgba(203, 213, 225, 0.9);
}

.debug-sidebar.light-mode .emotion-switch-btn.active {
  background: rgba(2, 132, 199, 0.1);
  border-color: rgba(2, 132, 199, 0.45);
  color: #0284c7;
}

.debug-sidebar.light-mode .theme-swatch-btn {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.debug-sidebar.light-mode .theme-swatch-btn.selected {
  background: #f1f5f9;
}

.debug-sidebar.light-mode .theme-name {
  color: #475569;
}

.debug-sidebar.light-mode .theme-swatch-btn.selected .theme-name {
  color: #0f172a;
}

.debug-sidebar.light-mode .inject-input {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: #0f172a;
}

.debug-sidebar.light-mode .inject-input:focus {
  border-color: rgba(2, 132, 199, 0.55);
}

.debug-sidebar.light-mode .log-terminal {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.03);
}

.debug-sidebar.light-mode .log-msg {
  color: #334155;
}

.debug-sidebar.light-mode .log-time {
  color: #94a3b8;
}

.debug-sidebar.light-mode .log-empty {
  color: #94a3b8;
}

.debug-sidebar.light-mode .mode-switch-btn {
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.debug-sidebar.light-mode .mode-switch-btn:hover {
  background: rgba(15, 23, 42, 0.09);
}

.debug-sidebar.light-mode .floating-expand-btn {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-right: none;
  color: #0284c7;
  box-shadow: -4px 4px 16px rgba(15, 23, 42, 0.08);
}

.debug-sidebar.light-mode .vertical-text {
  color: #334155;
}

.debug-sidebar.light-mode .badge-online {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #059669;
}

.debug-sidebar.light-mode .icon-close-btn {
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
}

.debug-sidebar.light-mode .icon-close-btn:hover {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

</style>
