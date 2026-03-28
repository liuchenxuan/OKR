// OKR可视化系统 - 目标与KR管理组件
// 作者：刘宸轩

import React, { useState } from 'react';
import useStore from '../store/useStore';
import {
  calculateObjectiveProgress,
  calculateKRProgress,
  calculateTimeProgress,
  getRiskLevel,
} from '../types';
import type { Objective, KeyResult } from '../types';

const ObjectiveManager: React.FC = () => {
  const {
    cycles,
    currentCycleId,
    members,
    addObjective,
    updateObjective,
    deleteObjective,
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
    addProgressRecord,
  } = useStore();

  const currentCycle = cycles.find((c) => c.id === currentCycleId);

  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [addingKRToObjectiveId, setAddingKRToObjectiveId] = useState<string | null>(null);
  const [editingKRId, setEditingKRId] = useState<string | null>(null);
  const [updatingProgressKRId, setUpdatingProgressKRId] = useState<string | null>(null);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  const [objectiveForm, setObjectiveForm] = useState({ title: '', owner: '' });
  const [krForm, setKRForm] = useState({
    title: '',
    owner: '',
    targetValue: 0,
    currentValue: 0,
    startValue: 0,
    unit: '',
  });
  const [progressForm, setProgressForm] = useState({
    value: 0,
    note: '',
    updatedBy: '',
  });

  const toggleObjective = (id: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedObjectives(newExpanded);
  };

  const handleAddObjective = () => {
    if (currentCycleId && objectiveForm.title && objectiveForm.owner) {
      addObjective(currentCycleId, objectiveForm.title, objectiveForm.owner);
      setObjectiveForm({ title: '', owner: '' });
      setIsAddingObjective(false);
    }
  };

  const handleUpdateObjective = (objectiveId: string) => {
    if (currentCycleId && objectiveForm.title && objectiveForm.owner) {
      updateObjective(currentCycleId, objectiveId, objectiveForm);
      setEditingObjectiveId(null);
      setObjectiveForm({ title: '', owner: '' });
    }
  };

  const handleDeleteObjective = (objectiveId: string) => {
    if (currentCycleId && confirm('确定要删除这个目标吗？所有相关的KR都将被删除。')) {
      deleteObjective(currentCycleId, objectiveId);
    }
  };

  const handleAddKR = (objectiveId: string) => {
    if (currentCycleId && krForm.title && krForm.owner) {
      addKeyResult(currentCycleId, objectiveId, krForm);
      setKRForm({ title: '', owner: '', targetValue: 0, currentValue: 0, startValue: 0, unit: '' });
      setAddingKRToObjectiveId(null);
    }
  };

  const handleUpdateKR = (objectiveId: string, krId: string) => {
    if (currentCycleId) {
      updateKeyResult(currentCycleId, objectiveId, krId, krForm);
      setEditingKRId(null);
      setKRForm({ title: '', owner: '', targetValue: 0, currentValue: 0, startValue: 0, unit: '' });
    }
  };

  const handleDeleteKR = (objectiveId: string, krId: string) => {
    if (currentCycleId && confirm('确定要删除这个关键结果吗？')) {
      deleteKeyResult(currentCycleId, objectiveId, krId);
    }
  };

  const handleAddProgress = (objectiveId: string, krId: string) => {
    if (currentCycleId && progressForm.updatedBy) {
      addProgressRecord(
        currentCycleId,
        objectiveId,
        krId,
        progressForm.value,
        progressForm.note,
        progressForm.updatedBy
      );
      setProgressForm({ value: 0, note: '', updatedBy: '' });
      setUpdatingProgressKRId(null);
    }
  };

  const startEditObjective = (objective: Objective) => {
    setEditingObjectiveId(objective.id);
    setObjectiveForm({ title: objective.title, owner: objective.owner });
  };

  const startEditKR = (kr: KeyResult) => {
    setEditingKRId(kr.id);
    setKRForm({
      title: kr.title,
      owner: kr.owner,
      targetValue: kr.targetValue,
      currentValue: kr.currentValue,
      startValue: kr.startValue,
      unit: kr.unit,
    });
  };

  const startUpdateProgress = (kr: KeyResult) => {
    setUpdatingProgressKRId(kr.id);
    setProgressForm({ value: kr.currentValue, note: '', updatedBy: '' });
  };

  if (!currentCycle) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-400 mb-2">请先选择一个周期</h3>
          <p className="text-slate-600">在左侧选择或创建一个OKR周期</p>
        </div>
      </div>
    );
  }

  const timeProgress = calculateTimeProgress(currentCycle.startDate, currentCycle.endDate);

  const riskColorClass = {
    healthy: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
  };

  const riskBgClass = {
    healthy: 'bg-emerald-500/20 border-emerald-500/30',
    warning: 'bg-amber-500/20 border-amber-500/30',
    critical: 'bg-rose-500/20 border-rose-500/30',
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">目标与关键结果</h1>
          <p className="text-slate-500">{currentCycle.name} · {currentCycle.startDate} ~ {currentCycle.endDate}</p>
        </div>
        <button
          onClick={() => {
            setIsAddingObjective(true);
            setObjectiveForm({ title: '', owner: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建目标
        </button>
      </div>

      {/* 新建目标表单 */}
      {isAddingObjective && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">新建目标 (Objective)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">目标描述</label>
              <input
                type="text"
                value={objectiveForm.title}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                placeholder="请输入目标描述"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">负责人</label>
              <input
                type="text"
                value={objectiveForm.owner}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, owner: e.target.value })}
                placeholder="输入负责人姓名"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddingObjective(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddObjective}
              disabled={!objectiveForm.title || !objectiveForm.owner}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* 目标列表 */}
      <div className="space-y-4">
        {currentCycle.objectives.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">暂无目标</h3>
            <p className="text-slate-600 mb-4">为当前周期创建您的第一个目标</p>
          </div>
        ) : (
          currentCycle.objectives.map((objective, objIndex) => {
            const objProgress = calculateObjectiveProgress(objective);
            const objRisk = getRiskLevel(objProgress, timeProgress);
            const isExpanded = expandedObjectives.has(objective.id);
            const isEditing = editingObjectiveId === objective.id;

            return (
              <div key={objective.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* 目标头部 */}
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">目标描述</label>
                          <input
                            type="text"
                            value={objectiveForm.title}
                            onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">负责人</label>
                          <input
                            type="text"
                            value={objectiveForm.owner}
                            onChange={(e) => setObjectiveForm({ ...objectiveForm, owner: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingObjectiveId(null)}
                          className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleUpdateObjective(objective.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleObjective(objective.id)}
                          className="mt-1 p-1 text-slate-500 hover:text-white transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          O{objIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{objective.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>负责人: {objective.owner}</span>
                            <span>{objective.keyResults.length} 个KR</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm border ${riskBgClass[objRisk]}`}>
                          <span className={riskColorClass[objRisk]}>{Math.round(objProgress)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditObjective(objective)}
                            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteObjective(objective.id)}
                            className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 展开的KR列表 */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/50">
                    <div className="p-6 space-y-4">
                      {/* KR列表 */}
                      {objective.keyResults.map((kr, krIndex) => {
                        const krProgress = calculateKRProgress(kr);
                        const krRisk = getRiskLevel(krProgress, timeProgress);
                        const isEditingKR = editingKRId === kr.id;
                        const isUpdatingProgress = updatingProgressKRId === kr.id;

                        return (
                          <div key={kr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            {isEditingKR ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm text-slate-400 mb-2">KR描述</label>
                                    <input
                                      type="text"
                                      value={krForm.title}
                                      onChange={(e) => setKRForm({ ...krForm, title: e.target.value })}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">负责人</label>
                                    <input
                                      type="text"
                                      value={krForm.owner}
                                      onChange={(e) => setKRForm({ ...krForm, owner: e.target.value })}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">起始值</label>
                                    <input
                                      type="number"
                                      value={krForm.startValue}
                                      onChange={(e) => setKRForm({ ...krForm, startValue: parseFloat(e.target.value) || 0 })}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">目标值</label>
                                    <input
                                      type="number"
                                      value={krForm.targetValue}
                                      onChange={(e) => setKRForm({ ...krForm, targetValue: parseFloat(e.target.value) || 0 })}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">单位</label>
                                    <input
                                      type="text"
                                      value={krForm.unit}
                                      onChange={(e) => setKRForm({ ...krForm, unit: e.target.value })}
                                      placeholder="请输入单位"
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => setEditingKRId(null)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                  >
                                    取消
                                  </button>
                                  <button
                                    onClick={() => handleUpdateKR(objective.id, kr.id)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                  >
                                    保存
                                  </button>
                                </div>
                              </div>
                            ) : isUpdatingProgress ? (
                              <div className="space-y-4">
                                <h4 className="font-medium text-white">更新进度: {kr.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">当前数值</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={progressForm.value}
                                        onChange={(e) => setProgressForm({ ...progressForm, value: parseFloat(e.target.value) || 0 })}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <span className="text-slate-400">{kr.unit}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">更新人</label>
                                    <input
                                      type="text"
                                      value={progressForm.updatedBy}
                                      onChange={(e) => setProgressForm({ ...progressForm, updatedBy: e.target.value })}
                                      placeholder="输入更新人姓名"
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-slate-400 mb-2">备注</label>
                                    <input
                                      type="text"
                                      value={progressForm.note}
                                      onChange={(e) => setProgressForm({ ...progressForm, note: e.target.value })}
                                      placeholder="可选"
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => setUpdatingProgressKRId(null)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                  >
                                    取消
                                  </button>
                                  <button
                                    onClick={() => handleAddProgress(objective.id, kr.id)}
                                    disabled={!progressForm.updatedBy}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                                  >
                                    确认更新
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-semibold text-sm">
                                    KR{krIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-white">{kr.title}</h4>
                                      <span className="text-sm text-slate-500">({kr.owner})</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1 max-w-md">
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                              krRisk === 'healthy'
                                                ? 'bg-emerald-500'
                                                : krRisk === 'warning'
                                                ? 'bg-amber-500'
                                                : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${Math.min(krProgress, 100)}%` }}
                                          />
                                        </div>
                                      </div>
                                      <span className={`text-sm ${riskColorClass[krRisk]}`}>
                                        {kr.currentValue} / {kr.targetValue} {kr.unit} ({Math.round(krProgress)}%)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startUpdateProgress(kr)}
                                    className="p-3 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                    title="更新进度"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => startEditKR(kr)}
                                    className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteKR(objective.id, kr.id)}
                                    className="p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 添加KR按钮/表单 */}
                      {addingKRToObjectiveId === objective.id ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                          <h4 className="font-medium text-white mb-4">添加关键结果 (Key Result)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2 lg:col-span-3">
                              <label className="block text-sm text-slate-400 mb-2">KR描述</label>
                              <input
                                type="text"
                                value={krForm.title}
                                onChange={(e) => setKRForm({ ...krForm, title: e.target.value })}
                                placeholder="请输入KR描述"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
              <label className="block text-sm text-slate-400 mb-2">负责人</label>
              <input
                type="text"
                value={krForm.owner}
                onChange={(e) => setKRForm({ ...krForm, owner: e.target.value })}
                placeholder="输入负责人姓名"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">起始值</label>
                              <input
                                type="number"
                                value={krForm.startValue}
                                onChange={(e) => setKRForm({ ...krForm, startValue: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">目标值</label>
                              <input
                                type="number"
                                value={krForm.targetValue}
                                onChange={(e) => setKRForm({ ...krForm, targetValue: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">当前值</label>
                              <input
                                type="number"
                                value={krForm.currentValue}
                                onChange={(e) => setKRForm({ ...krForm, currentValue: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">单位</label>
                              <input
                                type="text"
                                value={krForm.unit}
                                onChange={(e) => setKRForm({ ...krForm, unit: e.target.value })}
                                placeholder="请输入单位"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setAddingKRToObjectiveId(null)}
                              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleAddKR(objective.id)}
                              disabled={!krForm.title || !krForm.owner}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                            >
                              添加KR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingKRToObjectiveId(objective.id);
                            setKRForm({ title: '', owner: '', targetValue: 0, currentValue: 0, startValue: 0, unit: '' });
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-600 rounded-xl transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          添加关键结果 (KR)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ObjectiveManager;
