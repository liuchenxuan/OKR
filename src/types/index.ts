// OKR可视化系统 - 类型定义
// 作者：刘宸轩

export interface ProgressRecord {
  id: string;
  date: string;
  value: number;
  note: string;
  updatedBy: string;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  owner: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startValue: number;
  progressRecords: ProgressRecord[];
  createdAt: string;
}

export interface Objective {
  id: string;
  cycleId: string;
  title: string;
  owner: string;
  keyResults: KeyResult[];
  createdAt: string;
}

export interface Cycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  objectives: Objective[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export type ViewMode = 'dashboard' | 'cycles' | 'objectives' | 'analytics';

export interface AppState {
  cycles: Cycle[];
  members: TeamMember[];
  currentCycleId: string | null;
  viewMode: ViewMode;
}

// 计算KR完成百分比
export const calculateKRProgress = (kr: KeyResult): number => {
  const range = kr.targetValue - kr.startValue;
  if (range === 0) return kr.currentValue >= kr.targetValue ? 100 : 0;
  const progress = ((kr.currentValue - kr.startValue) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// 计算目标整体完成百分比
export const calculateObjectiveProgress = (objective: Objective): number => {
  if (objective.keyResults.length === 0) return 0;
  const totalProgress = objective.keyResults.reduce(
    (sum, kr) => sum + calculateKRProgress(kr),
    0
  );
  return totalProgress / objective.keyResults.length;
};

// 计算周期整体完成百分比
export const calculateCycleProgress = (cycle: Cycle): number => {
  if (cycle.objectives.length === 0) return 0;
  const totalProgress = cycle.objectives.reduce(
    (sum, obj) => sum + calculateObjectiveProgress(obj),
    0
  );
  return totalProgress / cycle.objectives.length;
};

// 获取风险等级
export type RiskLevel = 'healthy' | 'warning' | 'critical';

export const getRiskLevel = (progress: number, timeProgress: number): RiskLevel => {
  const gap = timeProgress - progress;
  if (gap <= 10) return 'healthy';
  if (gap <= 25) return 'warning';
  return 'critical';
};

// 计算时间进度百分比
export const calculateTimeProgress = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  
  if (now <= start) return 0;
  if (now >= end) return 100;
  
  return ((now - start) / (end - start)) * 100;
};
