import { useState, useCallback } from 'react';
import { NavigationContext } from './context/NavigationContext';
import type { ScreenName, NavParams, StackEntry } from './types';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import AIAnalysisScreen from './screens/AIAnalysisScreen';
import PrescriptionReviewScreen from './screens/PrescriptionReviewScreen';
import RegistrationCompleteScreen from './screens/RegistrationCompleteScreen';
import IntegratedManagementScreen from './screens/IntegratedManagementScreen';
import SafetyDetailScreen from './screens/SafetyDetailScreen';
import SafetyPreviewScreen from './screens/SafetyPreviewScreen';
import PrescriptionDetailScreen from './screens/PrescriptionDetailScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import MedicationSearchScreen from './screens/MedicationSearchScreen';
import PillAppearanceSearchScreen from './screens/PillAppearanceSearchScreen';
import { PillResultsRoute, PillDetailRoute } from './features/pill-search/screens/PillSearchRoutes';
import ChatbotScreen from './screens/ChatbotScreen';
import SupplementManagementScreen from './screens/SupplementManagementScreen';
import PrescriptionEditScreen from './screens/PrescriptionEditScreen';

function Screen({ entry, dir }: { entry: StackEntry; dir: 'forward' | 'back' }) {
  const cls = dir === 'forward' ? 'screen-forward' : 'screen-back';
  const inner = (() => {
    switch (entry.screen) {
      case 'home':                    return <HomeScreen />;
      case 'camera':                  return <CameraScreen />;
      case 'ai-analysis':             return <AIAnalysisScreen />;
      case 'prescription-review':     return <PrescriptionReviewScreen />;
      case 'registration-complete':   return <RegistrationCompleteScreen />;
      case 'integrated-management':   return <IntegratedManagementScreen />;
      case 'safety-detail':           return <SafetyDetailScreen />;
      case 'safety-preview':          return <SafetyPreviewScreen />;
      case 'prescription-detail':     return <PrescriptionDetailScreen />;
      case 'medication-detail':       return <MedicationDetailScreen />;
      case 'medication-search':       return <MedicationSearchScreen />;
      case 'pill-appearance-search':  return <PillAppearanceSearchScreen />;
      case 'pill-search-results':     return <PillResultsRoute />;
      case 'pill-search-detail':      return <PillDetailRoute />;
      case 'chatbot':                 return <ChatbotScreen />;
      case 'supplement-management':   return <SupplementManagementScreen />;
      case 'prescription-edit':       return <PrescriptionEditScreen />;
      default:                        return <HomeScreen />;
    }
  })();
  return (
    <div className={`h-full ${cls}`}>
      {inner}
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [stack, setStack] = useState<StackEntry[]>([{ screen: 'home' }]);
  const [dir,   setDir]   = useState<'forward' | 'back'>('forward');
  const [tick,  setTick]  = useState(0);

  const current = stack[stack.length - 1];

  const navigate = useCallback((screen: ScreenName, params?: NavParams) => {
    setDir('forward');
    setStack(prev => [...prev, { screen, params: screen === 'pill-appearance-search' ? (params ?? {}) : params }]);
    setTick(t => t + 1);
  }, []);

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setDir('back');
      setStack(prev => prev.slice(0, -1));
      setTick(t => t + 1);
    }
  }, [stack.length]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D4E4DB]">
      <div className="relative w-full max-w-[430px] h-screen max-h-[932px] bg-white overflow-hidden shadow-2xl">
        {!splashDone ? (
          <SplashScreen onDone={() => setSplashDone(true)} />
        ) : (
          <NavigationContext.Provider value={{ navigate, goBack, params: current.params ?? {} }}>
            <Screen key={tick} entry={current} dir={dir} />
          </NavigationContext.Provider>
        )}
      </div>
    </div>
  );
}
