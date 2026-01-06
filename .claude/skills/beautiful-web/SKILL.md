---
name: beautiful-web
description: Apply lightweight, interactive, beautiful web design with GSAP animations, micro-interactions, and modern CSS. Use when building UI, adding animations, or improving visual design. Avoids generic AI-slop aesthetics.
---

# Beautiful Web Design

Apply lightweight, interactive, beautiful web design principles.

## Animation Libraries

### GSAP (GreenSock) - Complex Animations
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

```javascript
// Fade in on scroll
gsap.registerPlugin(ScrollTrigger);

gsap.from(".card", {
  scrollTrigger: ".card",
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2
});

// Smooth number counter
gsap.to("#score", {
  textContent: 85,
  duration: 2,
  snap: { textContent: 1 },
  ease: "power2.out"
});
```

### Animate.css - Simple Pre-built (~4KB)
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
<div class="animate__animated animate__fadeInUp">Content</div>
```

### CSS-Only Micro-interactions
```css
/* Subtle hover lift */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/* Button press effect */
.btn:active { transform: scale(0.97); }

/* Smooth focus rings */
.input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}
```

## Design Principles (2025)

**DO:**
- Intentional motion - Every animation serves a purpose
- Micro-interactions - Subtle feedback on hover, click, focus
- Scroll-triggered reveals - Content animates as user scrolls
- Staggered animations - Elements animate in sequence
- Only animate `transform` and `opacity` (GPU accelerated)

**DON'T:**
- Flashy/gratuitous animations
- Everything animating at once
- Slow animations (keep under 0.5s for micro-interactions)
- Generic stock imagery/icons

## Quick Recipes

### Fade-in Cards on Scroll
```javascript
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 85%" },
    opacity: 0, y: 30, duration: 0.6, delay: i * 0.1
  });
});
```

### Smooth Score Counter
```javascript
gsap.to("#score-number", {
  textContent: targetScore,
  duration: 1.5,
  ease: "power2.out",
  snap: { textContent: 1 }
});
```

### Magnetic Button Effect
```javascript
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
});
btn.addEventListener('mouseleave', () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.3 });
});
```

## Performance

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
