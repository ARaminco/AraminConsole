'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/dashboard', label: 'Reports', icon: 'chart-column' },
];

export default function Shell({ children }) {
  const pathname = usePathname();

  // Load the framework once, in the browser. Its MutationObserver starts every data-ac
  // component that React renders, including pages mounted later on client navigation.
  useEffect(() => {
    import(/* webpackIgnore: true */ "/aramin/aramin-console.min.js");
  }, []);

  // Safety net: re-scan after a route change (AC.scan is idempotent per element).
  useEffect(() => {
    window.AC?.scan?.(document.getElementById('ac-content') ?? document.body);
    window.AC?.rail?.close?.();
  }, [pathname]);

  return (
    <div className="ac-shell">
      <header className="ac-appbar" data-ac="appbar" data-collapsed="true">
        <div className="ac-appbar__inner">
          <div className="ac-appbar__start">
            <Link className="ac-chrome ac-brand" href="/"><span className="ac-brand__name">My Panel</span></Link>
          </div>
        </div>
      </header>

      <aside className="ac-rail" id="ac-rail" data-ac="rail" aria-label="All pages">
        <div className="ac-rail__head">
          <div className="ac-rail__heading"><span className="ac-rail__heading-text">My Panel</span></div>
          <button className="ac-rail__close" type="button" data-ac-rail-close aria-label="Close">
            <svg className="ac-icon" aria-hidden="true"><use href="#i-x" /></svg>
          </button>
        </div>
        <nav className="ac-rail__nav">
          <div className="ac-rail__group" data-group="main">
            {NAV.map((n) => (
              <Link key={n.href} className="ac-rail__link" href={n.href} aria-current={pathname === n.href ? 'page' : undefined}>
                <svg className="ac-icon" aria-hidden="true"><use href={`#i-${n.icon}`} /></svg>
                <span className="ac-rail__text">{n.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="ac-rail__foot">
          <a className="ac-powered ac-hide-mobile" href="https://air.co.ir/" target="_blank" rel="noopener">Powered by AIR</a>
        </div>
      </aside>
      <div className="ac-scrim" data-ac-rail-close aria-hidden="true" />

      <div className="ac-main">
        <main className="ac-content" id="ac-content" tabIndex={-1}>{children}</main>
        <a className="ac-powered" href="https://air.co.ir/" target="_blank" rel="noopener">Powered by AIR</a>
      </div>

      <nav className="ac-tabbar" data-ac="tabbar" aria-label="Tabs">
        {NAV.map((n) => (
          <Link key={n.href} className="ac-tabbar__item" href={n.href}>
            <span className="ac-tabbar__icon"><svg className="ac-icon" aria-hidden="true"><use href={`#i-${n.icon}`} /></svg></span>
            <span className="ac-tabbar__label">{n.label}</span>
          </Link>
        ))}
        <button className="ac-tabbar__item" type="button" data-ac-rail-open aria-controls="ac-rail">
          <span className="ac-tabbar__icon"><svg className="ac-icon" aria-hidden="true"><use href="#i-layout-grid" /></svg></span>
          <span className="ac-tabbar__label">More</span>
        </button>
      </nav>
      <div className="ac-toasts" id="ac-toasts" aria-live="polite" />
    </div>
  );
}
