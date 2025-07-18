import { createContext } from 'react';
import { FinanceContextType } from './FinanceTypes';

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);