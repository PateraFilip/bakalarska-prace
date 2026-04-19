document.addEventListener("DOMContentLoaded", () => {
    let currentPath = window.location.pathname.split('/').pop();

    if (currentPath === '') currentPath = 'index.html';

    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');

        if (link.classList.contains('text-xl')) return;

        if (href === currentPath) {
            link.className = "text-white border-b-2 border-blue-500 transition-colors";
        } else {
            link.className = "text-gray-400 hover:text-white transition-colors";
        }
    });
});