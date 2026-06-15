const TASK_PROJECTS_KEY = 'start-os:task-projects'
const REVIEW_LOGS_KEY = 'start-os:review-logs'
const FUN_EVENTS_KEY = 'start-os:fun-events'

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readJsonArray(key) {
  if (!canUseLocalStorage()) {
    return []
  }

  const rawValue = window.localStorage.getItem(key)

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function writeJsonArray(key, value) {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

/**
 * @returns {import('./domain').TaskProject[]}
 */
export function getTaskProjects() {
  return readJsonArray(TASK_PROJECTS_KEY)
}

/**
 * @param {import('./domain').TaskProject[]} taskProjects
 */
export function saveTaskProjects(taskProjects) {
  writeJsonArray(TASK_PROJECTS_KEY, taskProjects)
}

/**
 * @param {import('./domain').TaskProject} taskProject
 */
export function addTaskProject(taskProject) {
  const taskProjects = getTaskProjects()
  saveTaskProjects([...taskProjects, taskProject])
}

/**
 * @param {string} taskProjectId
 * @param {(taskProject: import('./domain').TaskProject) => import('./domain').TaskProject} updateTaskProject
 */
export function updateTaskProject(taskProjectId, updateTaskProject) {
  const taskProjects = getTaskProjects().map((taskProject) =>
    taskProject.id === taskProjectId
      ? updateTaskProject(taskProject)
      : taskProject,
  )

  saveTaskProjects(taskProjects)
}

/**
 * @param {string} taskProjectId
 */
export function deleteTaskProject(taskProjectId) {
  const taskProjects = getTaskProjects().filter(
    (taskProject) => taskProject.id !== taskProjectId,
  )

  saveTaskProjects(taskProjects)
}

/**
 * @returns {import('./domain').ReviewLog[]}
 */
export function getReviewLogs() {
  return readJsonArray(REVIEW_LOGS_KEY)
}

/**
 * @param {import('./domain').ReviewLog[]} reviewLogs
 */
export function saveReviewLogs(reviewLogs) {
  writeJsonArray(REVIEW_LOGS_KEY, reviewLogs)
}

/**
 * @param {import('./domain').ReviewLog} reviewLog
 */
export function addReviewLog(reviewLog) {
  const reviewLogs = getReviewLogs()
  saveReviewLogs([...reviewLogs, reviewLog])
}

/**
 * @returns {import('./domain').FunEvent[]}
 */
export function getFunEvents() {
  return readJsonArray(FUN_EVENTS_KEY)
}

/**
 * @param {import('./domain').FunEvent[]} funEvents
 */
export function saveFunEvents(funEvents) {
  writeJsonArray(FUN_EVENTS_KEY, funEvents)
}

/**
 * @param {import('./domain').FunEvent} funEvent
 */
export function addFunEvent(funEvent) {
  const funEvents = getFunEvents()
  saveFunEvents([...funEvents, funEvent])
}

/**
 * @param {string} funEventId
 */
export function deleteFunEvent(funEventId) {
  const funEvents = getFunEvents().filter(
    (funEvent) => funEvent.id !== funEventId,
  )

  saveFunEvents(funEvents)
}
