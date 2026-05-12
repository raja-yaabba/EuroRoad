import React from 'react';
import { DataType } from '../../types';
import { useTranslation } from '../../utils/i18n';
import { Database, Calculator, AlertCircle } from 'lucide-react';

interface DataBadgeProps {
  type: DataType;
  lang?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ type, lang = 'fr' }) => {
  const { t } = useTranslation(lang as any);
  
  let styles = '';
  let Icon = Database;
  let label = '';

  switch (type) {
    case 'real':
      styles = 'bg-brand-green-light border-brand-green text-brand-green';
      Icon = Database;
      label = t('realData');
      break;
    case 'calculated':
      styles = 'bg-brand-blue-light border-brand-blue text-brand-blue';
      Icon = Calculator;
      label = t('calculatedData');
      break;
    case 'unavailable':
      styles = 'bg-gray-100 border-gray-400 text-gray-500';
      Icon = AlertCircle;
      label = t('unavailableData');
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-opacity-30 text-[10px] font-bold uppercase tracking-wide shrink-0 shadow-sm ${styles}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};