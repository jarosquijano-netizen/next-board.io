export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'dark';
              // Tailwind only needs 'dark' class
              // For LIGHT: remove 'dark' class
              // For DARK: add 'dark' class
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              document.documentElement.style.colorScheme = theme;
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}

