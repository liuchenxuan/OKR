// OKR可视化系统 - 周期管理组件
// 作者：刘宸轩

import React, { useState } from 'react';
import useStore from '../store/useStore';
import { calculateCycleProgress, calculateTimeProgress, getRiskLevel } from '../types';

interface CycleFormData {
  name: string;
  startDate: string;
  endDate: string;
}

const CycleManager: React.FC = () => {
  const { cycles, addCycle, updateCycle, deleteCycle, currentCycleId, setCurrentCycle } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CycleFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleCreate = () => {
    if (formData.name && formData.startDate && formData.endDate) {
      addCycle(formData.name, formData.startDate, formData.endDate);
      setFormData({ name: '', startDate: '', endDate: '' });
      setIsCreating(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (formData.name && formData.startDate && formData.endDate) {
      updateCycle(id, formData);
      setEditingId(null);
      setFormData({ name: '', startDate: '', endDate: '' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个周期吗？所有相关的目标和KR都将被删除。')) {
      deleteCycle(id);
    }
  };

  const startEdit = (cycle: typeof cycles[0]) => {
    setEditingId(cycle.id);
    setFormData({
      name: cycle.name,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
    });
  };

  const riskColorClass = {
    healthy: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    warning: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    critical: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">周期管理</h1>
          <p className="text-slate-500">创建和管理OKR周期，通常以季度为单位</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({ name: '', startDate: '', endDate: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建周期
        </button>
      </div>

      {/* 创建表单 */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">新建周期</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">周期名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入周期名称"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">开始日期</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">结束日期</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={!formData.name || !formData.startDate || !formData.endDate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* 周期列表 */}
      <div className="space-y-4">
        {cycles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">暂无周期</h3>
            <p className="text-slate-600 mb-4">创建您的第一个OKR周期开始规划目标</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建周期
            </button>
          </div>
        ) : (
          cycles.map((cycle) => {
            const progress = calculateCycleProgress(cycle);
            const timeProgress = calculateTimeProgress(cycle.startDate, cycle.endDate);
            const risk = getRiskLevel(progress, timeProgress);
            const isEditing = editingId === cycle.id;
            const isCurrent = currentCycleId === cycle.id;

            return (
              <div
                key={cycle.id}
                className={`bg-slate-900 border rounded-2xl p-6 transition-all ${
                  isCurrent ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-800'
                }`}
              >
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">周期名称</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">开始日期</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">结束日期</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleUpdate(cycle.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-white">{cycle.name}</h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                当前
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {cycle.startDate} ~ {cycle.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => setCurrentCycle(cycle.id)}
                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            设为当前
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(cycle)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cycle.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-sm text-slate-500 mb-1">目标数</div>
                        <div className="text-2xl font-bold text-white">{cycle.objectives.length}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-sm text-slate-500 mb-1">KR数</div>
                        <div className="text-2xl font-bold text-white">
                          {cycle.objectives.reduce((sum, obj) => sum + obj.keyResults.length, 0)}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-sm text-slate-500 mb-1">完成进度</div>
                        <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="text-sm text-slate-500 mb-1">状态</div>
                        <div className={`inline-flex px-2 py-1 rounded-full text-sm border ${riskColorClass[risk]}`}>
                          {risk === 'healthy' ? '健康' : risk === 'warning' ? '需关注' : '有风险'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500">完成进度</span>
                          <span className="text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500">时间进度</span>
                          <span className="text-slate-400">{Math.round(timeProgress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(timeProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CycleManager;
