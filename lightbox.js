(() => {
    const SELECTORS = [
        '.gallery-images img',
        '.gallery-row-2 img',
        '.gallery-row-3 img',
        '.about-photo',
        '.digitals-strip-img',
        '.digitals-grid img',
        '.fashion-grid img',
        '.beauty-grid img'
    ].join(', ');

    let overlay, contentImg, canvas;
    let scale = 1, tx = 0, ty = 0;
    let isPanning = false, startX = 0, startY = 0;

    function build() {
        overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <div class="lightbox-canvas">
                <img class="lightbox-img" alt="">
            </div>
            <div class="lightbox-hint">Колёсико — зум, двойной клик — приблизить, перетаскивание — двигать</div>
        `;
        document.body.appendChild(overlay);
        contentImg = overlay.querySelector('.lightbox-img');
        canvas = overlay.querySelector('.lightbox-canvas');

        overlay.addEventListener('click', e => {
            if (e.target === overlay || e.target === canvas) close();
        });
        overlay.querySelector('.lightbox-close').addEventListener('click', close);

        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.2;
            const newScale = Math.max(1, Math.min(6, scale + delta));
            if (newScale === 1) { tx = 0; ty = 0; }
            scale = newScale;
            apply();
        }, { passive: false });

        contentImg.addEventListener('mousedown', e => {
            if (scale <= 1) return;
            isPanning = true;
            startX = e.clientX - tx;
            startY = e.clientY - ty;
            contentImg.style.cursor = 'grabbing';
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!isPanning) return;
            tx = e.clientX - startX;
            ty = e.clientY - startY;
            apply();
        });
        document.addEventListener('mouseup', () => {
            if (!isPanning) return;
            isPanning = false;
            contentImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        });

        contentImg.addEventListener('dblclick', () => {
            if (scale > 1) { scale = 1; tx = 0; ty = 0; }
            else { scale = 2.2; }
            apply();
        });

        document.addEventListener('keydown', e => {
            if (!overlay.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            if (e.key === '+' || e.key === '=') { scale = Math.min(6, scale + 0.3); apply(); }
            if (e.key === '-' || e.key === '_') {
                scale = Math.max(1, scale - 0.3);
                if (scale === 1) { tx = 0; ty = 0; }
                apply();
            }
            if (e.key === '0') { scale = 1; tx = 0; ty = 0; apply(); }
        });
    }

    function apply() {
        contentImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        contentImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    }

    function open(src, alt) {
        if (!overlay) build();
        contentImg.src = src;
        contentImg.alt = alt || '';
        scale = 1; tx = 0; ty = 0;
        apply();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function init() {
        document.querySelectorAll(SELECTORS).forEach(img => {
            img.classList.add('zoomable');
            img.addEventListener('click', () => open(img.src, img.alt));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
