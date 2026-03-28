// OKR可视化系统 - 主应用入口
// 作者：刘宸轩

import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CycleManager from './components/CycleManager';
import ObjectiveManager from './components/ObjectiveManager';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const { viewMode, cycles, initDemoData } = useStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (cycles.length === 0) {
      setShowWelcome(true);
    }
  }, [cycles.length]);

  const handleInitDemo = () => {
    initDemoData();
    setShowWelcome(false);
  };

  const handleSkip = () => {
    setShowWelcome(false);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return <Dashboard />;
      case 'cycles':
        return <CycleManager />;
      case 'objectives':
        return <ObjectiveManager />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout>{renderContent()}</Layout>

      {showWelcome && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">
              欢迎使用 OKR 可视化系统
            </h2>
            <p className="text-slate-400 text-center mb-8">
              专为个人开发者、独立创作者和初创团队打造的目标管理工具
            </p>

            <div className="space-y-4">
              <button
                onClick={handleInitDemo}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                加载示例数据（高中语数外学习OKR）
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                跳过，从零开始创建
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>本地存储</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>数据安全</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>离线可用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
