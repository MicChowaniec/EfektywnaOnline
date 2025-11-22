// tiles-lazy.js - animacja lazy loading kafelków

document.addEventListener('DOMContentLoaded', function() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    if (!('IntersectionObserver' in window)) {
        tiles.forEach((tile, i) => setTimeout(() => tile.classList.add('visible'), i * 500));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tile = entry.target;
                setTimeout(() => {
                    tile.classList.add('visible');
                }, Array.from(tiles).indexOf(tile) * 500);
                observer.unobserve(tile);
            }
        });
    }, { threshold: 0.1 });
    tiles.forEach(tile => observer.observe(tile));
});
