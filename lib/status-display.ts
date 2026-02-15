const TERRITORY_TYPE_LABELS: Record<string, string> = {
  NO_ENTRY: '非成员禁止进入',
  NO_BREAK: '非成员改冒险(可进入)',
}

const STATUS_LABELS: Record<string, string> = {
  FROZEN: '冻结(已退群)',
  ACTIVE: '正常',
  PENDING: '待审核',
  BANNED: '已封禁',
  DONE: '已完成',
  IGNORED: '已忽略',
  REJECTED: '已拒绝',
  PENDING_CREATE: '待腐竹创建',
  PENDING_UPDATE: '待腐竹更新',
  PENDING_DELETE: '待腐竹删除',
}

const ADMIN_TASK_TYPE_LABELS: Record<string, string> = {
  REVIEW_TERRITORY_CREATE: '领地创建审核',
  REVIEW_TERRITORY_DELETE: '领地删除审核',
  REVIEW_TERRITORY_UPDATE: '领地更新审核',
  CLEANUP_USER: '用户清理',
  RECYCLE_TERRITORY_SIZE: '领地面积回收',
}

const STATUS_TAG_COLORS: Record<string, string> = {
  ACTIVE: 'success',
  DONE: 'success',
  PENDING: 'processing',
  PENDING_CREATE: 'processing',
  PENDING_UPDATE: 'processing',
  PENDING_DELETE: 'processing',
  REJECTED: 'error',
  BANNED: 'error',
  IGNORED: 'default',
}

const TASK_TYPE_TAG_COLORS: Record<string, string> = {
  REVIEW_TERRITORY_CREATE: 'blue',
  REVIEW_TERRITORY_DELETE: 'volcano',
  REVIEW_TERRITORY_UPDATE: 'geekblue',
  CLEANUP_USER: 'magenta',
  RECYCLE_TERRITORY_SIZE: 'purple',
}

function normalizeCode(code: string | null | undefined): string {
  return (code || '').toUpperCase().trim()
}

function humanizeCode(code: string): string {
  if (!code) return '未知状态'
  return code
    .split('_')
    .filter(Boolean)
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(' ')
}

export function getStatusLabel(code: string | null | undefined): string {
  const normalized = normalizeCode(code)
  if (!normalized) return '未知状态'

  if (STATUS_LABELS[normalized]) {
    return STATUS_LABELS[normalized]
  }

  if (normalized.startsWith('PENDING_')) {
    const suffix = normalized.replace('PENDING_', '')
    if (suffix === 'CREATE') return '待腐竹创建'
    if (suffix === 'UPDATE') return '待腐竹更新'
    if (suffix === 'DELETE') return '待腐竹删除'
    return `待腐竹${humanizeCode(suffix)}`
  }

  return humanizeCode(normalized)
}

export function getStatusTagColor(code: string | null | undefined): string {
  const normalized = normalizeCode(code)
  if (!normalized) return 'default'
  return STATUS_TAG_COLORS[normalized] || (normalized.startsWith('PENDING_') ? 'processing' : 'default')
}

export function getTerritoryTypeLabel(code: string | null | undefined): string {
  const normalized = normalizeCode(code)
  if (!normalized) return '未知类型'
  return TERRITORY_TYPE_LABELS[normalized] || humanizeCode(normalized)
}

export function getAdminTaskTypeLabel(code: string | null | undefined): string {
  const normalized = normalizeCode(code)
  if (!normalized) return '未知任务'
  return ADMIN_TASK_TYPE_LABELS[normalized] || humanizeCode(normalized)
}

export function getAdminTaskTypeTagColor(code: string | null | undefined): string {
  const normalized = normalizeCode(code)
  if (!normalized) return 'default'
  return TASK_TYPE_TAG_COLORS[normalized] || 'default'
}
