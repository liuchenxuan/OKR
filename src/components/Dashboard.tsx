// OKR可视化系统 - 仪表盘组件
// 作者：刘宸轩

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import useStore from '../store/useStore';
import {
  calculateCycleProgress,
  calculateObjectiveProgress,
  calculateKRProgress,
  calculateTimeProgress,
  getRiskLevel,
} from '../types';

const Dashboard: React.FC = () => {
  const { cycles, currentCycleId } = useStore();
  const currentCycle = cycles.find((c) => c.id === currentCycleId);

  if (!currentCycle) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-400 mb-2">暂无OKR数据</h3>
          <p className="text-slate-600">请先在「周期管理」中创建新的OKR周期</p>
        </div>
      </div>
    );
  }

  const cycleProgress = calculateCycleProgress(currentCycle);
  const timeProgress = calculateTimeProgress(currentCycle.startDate, currentCycle.endDate);
  const riskLevel = getRiskLevel(cycleProgress, timeProgress);

  // 计算各目标的完成情况用于雷达图
  const radarData = currentCycle.objectives.map((obj, index) => ({
    subject: `O${index + 1}`,
    fullName: obj.title,
    progress: Math.round(calculateObjectiveProgress(obj)),
    fullMark: 100,
  }));

  // 生成燃尽图数据
  const generateBurndownData = () => {
    const startDate = new Date(currentCycle.startDate);
    const endDate = new Date(currentCycle.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];

    for (let i = 0; i <= totalDays; i += 7) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const idealProgress = (i / totalDays) * 100;
      
      // 计算实际进度（基于历史记录）
      let actualProgress = 0;
      if (currentDate <= new Date()) {
        let totalKRs = 0;
        let progressSum = 0;
        
        currentCycle.objectives.forEach((obj) => {
          obj.keyResults.forEach((kr) => {
            totalKRs++;
            const relevantRecords = kr.progressRecords.filter(
              (r) => new Date(r.date) <= currentDate
            );
            if (relevantRecords.length > 0) {
              const latestValue = relevantRecords[relevantRecords.length - 1].value;
              const range = kr.targetValue - kr.startValue;
              if (range !== 0) {
                progressSum += ((latestValue - kr.startValue) / range) * 100;
              }
            }
          });
        });
        
        actualProgress = totalKRs > 0 ? progressSum / totalKRs : 0;
      }

      data.push({
        day: `第${Math.floor(i / 7) + 1}周`,
        date: currentDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        ideal: Math.round(idealProgress),
        actual: currentDate <= new Date() ? Math.round(actualProgress) : null,
      });
    }

    return data;
  };

  const burndownData = generateBurndownData();

  // 统计数据
  const totalObjectives = currentCycle.objectives.length;
  const totalKRs = currentCycle.objectives.reduce((sum, obj) => sum + obj.keyResults.length, 0);
  const atRiskKRs = currentCycle.objectives.reduce((sum, obj) => {
    return sum + obj.keyResults.filter((kr) => {
      const progress = calculateKRProgress(kr);
      return getRiskLevel(progress, timeProgress) === 'critical';
    }).length;
  }, 0);
  const completedKRs = currentCycle.objectives.reduce((sum, obj) => {
    return sum + obj.keyResults.filter((kr) => calculateKRProgress(kr) >= 100).length;
  }, 0);

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

  const riskLabel = {
    healthy: '健康',
    warning: '需关注',
    critical: '有风险',
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{currentCycle.name} 仪表盘</h1>
        <p className="text-slate-500">
          {currentCycle.startDate} ~ {currentCycle.endDate}
        </p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 整体进度 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm">整体完成度</span>
            <div className={`px-2 py-1 rounded-full text-xs border ${riskBgClass[riskLevel]}`}>
              <span className={riskColorClass[riskLevel]}>{riskLabel[riskLevel]}</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{Math.round(cycleProgress)}%</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">时间进度 {Math.round(timeProgress)}%</p>
        </div>

        {/* 目标数量 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm">目标 (Objectives)</span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white">{totalObjectives}</div>
          <p className="text-xs text-slate-600 mt-2">共 {totalKRs} 个关键结果</p>
        </div>

        {/* 已完成KR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm">已完成 KR</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white">{completedKRs}</div>
          <p className="text-xs text-slate-600 mt-2">占比 {totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0}%</p>
        </div>

        {/* 风险KR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm">风险 KR</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-white">{atRiskKRs}</div>
          <p className="text-xs text-slate-600 mt-2">需要重点关注</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 燃尽图 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">进度燃尽图</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'ideal' ? '理想进度' : '实际进度',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ideal"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorIdeal)"
                  name="ideal"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="actual"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-sm text-slate-400">理想进度</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-sm text-slate-400">实际进度</span>
            </div>
          </div>
        </div>

        {/* 雷达图 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">目标完成雷达图</h3>
          <div className="h-80">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Radar
                    name="完成度"
                    dataKey="progress"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(value) => [`${value}%`, '完成度']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">
                暂无目标数据
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {radarData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{item.subject}: {item.fullName.slice(0, 20)}...</span>
                <span className="text-slate-300">{item.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 目标进度概览 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">目标进度概览</h3>
        <div className="space-y-6">
          {currentCycle.objectives.map((objective, index) => {
            const objProgress = calculateObjectiveProgress(objective);
            const objRisk = getRiskLevel(objProgress, timeProgress);
            
            return (
              <div key={objective.id} className="border border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                      O{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{objective.title}</h4>
                      <p className="text-sm text-slate-500">负责人: {objective.owner}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs border ${riskBgClass[objRisk]}`}>
                    <span className={riskColorClass[objRisk]}>{Math.round(objProgress)}%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {objective.keyResults.map((kr, krIndex) => {
                    const krProgress = calculateKRProgress(kr);
                    const krRisk = getRiskLevel(krProgress, timeProgress);
                    
                    return (
                      <div key={kr.id} className="flex items-center gap-4">
                        <span className="text-xs text-slate-600 w-8">KR{krIndex + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-400 truncate max-w-md">
                              {kr.title}
                            </span>
                            <span className={`text-sm ${riskColorClass[krRisk]}`}>
                              {kr.currentValue} / {kr.targetValue} {kr.unit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
