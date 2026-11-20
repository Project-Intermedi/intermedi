import { createContext, useContext } from 'react';
import type { ScreenName, NavParams } from '../types';

interface NavContextType {
  navigate: (screen: ScreenName, params?: NavParams) => void;
  goBack: () => void;
  params: NavParams;
}

export const NavigationContext = createContext<NavContextType>({
  navigate: () => {},
  goBack: () => {},
  params: {},
});

export const useNav = () => useContext(NavigationContext);
