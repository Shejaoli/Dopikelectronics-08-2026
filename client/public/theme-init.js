(() => {
  try {
    const savedTheme = localStorage.getItem("dopik-theme");
    // Light mode is the site default. Honor an explicit choice made with the
    // theme toggle, but do not inherit the operating system's dark mode.
    const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch {
    // Theme preference is optional; the app can still render without storage.
  }
})();
