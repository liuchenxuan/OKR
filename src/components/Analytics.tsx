// OKR可视化系统 - 数据分析组件
// 作者：刘宸轩

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import useStore from '../store/useStore';
import {
  calculateCycleProgress,
  calculateObjectiveProgress,
  calculateKRProgress,
  calculateTimeProgress,
  getRiskLevel,
} from '../types';

const Analytics: React.FC = () => {
  const { cycles, currentCycleId } = useStore();
  const currentCycle = cycles.find((c) => c.id === currentCycleId);

  if (!currentCycle) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-400 mb-2">暂无数据分析</h3>
          <p className="text-slate-600">请先选择一个包含目标的OKR周期</p>
        </div>
      </div>
    );
  }

  const timeProgress = calculateTimeProgress(currentCycle.startDate, currentCycle.endDate);

  // 负责人工作量分析
  const ownerWorkload: Record<string, { objectives: number; krs: number; avgProgress: number }> = {};
  currentCycle.objectives.forEach((obj) => {
    if (!ownerWorkload[obj.owner]) {
      ownerWorkload[obj.owner] = { objectives: 0, krs: 0, avgProgress: 0 };
    }
    ownerWorkload[obj.owner].objectives++;
    
    obj.keyResults.forEach((kr) => {
      if (!ownerWorkload[kr.owner]) {
        ownerWorkload[kr.owner] = { objectives: 0, krs: 0, avgProgress: 0 };
      }
      ownerWorkload[kr.owner].krs++;
    });
  });

  // 计算每个负责人的平均进度
  Object.keys(ownerWorkload).forEach((owner) => {
    const ownerKRs: number[] = [];
    currentCycle.objectives.forEach((obj) => {
      obj.keyResults.forEach((kr) => {
        if (kr.owner === owner) {
          ownerKRs.push(calculateKRProgress(kr));
        }
      });
    });
    if (ownerKRs.length > 0) {
      ownerWorkload[owner].avgProgress = ownerKRs.reduce((a, b) => a + b, 0) / ownerKRs.length;
    }
  });

  const workloadData = Object.entries(ownerWorkload).map(([name, data]) => ({
    name,
    objectives: data.objectives,
    krs: data.krs,
    avgProgress: Math.round(data.avgProgress),
  }));

  // 风险分析
  const riskAnalysis = {
    healthy: 0,
    warning: 0,
    critical: 0,
  };

  currentCycle.objectives.forEach((obj) => {
    obj.keyResults.forEach((kr) => {
      const progress = calculateKRProgress(kr);
      const risk = getRiskLevel(progress, timeProgress);
      riskAnalysis[risk]++;
    });
  });

  const riskData = [
    { name: '健康', value: riskAnalysis.healthy, color: '#10b981' },
    { name: '需关注', value: riskAnalysis.warning, color: '#f59e0b' },
    { name: '有风险', value: riskAnalysis.critical, color: '#ef4444' },
  ];

  // 目标完成雷达数据
  const radarData = currentCycle.objectives.map((obj, index) => ({
    subject: `O${index + 1}`,
    progress: Math.round(calculateObjectiveProgress(obj)),
    fullMark: 100,
  }));

  // 进度趋势数据
  const progressTrendData: { date: string; progress: number }[] = [];
  const startDate = new Date(currentCycle.startDate);
  const now = new Date();
  const endDate = new Date(currentCycle.endDate);
  const actualEnd = now < endDate ? now : endDate;

  for (let d = new Date(startDate); d <= actualEnd; d.setDate(d.getDate() + 7)) {
    const dateStr = format(d, 'MM/dd', { locale: zhCN });
    
    let totalKRs = 0;
    let progressSum = 0;
    
    currentCycle.objectives.forEach((obj) => {
      obj.keyResults.forEach((kr) => {
        totalKRs++;
        const relevantRecords = kr.progressRecords.filter(
          (r) => new Date(r.date) <= d
        );
        if (relevantRecords.length > 0) {
          const latestValue = relevantRecords[relevantRecords.length - 1].value;
          const range = kr.targetValue - kr.startValue;
          if (range !== 0) {
            progressSum += Math.min(((latestValue - kr.startValue) / range) * 100, 100);
          }
        }
      });
    });

    progressTrendData.push({
      date: dateStr,
      progress: totalKRs > 0 ? Math.round(progressSum / totalKRs) : 0,
    });
  }

  // 各目标KR数量
  const objectiveKRCount = currentCycle.objectives.map((obj, index) => ({
    name: `O${index + 1}`,
    fullName: obj.title.slice(0, 15) + '...',
    krs: obj.keyResults.length,
    completed: obj.keyResults.filter((kr) => calculateKRProgress(kr) >= 100).length,
  }));

  // 周期统计
  const cycleStats = {
    totalObjectives: currentCycle.objectives.length,
    totalKRs: currentCycle.objectives.reduce((sum, obj) => sum + obj.keyResults.length, 0),
    avgProgress: Math.round(calculateCycleProgress(currentCycle)),
    completedKRs: currentCycle.objectives.reduce(
      (sum, obj) => sum + obj.keyResults.filter((kr) => calculateKRProgress(kr) >= 100).length,
      0
    ),
    atRiskKRs: riskAnalysis.critical,
    daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
  };

  return (
    <div className="p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">数据分析</h1>
        <p className="text-slate-500">
          {currentCycle.name} · 深度分析OKR执行情况，识别风险与瓶颈
        </p>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">目标总数</div>
          <div className="text-2xl font-bold text-white">{cycleStats.totalObjectives}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">KR总数</div>
          <div className="text-2xl font-bold text-white">{cycleStats.totalKRs}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">整体进度</div>
          <div className="text-2xl font-bold text-blue-400">{cycleStats.avgProgress}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">已完成KR</div>
          <div className="text-2xl font-bold text-emerald-400">{cycleStats.completedKRs}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">风险KR</div>
          <div className="text-2xl font-bold text-rose-400">{cycleStats.atRiskKRs}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-500 mb-1">剩余天数</div>
          <div className="text-2xl font-bold text-amber-400">{cycleStats.daysRemaining}</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 进度趋势图 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">进度趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value) => [`${value}%`, '完成进度']}
                />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 目标完成雷达图 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">目标完成度对比</h3>
          <div className="h-72">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Radar
                    name="完成度"
                    dataKey="progress"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
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
        </div>

        {/* 风险分布 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">KR风险分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value) => [`${value} 个`, 'KR数量']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 目标KR完成情况 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">各目标KR完成情况</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={objectiveKRCount} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'krs' ? 'KR总数' : '已完成')}
                />
                <Bar dataKey="krs" fill="#6366f1" radius={[4, 4, 0, 0]} name="krs" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 负责人分析 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">负责人工作量分析</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">负责人</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">负责目标数</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">负责KR数</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">平均完成度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400 w-64">进度</th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((item) => (
                <tr key={item.name} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-medium">
                        {item.name.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 text-slate-300">{item.objectives}</td>
                  <td className="text-center py-4 px-4 text-slate-300">{item.krs}</td>
                  <td className="text-center py-4 px-4">
                    <span
                      className={`${
                        item.avgProgress >= 70
                          ? 'text-emerald-400'
                          : item.avgProgress >= 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {item.avgProgress}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.avgProgress >= 70
                            ? 'bg-emerald-500'
                            : item.avgProgress >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.avgProgress}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
