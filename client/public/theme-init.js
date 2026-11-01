(() => {
  try {
    const savedTheme = localStorage.getItem("dopik-theme");
    const theme = savedTheme || (
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    // Theme preference is optional; the app can still render without storage.
  }
})();
