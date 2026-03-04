(() => {
  const body = document.body;
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) body.classList.add(savedTheme);

  toggleBtn.addEventListener("click", () => {
    const toDark = !body.classList.contains("dark-mode");

    body.classList.toggle("dark-mode", toDark);
    body.classList.toggle("light-mode", !toDark);

    localStorage.setItem("theme", toDark ? "dark-mode" : "light-mode");
  });
})();