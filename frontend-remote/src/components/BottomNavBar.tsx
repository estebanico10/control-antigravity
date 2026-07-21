import React from 'react';
import { Zap, Camera, FileText, MessageSquare, Settings } from 'lucide-react';

export type TabType = 'control' | 'screen' | 'plan' | 'prompts' | 'settings';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasPlan: boolean;
  isActionRequired: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  hasPlan,
  isActionRequired,
}) => {
  const tabs = [
    { id: 'control' as const, label: 'Control', icon: Zap, badge: isActionRequired },
    { id: 'screen' as const, label: 'Pantalla', icon: Camera },
    { id: 'plan' as const, label: 'Plan', icon: FileText, badge: hasPlan },
    { id: 'prompts' as const, label: 'Prompts', icon: MessageSquare },
    { id: 'settings' as const, label: 'Config', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/90 backdrop-blur-lg border-t border-indigo-500/20 p-2 max-w-4xl mx-auto md:rounded-t-3xl shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((t) => {
          const IconComponent = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition relative ${
                isActive
                  ? 'text-indigo-400 bg-indigo-500/15 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.badge && (
                <span className="absolute top-1 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
