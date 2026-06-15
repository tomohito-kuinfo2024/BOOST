import { useEffect, useRef, useState } from 'react'
import {
  dangerLevelDescriptions,
  dangerLevels,
  startEaseOptions,
  taskGenres,
} from './domain'
import {
  addFunEvent,
  addTaskProject,
  deleteFunEvent,
  deleteTaskProject,
  getFunEvents,
  getTaskProjects,
  updateTaskProject,
} from './storage'
import './App.css'

const MOODS_PER_PAGE = 3

const rawMoodOptions = [
  {
    id: 'exhausted',
    label: '疲れ切っている',
    description: 'まずは休む前提で、開くだけでも十分な状態',
    motivationLevel: 1,
  },
  {
    id: 'want-nothing',
    label: '何もしたくない',
    description: 'やる気を出すより、抵抗の少ない入口が必要',
    motivationLevel: 1,
  },
  {
    id: 'sleepy',
    label: '眠い',
    description: '頭を使う前に、短く始めて様子を見たい状態',
    motivationLevel: 1,
  },
  {
    id: 'brain-fog',
    label: '頭が働かない',
    description: '考える負荷を下げて、手順だけ見えるようにしたい',
    motivationLevel: 1,
  },
  {
    id: 'sluggish',
    label: 'だるい',
    description: '体も気持ちも重く、最初の動きを小さくしたい',
    motivationLevel: 1,
  },
  {
    id: 'escape',
    label: '現実逃避したい',
    description: '向き合うのがつらいので、正面突破より小さな接点が必要',
    motivationLevel: 1,
  },
  {
    id: 'frozen-anxiety',
    label: '不安で動けない',
    description: '不安を減らすために、作業前の整理から始めたい',
    motivationLevel: 1,
  },
  {
    id: 'stuck-rushing',
    label: '焦っているのに手が動かない',
    description: '焦りで固まっているので、選択肢を減らしたい',
    motivationLevel: 1,
  },
  {
    id: 'slightly-tired',
    label: '少し疲れている',
    description: '重い作業より、軽い着手からなら動けそう',
    motivationLevel: 2,
  },
  {
    id: 'heavy-heart',
    label: 'なんとなく気が重い',
    description: '理由ははっきりしないけれど、始める摩擦がある',
    motivationLevel: 2,
  },
  {
    id: 'overloaded',
    label: 'やることが多くて混乱している',
    description: 'まず全体を見える形にして、次の1つを選びたい',
    motivationLevel: 2,
  },
  {
    id: 'cannot-decide',
    label: '何から始めるか決められない',
    description: '作業そのものより、最初の選択で止まっている',
    motivationLevel: 2,
  },
  {
    id: 'perfectionism',
    label: '完璧にやろうとして止まっている',
    description: '完成度より、雑な一歩を許すきっかけが必要',
    motivationLevel: 2,
  },
  {
    id: 'deadline',
    label: '締切が気になっている',
    description: '締切の圧を、今できる小さな進捗に変えたい',
    motivationLevel: 2,
  },
  {
    id: 'guilty',
    label: '罪悪感がある',
    description: '責めるより、再開しやすい小さな行動に移したい',
    motivationLevel: 2,
  },
  {
    id: 'focus-worry',
    label: '集中できるか不安',
    description: '長時間ではなく、短い区切りで試したい',
    motivationLevel: 2,
  },
  {
    id: 'light-start',
    label: '軽くなら始められそう',
    description: '小さな作業なら、今から手をつけられそう',
    motivationLevel: 2,
  },
  {
    id: 'move-something',
    label: 'とりあえず何か進めたい',
    description: '大きな計画より、目に見える一歩が欲しい',
    motivationLevel: 2,
  },
  {
    id: 'okay',
    label: '少し元気',
    description: '少し負荷のある作業にも入れそう',
    motivationLevel: 3,
  },
  {
    id: 'can-think',
    label: '頭を使えそう',
    description: '理解や整理など、考える作業を始められそう',
    motivationLevel: 3,
  },
  {
    id: 'hands-on',
    label: '手を動かしたい',
    description: '読むだけでなく、書く・解く・作る方向に進めたい',
    motivationLevel: 3,
  },
  {
    id: 'want-achievement',
    label: '達成感が欲しい',
    description: '小さくても完了したと言える結果を残したい',
    motivationLevel: 3,
  },
  {
    id: 'excited',
    label: 'ワクワクしている',
    description: '勢いを使って、前向きに作業へ入りたい',
    motivationLevel: 3,
  },
  {
    id: 'deep-thinking',
    label: '今なら深く考えられそう',
    description: '少し難しい理解や設計にも取り組めそう',
    motivationLevel: 3,
  },
]

const moodOptions = rawMoodOptions.map((mood) => ({
  ...mood,
  aiSignals: createMoodAiSignals(mood),
}))

function createMoodAiSignals(mood) {
  const activationNeeds = {
    1: 'lowest-friction',
    2: 'light-start',
    3: 'active-start',
  }

  const suggestionStyles = {
    1: ['open-only', 'reduce-friction', 'no-pressure'],
    2: ['organize', 'choose-one', 'rough-start'],
    3: ['make-progress', 'think', 'create-output'],
  }

  return {
    sourceText: `${mood.label}。${mood.description}`,
    activationNeed: activationNeeds[mood.motivationLevel],
    suggestionStyles: suggestionStyles[mood.motivationLevel],
  }
}

const timeOptions = [
  {
    id: '30',
    label: '30分',
    description: '始めやすい課題から入り、一区切りだけ進める',
  },
  {
    id: '60',
    label: '60分',
    description: '優先度の高い課題に向き合い、進捗を作る',
  },
  {
    id: '90plus',
    label: '90分〜',
    description: '重めの課題も含めて、まとまった作業時間にする',
  },
]

const timeGuides = {
  30: '最初の5分で入口を作り、残りは小さな一区切りまで進めます。',
  60: '最初の5分で再開地点を作り、その後は優先度の高い部分に集中します。',
  '90plus': '最初の5分で入口を作り、まとまった時間で理解・演習・作成まで進めます。',
}

const futurePersonalContext = {
  excitingEvent: '',
  recentMoodIds: [],
  frequentMoodIds: [],
  preferredSuggestionIds: [],
}

const rewardSuggestions = [
  'ラーメン行く',
  'コンビニスイーツ',
  'コーヒーを買う',
  '好きな音楽を聴く',
  '服を見に行く',
  '本屋に寄る',
  'アイスを食べる',
  '炭酸を飲む',
  '散歩する',
  'ゲームを少し進める',
  '好きな店に行く',
  'スーパーでおやつを見る',
  'YouTubeを1本見る',
  'アニメを1話見る',
  '漫画を読む',
  'ポテトを食べる',
  'カフェに寄る',
  '温かいお茶を飲む',
  '風呂にゆっくり入る',
  '友達に連絡する',
  '推しの動画を見る',
  '靴を見に行く',
  'ガチャを1回だけ見る',
  '近所を一駅分歩く',
  'パン屋に寄る',
  '好きなプレイリストを流す',
  '部屋で少し横になる',
  '香りのいい飲み物を作る',
  '気になっていた記事を読む',
  '写真フォルダを眺める',
  '夜食を買う',
  '駅ナカを少し歩く',
  '新作のお菓子を見る',
  '文房具を見る',
  'サウナや銭湯を考える',
  '好きな配信のアーカイブを見る',
  '明日の楽しみを1つ決める',
]

function pickRandomMoodByLevel(level, shownMoodIds) {
  const candidates = moodOptions.filter(
    (mood) =>
      mood.motivationLevel === level && !shownMoodIds.includes(mood.id),
  )

  if (candidates.length === 0) {
    return null
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

function createMoodSet(shownMoodIds = []) {
  return [1, 2, 3]
    .map((level) => pickRandomMoodByLevel(level, shownMoodIds))
    .filter(Boolean)
}

const suggestionStepLabels = [
  'Step 1: まずはこれから',
  'Step 2: 次にこれ',
  'Step 3: 余力があれば',
]

const refreshStepTexts = {
  exhausted: {
    title: '仮眠を取ろう',
    description:
      '疲れ切っているときは、課題に入る前に疲れを減らします。飲み物(カフェイン)を飲んで、机に伏して10分タイマーして仮眠しましょう。',
  },
  'want-nothing': {
    title: '図書館(本屋)を歩き回ろう',
    description:
      '何もしたくないときは、作業に関連した本のコーナーを歩いてモチベを上げましょう。',
  },
  sleepy: {
    title: '仮眠を取ろう',
    description:
      '眠いときは、課題に入る前に眠気を覚まして疲れを減らします。飲み物(カフェイン)を飲んで、机に伏して10分タイマーして仮眠しましょう。',
  },
  'brain-fog': {
    title: 'リセットしよう',
    description:
      '頭が働かないときは、無理にやっても空回りします。睡眠や趣味、食事を挟んで頭をリセットしましょう。',
  },
  sluggish: {
    title: '軽く散歩しよう',
    description:
      'だるいときは、外を歩いて空気を吸ってリフレッシュしましょう。',
  },
  escape: {
    title: '一旦逃げて体制を整えるべし',
    description:
      '現実逃避したいときは、課題へ正面から入らず、戻ってこられる小さな入口を作ります。step1では敢えて優先度の低い取り組みやすいタスクからやりましょう。',
  },
  'frozen-anxiety': {
    title: '不安を言語化しよう',
    description:
      '不安で動けないときは、今の思いを文章にしてみましょう。gptに文章を投げて壁打ちするのがおすすめです。',
  },
  'stuck-rushing': {
    title: '焦りを言語化しよう',
    description:
      '焦っているときは、今の思いを文章にしてみましょう。gptに文章を投げて壁打ちするのがおすすめです。',
  },
}

const defaultRefreshStepText = {
  title: 'リフレッシュ',
  description:
    '今は作業に入る前に、少しだけ状態を整える時間を置きます。水を飲んで、深呼吸して、机の上を1つだけ整えます。',
}

function getTaskStartEase(taskProject) {
  return taskProject.startEase ?? 3
}

function getTaskDeadlineType(taskProject) {
  if (taskProject.deadlineType) {
    return taskProject.deadlineType
  }

  return taskProject.deadline ? 'date' : 'none'
}

function getTaskDeadlineLabel(taskProject) {
  const deadlineType = getTaskDeadlineType(taskProject)

  if (deadlineType === 'long-term') {
    return '長期目標'
  }

  if (deadlineType === 'none') {
    return '期限なし'
  }

  return taskProject.deadline || '期限なし'
}

function createSuggestions({ mood, personalContext, taskProjects, timeId }) {
  if (!mood || !timeId) {
    return []
  }

  const taskSuggestions = createSuggestionFlow(taskProjects, mood, timeId).map((taskProject, index) => ({
      id: `suggestion-${taskProject.id}`,
      type: 'task',
      stepLabel: suggestionStepLabels[index],
      taskProject,
      title: taskProject.title,
      reason: createSuggestionReason(taskProject, mood, timeId, index),
      firstFiveMinutes: createFirstFiveMinutes(taskProject, mood, timeId),
      rewardNote: personalContext.reward
        ? `「${personalContext.reward}」を楽しむために、ちょっとだけ頑張ってみましょう。`
        : '',
      personalContext,
    }))

  if (mood.motivationLevel !== 1) {
    return taskSuggestions
  }

  const refreshStepText = refreshStepTexts[mood.id] ?? defaultRefreshStepText

  return [
    {
      id: `refresh-${mood.id}`,
      type: 'refresh',
      stepLabel: 'Step 0: リフレッシュ',
      title: refreshStepText.title,
      description: refreshStepText.description,
      rewardNote: '',
      personalContext,
    },
    ...taskSuggestions,
  ]
}

function createSuggestionFlow(taskProjects, mood, timeId) {
  const remainingTasks = [...taskProjects]
  const flow = []

  function takeTask(sortTaskProjects) {
    if (remainingTasks.length === 0) {
      return
    }

    remainingTasks.sort(sortTaskProjects)
    flow.push(remainingTasks.shift())
  }

  if (timeId === '30') {
    takeTask(
      mood.motivationLevel === 1
        ? compareStartEaseFirst
        : compareBalancedTaskProjects,
    )
    takeTask(compareBalancedTaskProjects)
    takeTask(compareExtraCapacityTaskProjects)
    return flow
  }

  if (timeId === '90plus') {
    takeTask(
      mood.motivationLevel === 1
        ? compareStartEaseFirst
        : compareIncompleteTaskProjects,
    )
    takeTask(compareIncompleteTaskProjects)
    takeTask(compareDeepWorkTaskProjects)
    return flow
  }

  if (mood.motivationLevel === 1) {
    takeTask(compareStartEaseFirst)
    takeTask(compareIncompleteTaskProjects)
    takeTask(compareExtraCapacityTaskProjects)
    return flow
  }

  takeTask(compareBalancedTaskProjects)
  takeTask(compareIncompleteTaskProjects)
  takeTask(compareExtraCapacityTaskProjects)
  return flow
}

function createSuggestionReason(taskProject, mood, timeId, stepIndex) {
  const dangerText = {
    S: '危険度Sなので、まず再開しやすい状態を作る価値が高いです。',
    A: '危険度Aなので、早めに少しだけでも進めておくと後の負担を減らせます。',
    B: '危険度Bなので、今のうちに小さく進めると余裕を保ちやすいです。',
    C: '危険度Cなので、軽い着手や維持のための行動で十分です。',
  }[taskProject.dangerLevel]

  const moodText = {
    1: '今は重い作業より、開く・見る・印をつけるくらいの軽い入口が合っています。',
    2: '今は整理や小さな着手から入ると、次の行動を選びやすくなります。',
    3: '今は少し負荷のある作業にも入れそうなので、進捗を狙いましょう。',
  }[mood.motivationLevel]

  const timeText = {
    30: '30分枠なので、まずは始めやすさと小さな一区切りを重視しています。',
    60: '60分枠なので、始めやすさだけでなく、やるべき圧や期限も強めに見ています。',
    '90plus': '90分以上の枠なので、少し重い課題でもまとまった進捗を作りやすいです。',
  }[timeId]

  const stepText = [
    mood.motivationLevel === 1
      ? `開始しやすさが${getTaskStartEase(taskProject)}なので、最初の動きを作るブースターとして置いています。`
      : '最初に触る価値が高い課題として置いています。',
    'やるべき圧や期限を見て、次に向き合う課題として置いています。',
    '余力があれば触れる課題として置いています。',
  ][stepIndex]

  return `${dangerText} ${moodText} ${timeText} ${stepText}`
}

function createFirstFiveMinutes(taskProject, mood, timeId) {
  const firstSubTask = taskProject.subTasks[0]
  const targetText = firstSubTask
    ? `「${firstSubTask}」に関係するところ`
    : '課題ページや資料'

  if (mood.motivationLevel === 1) {
    return `${targetText}を開いて、今日触る場所を1つだけ決めます。${timeGuides[timeId]}`
  }

  if (timeId === '30') {
    return `${targetText}を見ながら、次にやる小さな作業を1つだけ決めて進めます。${timeGuides[timeId]}`
  }

  if (timeId === '60') {
    return `${targetText}を開いて、優先度が高そうな部分を1つ選び、そこから作業を始めます。${timeGuides[timeId]}`
  }

  return `${targetText}から始めて、理解・演習・作成のどれか1つを一区切りまで進めます。${timeGuides[timeId]}`
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getDangerLevelScore(dangerLevel) {
  return {
    S: 4,
    A: 3,
    B: 2,
    C: 1,
  }[dangerLevel]
}

function compareStartEaseFirst(a, b) {
  const startEaseDiff = getTaskStartEase(b) - getTaskStartEase(a)

  if (startEaseDiff !== 0) {
    return startEaseDiff
  }

  return compareIncompleteTaskProjects(a, b)
}

function compareBalancedTaskProjects(a, b) {
  const aScore = getDangerLevelScore(a.dangerLevel) + getTaskStartEase(a)
  const bScore = getDangerLevelScore(b.dangerLevel) + getTaskStartEase(b)

  if (aScore !== bScore) {
    return bScore - aScore
  }

  return compareIncompleteTaskProjects(a, b)
}

function getExtraCapacityPriority(taskProject) {
  const deadlineType = getTaskDeadlineType(taskProject)

  if (deadlineType === 'long-term') {
    return 0
  }

  if (deadlineType === 'none') {
    return 0
  }

  const today = new Date()
  const deadlineDate = new Date(`${taskProject.deadline}T00:00:00`)
  const twoMonthsLater = new Date(today)
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2)

  return deadlineDate >= twoMonthsLater ? 0 : 1
}

function compareExtraCapacityTaskProjects(a, b) {
  const priorityDiff = getExtraCapacityPriority(a) - getExtraCapacityPriority(b)

  if (priorityDiff !== 0) {
    return priorityDiff
  }

  return compareStartEaseFirst(a, b)
}

function compareDeepWorkTaskProjects(a, b) {
  const priorityDiff = compareIncompleteTaskProjects(a, b)

  if (priorityDiff !== 0) {
    return priorityDiff
  }

  return getTaskStartEase(a) - getTaskStartEase(b)
}

function compareIncompleteTaskProjects(a, b) {
  if (a.deadline && b.deadline && a.deadline !== b.deadline) {
    return a.deadline.localeCompare(b.deadline)
  }

  if (a.deadline && !b.deadline) {
    return -1
  }

  if (!a.deadline && b.deadline) {
    return 1
  }

  return getDangerLevelScore(b.dangerLevel) - getDangerLevelScore(a.dangerLevel)
}

function compareCompletedTaskProjects(a, b) {
  const aCompletedAt = a.completedAt || a.updatedAt || a.createdAt
  const bCompletedAt = b.completedAt || b.updatedAt || b.createdAt

  return bCompletedAt.localeCompare(aCompletedAt)
}

function compareFunEvents(a, b) {
  return a.date.localeCompare(b.date)
}

function getUpcomingFunEvent(funEvents) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    funEvents
      .filter((funEvent) => funEvent.date >= today)
      .sort(compareFunEvents)[0] ?? null
  )
}

function App() {
  const [currentView, setCurrentView] = useState('main')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reward, setReward] = useState('')
  const [taskProjects, setTaskProjects] = useState(() => getTaskProjects())
  const [funEvents, setFunEvents] = useState(() => getFunEvents())
  const [editingTaskProject, setEditingTaskProject] = useState(null)
  const [returnViewAfterTaskEdit, setReturnViewAfterTaskEdit] =
    useState('task-list')
  const [taskProjectIdToFocus, setTaskProjectIdToFocus] = useState('')
  const [showPageTopButton, setShowPageTopButton] = useState(false)
  const [visibleMoodOptions, setVisibleMoodOptions] = useState(() =>
    createMoodSet(),
  )
  const [shownMoodIds, setShownMoodIds] = useState(() =>
    visibleMoodOptions.map((mood) => mood.id),
  )
  const currentMood = moodOptions.find((mood) => mood.id === selectedMood)
  const currentTime = timeOptions.find((time) => time.id === selectedTime)
  const upcomingFunEvent = getUpcomingFunEvent(funEvents)
  const incompleteTaskProjects = taskProjects.filter(
    (taskProject) => !taskProject.isCompleted,
  )
  const canShowSuggestions =
    currentMood && currentTime && incompleteTaskProjects.length > 0
  const hasNextMoodSet = [1, 2, 3].every((level) =>
    moodOptions.some(
      (mood) =>
        mood.motivationLevel === level && !shownMoodIds.includes(mood.id),
    ),
  )
  const actionSuggestions = createSuggestions({
    mood: currentMood,
    taskProjects: incompleteTaskProjects,
    timeId: selectedTime,
    personalContext: {
      ...futurePersonalContext,
      reward: reward.trim(),
    },
  })

  useEffect(() => {
    if (currentView !== 'task-list') {
      setShowPageTopButton(false)
      return
    }

    function handleScroll() {
      setShowPageTopButton(window.scrollY > 320)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [currentView])

  function showOtherMoods() {
    const nextMoods = createMoodSet(shownMoodIds)

    if (nextMoods.length !== MOODS_PER_PAGE) {
      return
    }

    setVisibleMoodOptions(nextMoods)
    setShownMoodIds((currentIds) => [
      ...currentIds,
      ...nextMoods.map((mood) => mood.id),
    ])
  }

  function refreshTaskProjects() {
    setTaskProjects(getTaskProjects())
  }

  function refreshFunEvents() {
    setFunEvents(getFunEvents())
  }

  function handleSaveFunEvent(funEvent) {
    addFunEvent(funEvent)
    refreshFunEvents()
  }

  function handleDeleteFunEvent(funEvent) {
    const shouldDelete = window.confirm(
      `「${funEvent.title}」を削除しますか？`,
    )

    if (!shouldDelete) {
      return
    }

    deleteFunEvent(funEvent.id)
    refreshFunEvents()
  }

  function handleSaveTaskProject(taskProject) {
    if (editingTaskProject) {
      updateTaskProject(taskProject.id, () => taskProject)
    } else {
      addTaskProject(taskProject)
    }

    refreshTaskProjects()
    const nextView = editingTaskProject ? returnViewAfterTaskEdit : 'task-list'
    setEditingTaskProject(null)
    setTaskProjectIdToFocus(editingTaskProject ? '' : taskProject.id)
    setCurrentView(nextView)
  }

  function handleEditTaskProject(taskProject, returnView = 'task-list') {
    setEditingTaskProject(taskProject)
    setReturnViewAfterTaskEdit(returnView)
    setCurrentView('task-form')
  }

  function handleToggleTaskProjectCompleted(taskProject) {
    const nextCompletedState = !taskProject.isCompleted
    updateTaskProject(taskProject.id, (currentTaskProject) => ({
      ...currentTaskProject,
      completedAt: nextCompletedState ? new Date().toISOString() : undefined,
      isCompleted: nextCompletedState,
      updatedAt: new Date().toISOString(),
    }))
    refreshTaskProjects()
  }

  function handleDeleteTaskProject(taskProject) {
    const shouldDelete = window.confirm(
      `「${taskProject.title}」を削除しますか？この操作は元に戻せません。`,
    )

    if (!shouldDelete) {
      return
    }

    deleteTaskProject(taskProject.id)
    refreshTaskProjects()
  }

  function fillRandomRewardSuggestion() {
    const candidates = rewardSuggestions.filter(
      (suggestion) => suggestion !== reward.trim(),
    )
    const nextReward =
      candidates[Math.floor(Math.random() * candidates.length)] ||
      rewardSuggestions[0]

    setReward(nextReward)
  }

  return (
    <main className="app">
      <section className="start-panel">
        <p className="eyebrow">Begin-Oriented Operating SysTem</p>
        <h1>BOOST</h1>
        <p>
          まずは、今の気分と使える時間を選んでください。
        </p>

        <nav className="view-tabs" aria-label="画面切り替え">
          <button
            className={
              currentView === 'main' ? 'view-tab view-tab-active' : 'view-tab'
            }
            onClick={() => setCurrentView('main')}
            type="button"
          >
            行動開始
          </button>
          <button
            className={
              currentView === 'task-list'
                ? 'view-tab view-tab-active'
                : 'view-tab'
            }
            onClick={() => setCurrentView('task-list')}
            type="button"
          >
            課題一覧
          </button>
          <button
            className={
              currentView === 'fun-calendar'
                ? 'view-tab view-tab-active'
                : 'view-tab'
            }
            onClick={() => setCurrentView('fun-calendar')}
            type="button"
          >
            お楽しみカレンダー
          </button>
        </nav>

        {currentView === 'main' && (
          <>
            <p className="task-count">
              未完了課題: {incompleteTaskProjects.length}件 / 登録済み課題:{' '}
              {taskProjects.length}件
            </p>

            <div className="question-block">
              <div className="question-heading">
                <h2>今の気分</h2>
                <button
                  className="secondary-button"
                  disabled={!hasNextMoodSet}
                  onClick={showOtherMoods}
                  type="button"
                >
                  {hasNextMoodSet
                    ? '他の気分を表示'
                    : '表示できる気分は以上です'}
                </button>
              </div>
              <div className="mood-options">
                {visibleMoodOptions.map((mood) => (
                  <button
                    className={
                      selectedMood === mood.id
                        ? 'mood-button mood-button-selected'
                        : 'mood-button'
                    }
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    type="button"
                  >
                    <span>{mood.label}</span>
                    <small>{mood.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="question-block">
              <h2>使える時間</h2>
              <div className="time-options">
                {timeOptions.map((time) => (
                  <button
                    className={
                      selectedTime === time.id
                        ? 'choice-button choice-button-selected'
                        : 'choice-button'
                    }
                    key={time.id}
                    onClick={() => setSelectedTime(time.id)}
                    type="button"
                  >
                    <span>{time.label}</span>
                    <small>{time.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="question-block">
              <div className="question-heading">
                <label className="text-input-label" htmlFor="reward">
                  今日のご褒美
                </label>
                <button
                  className="secondary-button"
                  onClick={fillRandomRewardSuggestion}
                  type="button"
                >
                  何か提案して！
                </button>
              </div>
              <input
                className="text-input"
                id="reward"
                onChange={(event) => setReward(event.target.value)}
                placeholder="例: コーヒー、音楽を聴く、好きな店に行く"
                type="text"
                value={reward}
              />
            </div>

            {(currentMood || currentTime) && (
              <p className="selected-message">
                選んだ内容:
                {currentMood && <strong> {currentMood.label}</strong>}
                {currentMood && currentTime && <span> / </span>}
                {currentTime && <strong>{currentTime.label}</strong>}
              </p>
            )}

            {currentMood && currentTime && incompleteTaskProjects.length === 0 && (
              <div className="suggestion-block">
                <h2>今すぐ始める候補</h2>
                <p className="empty-suggestion-message">
                  未完了の課題がまだありません。「課題一覧」から、気になっている課題を1つ登録してみてください。
                </p>
              </div>
            )}

            {canShowSuggestions && (
              <div className="suggestion-block">
                {upcomingFunEvent && (
                  <div className="fun-event-banner">
                    <span>直近のお楽しみ予定</span>
                    <strong>
                      {upcomingFunEvent.date} / {upcomingFunEvent.title}
                    </strong>
                  </div>
                )}
                <h2>おすすめフロー</h2>
                <div className="suggestion-flow">
                  {actionSuggestions.map((suggestion) => (
                    <article className="suggestion-card flow-card" key={suggestion.id}>
                      <p className="flow-step-label">{suggestion.stepLabel}</p>
                      <h3>{suggestion.title}</h3>

                      {suggestion.type === 'task' && (
                        <>
                          <dl className="flow-task-meta">
                            <div>
                              <dt>期限</dt>
                              <dd>
                                {getTaskDeadlineLabel(suggestion.taskProject)}
                              </dd>
                            </div>
                            <div>
                              <dt>ジャンル</dt>
                              <dd>{suggestion.taskProject.genre}</dd>
                            </div>
                          </dl>

                          {suggestion.taskProject.subTasks.length > 0 && (
                            <div className="flow-task-detail">
                              <span>やるべきタスク</span>
                              <ul>
                                {suggestion.taskProject.subTasks.map((subTask) => (
                                  <li key={subTask}>{subTask}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {suggestion.taskProject.memo && (
                            <div className="flow-task-detail">
                              <span>メモ</span>
                              <p>{suggestion.taskProject.memo}</p>
                            </div>
                          )}
                        </>
                      )}

                      {suggestion.type === 'refresh' ? (
                        <p className="refresh-step-description">
                          {suggestion.description}
                        </p>
                      ) : (
                        <>
                          <div className="suggestion-detail">
                            <span>理由</span>
                            <p>{suggestion.reason}</p>
                          </div>

                          <div className="suggestion-detail">
                            <span>最初の5分</span>
                            <p>{suggestion.firstFiveMinutes}</p>
                          </div>
                        </>
                      )}

                      {suggestion.rewardNote && (
                        <div className="suggestion-detail reward-detail">
                          <span>今日のご褒美</span>
                          <p>{suggestion.rewardNote}</p>
                        </div>
                      )}

                      {suggestion.type === 'task' && (
                        <div className="task-actions">
                          <button
                            className="secondary-button"
                            onClick={() =>
                              handleEditTaskProject(
                                suggestion.taskProject,
                                'main',
                              )
                            }
                            type="button"
                          >
                            進捗を更新
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {currentView === 'task-form' && (
          <TaskProjectForm
            key={editingTaskProject ? editingTaskProject.id : 'new-task'}
            initialTaskProject={editingTaskProject}
            onSaveTaskProject={handleSaveTaskProject}
          />
        )}

        {currentView === 'task-list' && (
          <TaskProjectList
            onDeleteTaskProject={handleDeleteTaskProject}
            onEditTaskProject={handleEditTaskProject}
            onFocusedTaskProject={() => setTaskProjectIdToFocus('')}
            onOpenTaskForm={() => {
              setEditingTaskProject(null)
              setReturnViewAfterTaskEdit('task-list')
              setCurrentView('task-form')
            }}
            onToggleTaskProjectCompleted={handleToggleTaskProjectCompleted}
            taskProjectIdToFocus={taskProjectIdToFocus}
            taskProjects={taskProjects}
          />
        )}

        {currentView === 'fun-calendar' && (
          <FunCalendar
            funEvents={funEvents}
            onDeleteFunEvent={handleDeleteFunEvent}
            onSaveFunEvent={handleSaveFunEvent}
          />
        )}

        {currentView === 'task-list' && showPageTopButton && (
          <button
            className="page-top-button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            type="button"
          >
            ページトップへ
          </button>
        )}
      </section>
    </main>
  )
}

function TaskProjectForm({ initialTaskProject, onSaveTaskProject }) {
  const [title, setTitle] = useState(initialTaskProject?.title ?? '')
  const [deadlineType, setDeadlineType] = useState(
    initialTaskProject?.deadlineType ??
      (initialTaskProject?.deadline ? 'date' : 'none'),
  )
  const [deadline, setDeadline] = useState(initialTaskProject?.deadline ?? '')
  const [dangerLevel, setDangerLevel] = useState(
    initialTaskProject?.dangerLevel ?? 'B',
  )
  const [startEase, setStartEase] = useState(initialTaskProject?.startEase ?? 3)
  const [genre, setGenre] = useState(initialTaskProject?.genre ?? '課題')
  const [subTasks, setSubTasks] = useState(
    initialTaskProject?.subTasks?.length ? initialTaskProject.subTasks : [''],
  )
  const [memo, setMemo] = useState(initialTaskProject?.memo ?? '')
  const [isCompleted, setIsCompleted] = useState(
    initialTaskProject?.isCompleted ?? false,
  )
  const [savedMessage, setSavedMessage] = useState('')

  function updateSubTask(index, value) {
    setSubTasks((currentSubTasks) =>
      currentSubTasks.map((subTask, subTaskIndex) =>
        subTaskIndex === index ? value : subTask,
      ),
    )
  }

  function addSubTaskInput() {
    setSubTasks((currentSubTasks) => [...currentSubTasks, ''])
  }

  function removeSubTaskInput(index) {
    setSubTasks((currentSubTasks) =>
      currentSubTasks.filter((_, subTaskIndex) => subTaskIndex !== index),
    )
  }

  function resetForm() {
    setTitle('')
    setDeadlineType('none')
    setDeadline('')
    setDangerLevel('B')
    setStartEase(3)
    setGenre('課題')
    setSubTasks([''])
    setMemo('')
    setIsCompleted(false)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const cleanedSubTasks = subTasks
      .map((subTask) => subTask.trim())
      .filter(Boolean)

    if (!trimmedTitle) {
      setSavedMessage('タイトルを入力してください。')
      return
    }

    const now = new Date().toISOString()
    const wasCompleted = initialTaskProject?.isCompleted ?? false
    const completedAt = isCompleted
      ? wasCompleted
        ? initialTaskProject?.completedAt
        : now
      : undefined

    onSaveTaskProject({
      id: initialTaskProject?.id ?? createId('task'),
      title: trimmedTitle,
      deadline: deadlineType === 'date' ? deadline || undefined : undefined,
      deadlineType,
      dangerLevel,
      startEase,
      genre,
      subTasks: cleanedSubTasks,
      memo: memo.trim() || undefined,
      isCompleted,
      completedAt,
      createdAt: initialTaskProject?.createdAt ?? now,
      updatedAt: now,
    })

    resetForm()
    setSavedMessage(
      initialTaskProject ? '課題を更新しました。' : '課題を保存しました。',
    )
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialTaskProject ? '課題を編集' : '課題を登録'}</h2>

      <div className="form-section">
        <label className="text-input-label" htmlFor="task-title">
          タイトル
        </label>
        <input
          className="text-input"
          id="task-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 信号とシステム期末勉強"
          required
          type="text"
          value={title}
        />
      </div>

      <div className="form-grid">
        <div className="form-section">
          <p className="text-input-label">期限</p>
          <div className="deadline-options">
            <button
              className={
                deadlineType === 'date'
                  ? 'deadline-button deadline-button-selected'
                  : 'deadline-button'
              }
              onClick={() => setDeadlineType('date')}
              type="button"
            >
              カレンダー
            </button>
            <button
              className={
                deadlineType === 'long-term'
                  ? 'deadline-button deadline-button-selected'
                  : 'deadline-button'
              }
              onClick={() => setDeadlineType('long-term')}
              type="button"
            >
              長期目標
            </button>
            <button
              className={
                deadlineType === 'none'
                  ? 'deadline-button deadline-button-selected'
                  : 'deadline-button'
              }
              onClick={() => setDeadlineType('none')}
              type="button"
            >
              期限なし
            </button>
          </div>
          {deadlineType === 'date' && (
            <input
              className="text-input deadline-date-input"
              id="task-deadline"
              onChange={(event) => setDeadline(event.target.value)}
              type="date"
              value={deadline}
            />
          )}
        </div>

        <div className="form-section">
          <label className="text-input-label" htmlFor="task-genre">
            ジャンル
          </label>
          <select
            className="text-input"
            id="task-genre"
            onChange={(event) => setGenre(event.target.value)}
            value={genre}
          >
            {taskGenres.map((taskGenre) => (
              <option key={taskGenre} value={taskGenre}>
                {taskGenre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <p className="text-input-label">危険度</p>
        <div className="danger-options">
          {dangerLevels.map((level) => (
            <button
              className={
                dangerLevel === level
                  ? 'danger-button danger-button-selected'
                  : 'danger-button'
              }
              key={level}
              onClick={() => setDangerLevel(level)}
              type="button"
            >
              <span>{level}</span>
              <small>{dangerLevelDescriptions[level]}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <p className="text-input-label">開始しやすさ</p>
        <div className="start-ease-scale">
          <div className="start-ease-axis">
            <span>重たい</span>
            <span>← ・・・・・ →</span>
            <span>始めやすい</span>
          </div>
          <div className="start-ease-options">
            {startEaseOptions.map((option) => (
              <button
                className={
                  startEase === option.value
                    ? 'start-ease-button start-ease-button-selected'
                    : 'start-ease-button'
                }
                key={option.value}
                onClick={() => setStartEase(option.value)}
                type="button"
              >
                <strong>{option.value}</strong>
                <small>{option.label}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="question-heading">
          <label className="text-input-label" htmlFor="task-subtask-0">
            やるべきタスク
          </label>
          <button
            className="secondary-button"
            onClick={addSubTaskInput}
            type="button"
          >
            追加
          </button>
        </div>

        <div className="subtask-list">
          {subTasks.map((subTask, index) => (
            <div className="subtask-row" key={index}>
              <input
                className="text-input"
                id={index === 0 ? 'task-subtask-0' : undefined}
                onChange={(event) => updateSubTask(index, event.target.value)}
                placeholder="例: スライド確認、演習問題、構成案作成"
                type="text"
                value={subTask}
              />
              {subTasks.length > 1 && (
                <button
                  className="secondary-button"
                  onClick={() => removeSubTaskInput(index)}
                  type="button"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="text-input-label" htmlFor="task-memo">
          メモ
        </label>
        <textarea
          className="text-input textarea-input"
          id="task-memo"
          onChange={(event) => setMemo(event.target.value)}
          placeholder="引継事項や不安点を書けます"
          value={memo}
        />
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          {initialTaskProject ? '課題を更新' : '課題を保存'}
        </button>

        {initialTaskProject && (
          <button
            className="secondary-button form-action-button"
            onClick={() => setIsCompleted((currentValue) => !currentValue)}
            type="button"
          >
            {isCompleted ? '未完了に戻す' : '完了にする'}
          </button>
        )}
      </div>

      {savedMessage && <p className="selected-message">{savedMessage}</p>}
    </form>
  )
}

function TaskProjectList({
  onDeleteTaskProject,
  onEditTaskProject,
  onFocusedTaskProject,
  onOpenTaskForm,
  onToggleTaskProjectCompleted,
  taskProjectIdToFocus,
  taskProjects,
}) {
  const focusedTaskProjectRef = useRef(null)
  const incompleteTaskProjects = taskProjects
    .filter((taskProject) => !taskProject.isCompleted)
    .sort(compareIncompleteTaskProjects)
  const completedTaskProjects = taskProjects
    .filter((taskProject) => taskProject.isCompleted)
    .sort(compareCompletedTaskProjects)

  useEffect(() => {
    if (!taskProjectIdToFocus) {
      return
    }

    focusedTaskProjectRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    onFocusedTaskProject()
  }, [taskProjectIdToFocus, taskProjects.length])

  if (taskProjects.length === 0) {
    return (
      <div className="task-list-view">
        <div className="task-list-toolbar">
          <h2>課題一覧</h2>
          <button className="primary-button compact-button" onClick={onOpenTaskForm} type="button">
            課題を登録
          </button>
        </div>
        <div className="empty-state">
          <h2>登録済み課題はまだありません</h2>
          <p>まずは気になっている課題を1つだけ登録してみてください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="task-list-view">
      <div className="task-list-toolbar">
        <h2>課題一覧</h2>
        <button className="primary-button compact-button" onClick={onOpenTaskForm} type="button">
          課題を登録
        </button>
      </div>
      <TaskProjectGroup
        emptyMessage="未完了の課題はありません。"
        onDeleteTaskProject={onDeleteTaskProject}
        onEditTaskProject={onEditTaskProject}
        focusedTaskProjectId={taskProjectIdToFocus}
        focusedTaskProjectRef={focusedTaskProjectRef}
        onToggleTaskProjectCompleted={onToggleTaskProjectCompleted}
        taskProjects={incompleteTaskProjects}
        title="未完了タスク"
      />

      <TaskProjectGroup
        emptyMessage="完了済みの課題はまだありません。"
        onDeleteTaskProject={onDeleteTaskProject}
        onEditTaskProject={onEditTaskProject}
        focusedTaskProjectId={taskProjectIdToFocus}
        focusedTaskProjectRef={focusedTaskProjectRef}
        onToggleTaskProjectCompleted={onToggleTaskProjectCompleted}
        taskProjects={completedTaskProjects}
        title="完了タスク"
      />
    </div>
  )
}

function TaskProjectGroup({
  emptyMessage,
  focusedTaskProjectId,
  focusedTaskProjectRef,
  onDeleteTaskProject,
  onEditTaskProject,
  onToggleTaskProjectCompleted,
  taskProjects,
  title,
}) {
  return (
    <section className="task-group">
      <div className="task-group-heading">
        <h3>{title}</h3>
        <span>{taskProjects.length}件</span>
      </div>

      {taskProjects.length === 0 ? (
        <p className="task-group-empty">{emptyMessage}</p>
      ) : (
        <div className="task-list">
          {taskProjects.map((taskProject) => (
            <TaskProjectCard
              cardRef={
                taskProject.id === focusedTaskProjectId
                  ? focusedTaskProjectRef
                  : null
              }
              key={taskProject.id}
              onDeleteTaskProject={onDeleteTaskProject}
              onEditTaskProject={onEditTaskProject}
              onToggleTaskProjectCompleted={onToggleTaskProjectCompleted}
              taskProject={taskProject}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function TaskProjectCard({
  cardRef,
  onDeleteTaskProject,
  onEditTaskProject,
  onToggleTaskProjectCompleted,
  taskProject,
}) {
  return (
    <article
      className={
        cardRef ? 'task-card task-card-focused' : 'task-card'
      }
      ref={cardRef}
    >
      <div className="task-card-heading">
        <h3>{taskProject.title}</h3>
        <span
          className={
            taskProject.isCompleted
              ? 'status-badge status-badge-completed'
              : 'status-badge'
          }
        >
          {taskProject.isCompleted ? '完了' : '未完了'}
        </span>
      </div>

      <dl className="task-meta">
        <div>
          <dt>危険度</dt>
          <dd>{taskProject.dangerLevel}</dd>
        </div>
              <div>
                <dt>ジャンル</dt>
                <dd>{taskProject.genre}</dd>
              </div>
              <div>
                <dt>開始しやすさ</dt>
                <dd>{getTaskStartEase(taskProject)}</dd>
              </div>
              <div>
          <dt>期限</dt>
          <dd>{getTaskDeadlineLabel(taskProject)}</dd>
        </div>
      </dl>

      {taskProject.memo && (
        <div className="task-memo-preview">
          <span>メモ</span>
          <p>{taskProject.memo}</p>
        </div>
      )}

      {taskProject.subTasks.length > 0 && (
        <ul className="task-subtask-preview">
          {taskProject.subTasks.slice(0, 3).map((subTask) => (
            <li key={subTask}>{subTask}</li>
          ))}
        </ul>
      )}

      <div className="task-actions">
        <button
          className="secondary-button"
          onClick={() => onEditTaskProject(taskProject)}
          type="button"
        >
          編集
        </button>
        <button
          className="secondary-button"
          onClick={() => onToggleTaskProjectCompleted(taskProject)}
          type="button"
        >
          {taskProject.isCompleted ? '未完了に戻す' : '完了にする'}
        </button>
        <button
          className="danger-action-button"
          onClick={() => onDeleteTaskProject(taskProject)}
          type="button"
        >
          削除
        </button>
      </div>
    </article>
  )
}

function FunCalendar({ funEvents, onDeleteFunEvent, onSaveFunEvent }) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const sortedFunEvents = [...funEvents].sort(compareFunEvents)

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!date || !trimmedTitle) {
      setSavedMessage('日付とタイトルを入力してください。')
      return
    }

    const now = new Date().toISOString()

    onSaveFunEvent({
      id: createId('fun-event'),
      date,
      title: trimmedTitle,
      createdAt: now,
      updatedAt: now,
    })

    setDate('')
    setTitle('')
    setSavedMessage('お楽しみ予定を保存しました。')
  }

  return (
    <div className="fun-calendar-view">
      <h2>お楽しみカレンダー</h2>

      <form className="fun-event-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-section">
            <label className="text-input-label" htmlFor="fun-event-date">
              日付
            </label>
            <input
              className="text-input"
              id="fun-event-date"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </div>

          <div className="form-section">
            <label className="text-input-label" htmlFor="fun-event-title">
              タイトル
            </label>
            <input
              className="text-input"
              id="fun-event-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 友達とラーメン、旅行、ライブ"
              type="text"
              value={title}
            />
          </div>
        </div>

        <button className="primary-button" type="submit">
          予定を保存
        </button>

        {savedMessage && <p className="selected-message">{savedMessage}</p>}
      </form>

      <section className="fun-event-list-section">
        <div className="task-group-heading">
          <h3>登録した予定</h3>
          <span>{funEvents.length}件</span>
        </div>

        {sortedFunEvents.length === 0 ? (
          <p className="task-group-empty">
            少し先の楽しみな予定を1つだけ登録してみてください。
          </p>
        ) : (
          <div className="fun-event-list">
            {sortedFunEvents.map((funEvent) => (
              <article className="fun-event-card" key={funEvent.id}>
                <div>
                  <time dateTime={funEvent.date}>{funEvent.date}</time>
                  <h3>{funEvent.title}</h3>
                </div>
                <button
                  className="danger-action-button"
                  onClick={() => onDeleteFunEvent(funEvent)}
                  type="button"
                >
                  削除
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
