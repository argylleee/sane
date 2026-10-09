import { useEffect, useState } from 'react';
import { Dropdown } from '@heroui/react';
import { Info, Menu, Scan, X } from 'lucide-react';
import type { copyFor } from './copy';

export function MobileNavigation({
  screen,
  onNavigate,
  copy,
}: {
  screen: string;
  onNavigate: (screen: 'scan' | 'learn') => void;
  copy: ReturnType<typeof copyFor>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 640px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <div className="sm:hidden">
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <Dropdown.Trigger
          className="mobile-nav-trigger"
          aria-label={isOpen ? copy.closeNavigation : copy.openNavigation}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </Dropdown.Trigger>
        <Dropdown.Popover
          placement="bottom end"
          offset={12}
          className="mobile-nav-popover clay-panel"
        >
          <span id="mobile-navigation-label" className="sr-only">
            {copy.mainNavigationLabel}
          </span>
          <Dropdown.Menu aria-labelledby="mobile-navigation-label" className="mobile-nav-menu">
            {(['scan', 'learn'] as const).map((destination) => {
              const isSelected =
                screen === destination || (destination === 'scan' && screen === 'result');
              const Icon = destination === 'scan' ? Scan : Info;
              const label = destination === 'scan' ? copy.navigationScan : copy.navigationLearn;
              return (
                <Dropdown.Item
                  key={destination}
                  id={destination}
                  textValue={label}
                  aria-current={isSelected ? 'page' : undefined}
                  className={`mobile-nav-item ${isSelected ? 'is-current' : ''}`}
                  onAction={() => {
                    setIsOpen(false);
                    onNavigate(destination);
                  }}
                >
                  <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                  <span>{label}</span>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
