/**
 * @typedef {'S' | 'A' | 'B' | 'C'} DangerLevel
 */

/**
 * @typedef {1 | 2 | 3 | 4 | 5} StartEase
 */

/**
 * @typedef {'date' | 'long-term' | 'none'} DeadlineType
 */

/**
 * @typedef {
 *   | '試験勉強'
 *   | 'レポート'
 *   | '課題'
 *   | '資料作成'
 *   | '会議準備'
 *   | '資格勉強'
 *   | '個人開発'
 *   | '部活'
 *   | '就活・インターン'
 *   | '研究'
 *   | '語学'
 *   | 'その他'
 * } TaskGenre
 */

/**
 * @typedef {Object} TaskProject
 * @property {string} id
 * @property {string} title
 * @property {string | undefined} deadline YYYY-MM-DD。期限なしの場合は undefined。
 * @property {DeadlineType | undefined} deadlineType
 * @property {DangerLevel} dangerLevel
 * @property {StartEase} startEase
 * @property {TaskGenre} genre
 * @property {string[]} subTasks
 * @property {string | undefined} memo
 * @property {boolean} isCompleted
 * @property {string | undefined} completedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ReviewLog
 * @property {string} id
 * @property {string} taskProjectId
 * @property {string} startedMood
 * @property {'30分' | '60分' | '90分〜'} selectedTime
 * @property {string | undefined} selectedReward
 * @property {number} progressRating
 * @property {number} focusRating
 * @property {number} continuationRating
 * @property {string | undefined} reviewMemo
 * @property {string | undefined} nextMemo
 * @property {string} createdAt
 */

/**
 * @typedef {Object} FunEvent
 * @property {string} id
 * @property {string} date YYYY-MM-DD
 * @property {string} title
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const dangerLevels = ['S', 'A', 'B', 'C']

export const dangerLevelDescriptions = {
  S: '期限が近い、または重要度が非常に高いのに、ほとんど着手できていない状態',
  A: '早めに進めないと危険。理解・作業量が重く、後回しにすると詰まりやすい状態',
  B: '普通に進めれば間に合うが、油断すると負担が増える状態',
  C: '現時点では比較的余裕がある。維持・軽い着手でよい状態',
}

export const startEaseOptions = [
  { value: 1, label: 'かなり重い' },
  { value: 2, label: 'やや重い' },
  { value: 3, label: '普通' },
  { value: 4, label: '比較的始めやすい' },
  { value: 5, label: 'かなり始めやすい' },
]

export const taskGenres = [
  '試験勉強',
  'レポート',
  '課題',
  '資料作成',
  '会議準備',
  '資格勉強',
  '個人開発',
  '部活',
  '就活・インターン',
  '研究',
  '語学',
  'その他',
]

export const reviewRatingOptions = [1, 2, 3, 4, 5]
