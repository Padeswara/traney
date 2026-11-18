import React from 'react';
import { Icon } from '@iconify/react';

const ICON_MAP = {
  wallet: 'lucide:wallet',
  landmark: 'lucide:landmark',
  banknote: 'lucide:banknote',
  smartphone: 'lucide:smartphone',
  piggy_bank: 'lucide:piggy-bank',
  credit_card: 'lucide:credit-card',
  plus: 'lucide:plus',
  minus: 'lucide:minus',
  arrow_up_right: 'lucide:arrow-up-right',
  arrow_down_left: 'lucide:arrow-down-left',
  arrow_left_right: 'lucide:arrow-left-right',
  eye: 'lucide:eye',
  eye_off: 'lucide:eye-off',
  sun: 'lucide:sun',
  moon: 'lucide:moon',
  user: 'lucide:user',
  search: 'lucide:search',
  trash: 'lucide:trash-2',
  edit: 'lucide:pencil',
  check: 'lucide:check',
  close: 'lucide:x',
  download: 'lucide:download',
  rotate_ccw: 'lucide:rotate-ccw',
  calendar: 'lucide:calendar',
  tag: 'lucide:tag',
  file_text: 'lucide:file-text',
  utensils: 'lucide:utensils',
  shopping_bag: 'lucide:shopping-bag',
  car: 'lucide:car',
  receipt: 'lucide:receipt',
  film: 'lucide:Gamepad2',
  gamepad: 'lucide:gamepad-2',
  heart_pulse: 'lucide:heart-pulse',
  briefcase: 'lucide:briefcase',
  trending_up: 'lucide:trending-up',
  sparkles: 'lucide:sparkles',
  more_horizontal: 'lucide:more-horizontal',
  chevron_down: 'lucide:chevron-down',
  Sliders: 'lucide:sliders-horizontal',
  sliders: 'lucide:sliders-horizontal',
  folder_open: 'lucide:folder-open',
  inbox: 'lucide:inbox',
};

export default function AppIcon({ name, className = '' }) {
  const iconId = ICON_MAP[name] || (name.includes(':') ? name : `lucide:${name}`);
  return <Icon icon={iconId} className={`inline-block shrink-0 ${className}`} />;
}
