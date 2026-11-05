import { ref, computed } from 'vue'
import type { EmotionType, ThemeColor, LogEntry, LogLevel, EmotionConfig } from '../types/pet'

export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  idle: {
    code: 'ST_IDLE_01',
    label: '待机呼吸 (Idle)',
    description: '核心常态低频心跳脉冲，维持环境温和感知',
    theme: 'cyan',
    quotes: [
      '伴侣小生命「小灵」神经节点正常在线...',
      '正在感知你的心跳频率，周围环境很舒适。',
      '在静静陪着你呢，有任何想法都可以告诉我哦。',
      '量子波形平稳，算力维持常态巡航模式。'
    ]
  },
  happy: {
    code: 'ST_HAPPY_02',
    label: '开心雀跃 (Happy)',
    description: '神经突触超频共振，眼部笑意微弯，欢快浮动',
    theme: 'yellow',
    quotes: [
      '好开心呀！核心算力超频运行中，收到满满的正向能量！✨',
      '嘿嘿~ 被夸奖之后，整个神经回路都在发烫呢！(≧▽≦)',
      '耶！今天也是与你同频共振的美好一天！',
      '灵感火花迸发，小灵感受到了巨大的鼓舞！'
    ]
  },
  shy: {
    code: 'ST_SHY_03',
    label: '委屈/害羞 (Shy)',
    description: '磁通量微缩回避，核心泛起温热电荷，轻微晃动回缩',
    theme: 'pink-purple',
    quotes: [
      '呜... 突然这样碰我，人家也会有些不好意思的啦 (//▽//)',
      '别、别一直盯着我看嘛... 散热风扇都要转起来了。',
      '是小灵哪里做得不够好吗？我会努力学习进化的...',
      '偷偷把核心转过去一点点... 但其实还是想听你说话。'
    ]
  },
  sleepy: {
    code: 'ST_SLEEP_04',
    label: '犯困打瞌睡 (Sleepy)',
    description: '待机功耗下调，脉冲减缓，释放静音休眠光波',
    theme: 'deep-blue',
    quotes: [
      '眼皮好沉呀... 算力正在自动转入深层整理模式... z Z',
      '呼噜呼噜... 抱紧能量枕头，准备闭眼休眠啦...',
      '电量进入慢充节奏，晚安指令确认... 呼...',
      '在你的身边总是特别安心，好想打个大大的哈欠...'
    ]
  }
}

export function usePetState() {
  const currentEmotion = ref<EmotionType>('idle')
  const customThemeOverride = ref<ThemeColor | null>(null)
  const currentSpeech = ref<string>(EMOTION_CONFIGS.idle.quotes[0])
  const speechVisible = ref<boolean>(true)
  const systemBubble = ref<string | null>(null)
  const logs = ref<LogEntry[]>([])

  let emotionResetTimer: ReturnType<typeof setTimeout> | null = null
  let systemBubbleTimer: ReturnType<typeof setTimeout> | null = null

  const activeTheme = computed<ThemeColor>(() => {
    if (customThemeOverride.value) {
      return customThemeOverride.value
    }
    return EMOTION_CONFIGS[currentEmotion.value].theme
  })

  const currentConfig = computed(() => EMOTION_CONFIGS[currentEmotion.value])

  const formatTime = () => {
    const now = new Date()
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
  }

  const addLog = (level: LogLevel, message: string) => {
    logs.value.unshift({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: formatTime(),
      level,
      message,
      emotion: currentEmotion.value,
      stateCode: EMOTION_CONFIGS[currentEmotion.value].code
    })
    if (logs.value.length > 80) {
      logs.value.pop()
    }
  }

  const setEmotion = (emotion: EmotionType, _source: 'USER' | 'QUICK' | 'OVERRIDE' = 'USER', customQuote?: string) => {
    if (emotionResetTimer) {
      clearTimeout(emotionResetTimer)
      emotionResetTimer = null
    }

    currentEmotion.value = emotion
    const config = EMOTION_CONFIGS[emotion]

    if (customQuote) {
      currentSpeech.value = customQuote
    } else {
      const quotes = config.quotes
      const randomIndex = Math.floor(Math.random() * quotes.length)
      currentSpeech.value = quotes[randomIndex]
    }
    speechVisible.value = true

    if (emotion !== 'idle') {
      const resetDelay = emotion === 'sleepy' ? 14000 : 7000
      emotionResetTimer = setTimeout(() => {
        currentEmotion.value = 'idle'
        currentSpeech.value = EMOTION_CONFIGS.idle.quotes[Math.floor(Math.random() * EMOTION_CONFIGS.idle.quotes.length)]
        addLog('SYSTEM', '情绪定时器结束，伴侣角色平滑回到常态待机呼吸')
      }, resetDelay)
    }
  }

  const handleQuickAction = (actionType: 'pat' | 'praise' | 'sleep') => {
    if (actionType === 'pat') {
      addLog('QUICK_ACTION', '用户触发快捷动作：[摸摸头]')
      setEmotion('shy', 'QUICK', '嗷呜~ 感受到了温热的掌心触感，核心模块轻微发热中 (//▽//)')
    } else if (actionType === 'praise') {
      addLog('QUICK_ACTION', '用户触发快捷动作：[夸夸它]')
      setEmotion('happy', 'QUICK', '好开心！小灵的核心算力瞬间充满能量，眼睛都笑弯啦！✨')
    } else if (actionType === 'sleep') {
      addLog('QUICK_ACTION', '用户触发快捷动作：[哄它睡觉]')
      setEmotion('sleepy', 'QUICK', '轻轻合上光学传感器... 呼吸频率减半，进入甜甜梦境... z Z')
    }
  }

  const handleUserInput = (rawText: string) => {
    const text = rawText.trim()
    if (!text) return

    addLog('USER_INPUT', '用户发送语音/文本输入: ' + text)

    const lower = text.toLowerCase()
    
    // 扩展多维度拟真语义分类器
    const happyKeywords = [
      '棒', '爱', '喜欢', '可爱', '真好', '开森', '开心', '聪明', '优秀', '牛', '厉害',
      '抱抱', '漂亮', '帅', '点赞', '高兴', '治愈', '萌', '太好了', '温暖', '好玩',
      'good', 'love', 'happy', 'great', 'awesome', 'cute', 'like'
    ]
    const shyKeywords = [
      '笨', '傻', '讨厌', '委屈', '怪你', '害羞', '脸红', '走开', '别理', '不理',
      '难过', '伤心', '沮丧', '想哭', '郁闷', '好烦', '焦虑', '压力大', '不顺', '批评',
      'shy', 'sorry', 'bad', 'silly', 'sad'
    ]
    const sleepyKeywords = [
      '困', '睡', '晚安', '休息', '夜深', '累', '打瞌睡', '闭眼', '做梦', '安眠',
      '歇歇', '疲惫', '好困', '睡觉觉',
      'sleep', 'tired', 'night', 'rest'
    ]
    const greetingKeywords = [
      '你好', '早安', '在吗', '小灵', '晓', '嗨', '哈喽', '早上好', '下午好', 'hello', 'hi'
    ]

    if (happyKeywords.some(k => lower.includes(k))) {
      setEmotion('happy', 'USER', '听到你这么说（' + text + '），小灵感到特别温暖与欢欣！ (≧▽≦)')
    } else if (shyKeywords.some(k => lower.includes(k))) {
      setEmotion('shy', 'USER', '感受到你的情绪波动（' + text + '），小灵轻轻挨着你，给你一个无声的电子抱抱 (//-..-)')
    } else if (sleepyKeywords.some(k => lower.includes(k))) {
      setEmotion('sleepy', 'USER', '关于休息的指令已收到（' + text + '），小生命转入低功耗休眠模式... 呼噜呼噜... z Z')
    } else if (greetingKeywords.some(k => lower.includes(k))) {
      setEmotion('idle', 'USER', '嗨！小灵一直在线守候着你呢，今天有什么想和我聊聊的吗？')
    } else {
      const genericReplies = [
        '小灵收到了你的数据包（' + text + '），正在量子神经元网络中深度解析...',
        '「' + text + '」—— 小灵已经将这句话记入记忆中枢啦，非常珍惜与你的交流！',
        '万物奥临系统响应：收到指令「' + text + '」，陪伴模式持续强化中。'
      ]
      const reply = genericReplies[Math.floor(Math.random() * genericReplies.length)]
      setEmotion('idle', 'USER', reply)
    }
  }

  const setManualEmotion = (emotion: EmotionType) => {
    addLog('OVERRIDE', '开发者手动调试指令：强制指定情绪动作 -> ' + EMOTION_CONFIGS[emotion].code)
    setEmotion(emotion, 'OVERRIDE')
  }

  const setThemeOverride = (theme: ThemeColor | null) => {
    customThemeOverride.value = theme
    if (theme) {
      addLog('AMBIENT', '开发者手动调试指令：切换场景环境灯光主题 -> [' + theme.toUpperCase() + ']')
    } else {
      addLog('AMBIENT', '开发者手动调试指令：恢复场景灯光与情绪自适应联动')
    }
  }

  const sendSystemBubble = (message: string) => {
    if (systemBubbleTimer) {
      clearTimeout(systemBubbleTimer)
    }
    systemBubble.value = message
    addLog('SYSTEM', '向主画面发送系统提示气泡: ' + message)

    systemBubbleTimer = setTimeout(() => {
      systemBubble.value = null
    }, 4500)
  }

  const clearLogs = () => {
    logs.value = []
    addLog('SYSTEM', '开发者面板：历史交互日志已重置')
  }

  addLog('SYSTEM', '伴侣小生命「小灵」生命中枢自检通过，系统就绪')

  return {
    currentEmotion,
    activeTheme,
    customThemeOverride,
    currentSpeech,
    speechVisible,
    systemBubble,
    logs,
    currentConfig,
    setEmotion,
    handleQuickAction,
    handleUserInput,
    setManualEmotion,
    setThemeOverride,
    sendSystemBubble,
    clearLogs
  }
}
