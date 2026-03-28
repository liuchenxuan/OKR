// OKR可视化系统 - 状态管理
// 作者：刘宸轩

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Cycle, Objective, KeyResult, ProgressRecord, TeamMember, ViewMode } from '../types';

interface OKRStore {
  // 状态
  cycles: Cycle[];
  members: TeamMember[];
  currentCycleId: string | null;
  viewMode: ViewMode;

  // 视图操作
  setViewMode: (mode: ViewMode) => void;
  setCurrentCycle: (cycleId: string | null) => void;

  // 周期操作
  addCycle: (name: string, startDate: string, endDate: string) => void;
  updateCycle: (cycleId: string, data: Partial<Pick<Cycle, 'name' | 'startDate' | 'endDate'>>) => void;
  deleteCycle: (cycleId: string) => void;

  // 目标操作
  addObjective: (cycleId: string, title: string, owner: string) => void;
  updateObjective: (cycleId: string, objectiveId: string, data: Partial<Pick<Objective, 'title' | 'owner'>>) => void;
  deleteObjective: (cycleId: string, objectiveId: string) => void;

  // KR操作
  addKeyResult: (cycleId: string, objectiveId: string, kr: Omit<KeyResult, 'id' | 'objectiveId' | 'progressRecords' | 'createdAt'>) => void;
  updateKeyResult: (cycleId: string, objectiveId: string, krId: string, data: Partial<KeyResult>) => void;
  deleteKeyResult: (cycleId: string, objectiveId: string, krId: string) => void;

  // 进度更新
  addProgressRecord: (cycleId: string, objectiveId: string, krId: string, value: number, note: string, updatedBy: string) => void;

  // 团队成员操作
  addMember: (name: string, role: string) => void;
  updateMember: (memberId: string, data: Partial<Pick<TeamMember, 'name' | 'role'>>) => void;
  deleteMember: (memberId: string) => void;

  // 初始化示例数据
  initDemoData: () => void;
}

const useStore = create<OKRStore>()(
  persist(
    (set) => ({
      cycles: [],
      members: [],
      currentCycleId: null,
      viewMode: 'dashboard',
      
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentCycle: (cycleId) => set({ currentCycleId: cycleId }),
      
      // 周期操作
      addCycle: (name, startDate, endDate) => {
        const newCycle: Cycle = {
          id: uuidv4(),
          name,
          startDate,
          endDate,
          objectives: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ 
          cycles: [...state.cycles, newCycle],
          currentCycleId: state.currentCycleId || newCycle.id
        }));
      },
      
      updateCycle: (cycleId, data) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId ? { ...c, ...data } : c
          ),
        }));
      },
      
      deleteCycle: (cycleId) => {
        set((state) => {
          const newCycles = state.cycles.filter((c) => c.id !== cycleId);
          return {
            cycles: newCycles,
            currentCycleId: state.currentCycleId === cycleId 
              ? (newCycles[0]?.id || null) 
              : state.currentCycleId
          };
        });
      },
      
      // 目标操作
      addObjective: (cycleId, title, owner) => {
        const newObjective: Objective = {
          id: uuidv4(),
          cycleId,
          title,
          owner,
          keyResults: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? { ...c, objectives: [...c.objectives, newObjective] }
              : c
          ),
        }));
      },
      
      updateObjective: (cycleId, objectiveId, data) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? {
                  ...c,
                  objectives: c.objectives.map((o) =>
                    o.id === objectiveId ? { ...o, ...data } : o
                  ),
                }
              : c
          ),
        }));
      },
      
      deleteObjective: (cycleId, objectiveId) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? { ...c, objectives: c.objectives.filter((o) => o.id !== objectiveId) }
              : c
          ),
        }));
      },
      
      // KR操作
      addKeyResult: (cycleId, objectiveId, kr) => {
        const newKR: KeyResult = {
          ...kr,
          id: uuidv4(),
          objectiveId,
          progressRecords: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? {
                  ...c,
                  objectives: c.objectives.map((o) =>
                    o.id === objectiveId
                      ? { ...o, keyResults: [...o.keyResults, newKR] }
                      : o
                  ),
                }
              : c
          ),
        }));
      },
      
      updateKeyResult: (cycleId, objectiveId, krId, data) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? {
                  ...c,
                  objectives: c.objectives.map((o) =>
                    o.id === objectiveId
                      ? {
                          ...o,
                          keyResults: o.keyResults.map((kr) =>
                            kr.id === krId ? { ...kr, ...data } : kr
                          ),
                        }
                      : o
                  ),
                }
              : c
          ),
        }));
      },
      
      deleteKeyResult: (cycleId, objectiveId, krId) => {
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? {
                  ...c,
                  objectives: c.objectives.map((o) =>
                    o.id === objectiveId
                      ? { ...o, keyResults: o.keyResults.filter((kr) => kr.id !== krId) }
                      : o
                  ),
                }
              : c
          ),
        }));
      },
      
      // 进度更新
      addProgressRecord: (cycleId, objectiveId, krId, value, note, updatedBy) => {
        const record: ProgressRecord = {
          id: uuidv4(),
          date: new Date().toISOString(),
          value,
          note,
          updatedBy,
        };
        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === cycleId
              ? {
                  ...c,
                  objectives: c.objectives.map((o) =>
                    o.id === objectiveId
                      ? {
                          ...o,
                          keyResults: o.keyResults.map((kr) =>
                            kr.id === krId
                              ? {
                                  ...kr,
                                  currentValue: value,
                                  progressRecords: [...kr.progressRecords, record],
                                }
                              : kr
                          ),
                        }
                      : o
                  ),
                }
              : c
          ),
        }));
      },
      
      // 团队成员操作
      addMember: (name, role) => {
        const newMember: TeamMember = {
          id: uuidv4(),
          name,
          role,
        };
        set((state) => ({ members: [...state.members, newMember] }));
      },
      
      updateMember: (memberId, data) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, ...data } : m
          ),
        }));
      },
      
      deleteMember: (memberId) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId),
        }));
      },

      // 初始化示例数据
      initDemoData: () => {
        const startDate = '2026-02-01';
        const endDate = '2026-04-01';
        const cycleId = uuidv4();
        const obj1Id = uuidv4();
        const obj2Id = uuidv4();
        const obj3Id = uuidv4();

        const generateProgressRecords = (weeks: number, target: number, start: number, current: number): ProgressRecord[] => {
          const records: ProgressRecord[] = [];
          const step = (current - start) / weeks;
          for (let i = 1; i <= weeks; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i * 7);
            if (date > new Date()) break;
            records.push({
              id: uuidv4(),
              date: date.toISOString(),
              value: Math.round((start + step * i) * 10) / 10,
              note: `第${i}周进度更新`,
              updatedBy: '学生',
            });
          }
          return records;
        };

        const demoCycle: Cycle = {
          id: cycleId,
          name: '自主学习提分（语数外）',
          startDate,
          endDate,
          createdAt: new Date(startDate).toISOString(),
          objectives: [
            {
              id: obj1Id,
              cycleId,
              title: '数学成绩显著提升',
              owner: '学生',
              createdAt: new Date(startDate).toISOString(),
              keyResults: [
                {
                  id: uuidv4(),
                  objectiveId: obj1Id,
                  title: '三角函数专题突破',
                  owner: '学生',
                  targetValue: 90,
                  currentValue: 72,
                  startValue: 58,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 90, 58, 72),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj1Id,
                  title: '解析几何专项训练',
                  owner: '学生',
                  targetValue: 85,
                  currentValue: 65,
                  startValue: 52,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 85, 52, 65),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj1Id,
                  title: '概率统计满分训练',
                  owner: '学生',
                  targetValue: 88,
                  currentValue: 70,
                  startValue: 55,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 88, 55, 70),
                  createdAt: new Date(startDate).toISOString(),
                },
              ],
            },
            {
              id: obj2Id,
              cycleId,
              title: '英语综合能力提升',
              owner: '学生',
              createdAt: new Date(startDate).toISOString(),
              keyResults: [
                {
                  id: uuidv4(),
                  objectiveId: obj2Id,
                  title: '词汇量突破3500',
                  owner: '学生',
                  targetValue: 3500,
                  currentValue: 2800,
                  startValue: 2200,
                  unit: '词',
                  progressRecords: generateProgressRecords(8, 3500, 2200, 2800),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj2Id,
                  title: '阅读理解正确率',
                  owner: '学生',
                  targetValue: 85,
                  currentValue: 68,
                  startValue: 52,
                  unit: '%',
                  progressRecords: generateProgressRecords(8, 85, 52, 68),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj2Id,
                  title: '写作表达能力',
                  owner: '学生',
                  targetValue: 80,
                  currentValue: 62,
                  startValue: 48,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 80, 48, 62),
                  createdAt: new Date(startDate).toISOString(),
                },
              ],
            },
            {
              id: obj3Id,
              cycleId,
              title: '语文素养全面提升',
              owner: '学生',
              createdAt: new Date(startDate).toISOString(),
              keyResults: [
                {
                  id: uuidv4(),
                  objectiveId: obj3Id,
                  title: '古诗文背诵默写',
                  owner: '学生',
                  targetValue: 95,
                  currentValue: 78,
                  startValue: 65,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 95, 65, 78),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj3Id,
                  title: '现代文阅读理解',
                  owner: '学生',
                  targetValue: 85,
                  currentValue: 70,
                  startValue: 58,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 85, 58, 70),
                  createdAt: new Date(startDate).toISOString(),
                },
                {
                  id: uuidv4(),
                  objectiveId: obj3Id,
                  title: '作文写作能力',
                  owner: '学生',
                  targetValue: 82,
                  currentValue: 68,
                  startValue: 55,
                  unit: '分',
                  progressRecords: generateProgressRecords(8, 82, 55, 68),
                  createdAt: new Date(startDate).toISOString(),
                },
              ],
            },
          ],
        };

        set({
          cycles: [demoCycle],
          members: [{ id: uuidv4(), name: '学生', role: '学习者' }],
          currentCycleId: cycleId,
        });
      },
    }),
    {
      name: 'okr-storage',
    }
  )
);

export default useStore;
