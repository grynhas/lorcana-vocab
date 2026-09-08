/* Lorewords — cole dentro do seu tailwind.config.{js,ts}
   Requer tokens.css importado no CSS global (ex.: app/globals.css). */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          amber:    'var(--ink-amber)',
          ruby:     'var(--ink-ruby)',
          amethyst: 'var(--ink-amethyst)',
          sapphire: 'var(--ink-sapphire)',
          emerald:  'var(--ink-emerald)',
          steel:    'var(--ink-steel)',
        },
        bg:        'var(--bg)',
        surface:   'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        line:        'var(--line)',
        'line-strong': 'var(--line-strong)',
        text:        'var(--text)',
        'text-muted':'var(--text-muted)',
        'text-faint':'var(--text-faint)',
        brand:   'var(--brand)',
        accent:  'var(--accent)',
        success: 'var(--success)',
        danger:  'var(--danger)',
        magic:   'var(--magic)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        ui:      ['var(--font-ui)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)',
        xl: 'var(--r-xl)', full: 'var(--r-full)',
      },
      boxShadow: {
        1: 'var(--shadow-1)', 2: 'var(--shadow-2)', 3: 'var(--shadow-3)',
        glow: 'var(--glow-brand)',
      },
      backgroundImage: { inks: 'var(--gradient-inks)' },
      transitionTimingFunction: { brand: 'cubic-bezier(.2,.7,.3,1)' },
    },
  },
  darkMode: ['class', '[data-theme="dark"]'],
}
