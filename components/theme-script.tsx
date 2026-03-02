// Inline script that runs before React hydration to prevent theme flash (FOUC)
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('eximia-theme');
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        }
      } catch(e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
