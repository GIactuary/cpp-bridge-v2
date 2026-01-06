# The CPP Bridge - Design System & UX Guide

This document defines the design language extracted from `index.html` to ensure consistency across all pages.

---

## 1. COLOR PALETTE

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| `nobel-gold` | `#C5A059` | Primary accent, CTAs, highlights, hover states |
| `nobel-dark` | `#1a1a1a` | Text, dark backgrounds, icons |
| `nobel-cream` | `#F9F8F4` | Page background |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Card backgrounds, button text on gold |
| Gray-100 | `#f3f4f6` | Borders, dividers |
| Gray-200 | `#e5e7eb` | Input borders, secondary borders |
| Gray-50 | `#f9fafb` | Subtle backgrounds, disabled states |

### Opacity Variants
- `nobel-gold/10` - Subtle gold backgrounds for badges/labels
- `nobel-gold/20` - Selection highlight
- `nobel-dark/60` - Secondary text
- `nobel-dark/40` - Tertiary text, labels
- `nobel-dark/30` - Muted text
- `white/80` - Semi-transparent white (nav background)

---

## 2. TYPOGRAPHY

### Font Families
```css
font-family-serif: 'Playfair Display', serif;  /* Headings, emphasis */
font-family-sans: 'Inter', sans-serif;          /* Body, UI elements */
```

### Heading Hierarchy
| Element | Classes | Example |
|---------|---------|---------|
| H1 (Hero) | `serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1]` | Main headlines |
| H2 (Section) | `serif text-4xl sm:text-5xl font-bold` | Section titles |
| H3 (Card) | `serif text-2xl font-bold` | Card titles |
| H3 (Featured) | `serif text-3xl font-bold` | Featured card titles |

### Body Text
| Type | Classes |
|------|---------|
| Lead paragraph | `text-lg text-nobel-dark/70 leading-relaxed font-medium` |
| Body | `text-sm text-nobel-dark/60 leading-relaxed font-medium` |
| Small/Caption | `text-xs text-nobel-dark/40` |

### Labels & Tags
| Type | Classes |
|------|---------|
| Section label | `text-xs font-bold tracking-[0.2em] uppercase text-nobel-gold` |
| Badge text | `text-[10px] font-bold tracking-widest uppercase` |
| Nav link | `text-sm font-medium tracking-wide uppercase` |

### Key Typography Rules
1. **Serif for headings** - Always use Playfair Display
2. **Wide tracking on uppercase** - Use `tracking-[0.2em]` or `tracking-widest`
3. **Italics for emphasis** - Use `italic` class for key words
4. **Font weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## 3. SPACING SYSTEM

### Section Padding
- Sections: `py-32` (128px vertical)
- Container: `px-6 sm:px-8`
- Max width: `max-w-7xl mx-auto`

### Card Padding
- Standard cards: `p-10` or `p-10 lg:p-12`
- Compact cards: `p-6` or `p-8`

### Element Spacing
- Between heading and body: `mb-6` to `mb-8`
- Between sections: `mb-16` to `mb-20`
- Between form elements: `space-y-6`
- Grid gaps: `gap-10` to `gap-12`

---

## 4. COMPONENTS

### Buttons

#### Primary Button (Gold)
```html
<a class="gold-button inline-flex items-center justify-center px-10 py-5 text-sm font-bold tracking-widest uppercase rounded-sm shadow-lg shadow-nobel-gold/10">
    Button Text
    <svg class="w-4 h-4 ml-3">...</svg>
</a>
```
**CSS:**
```css
.gold-button {
    background-color: #C5A059;
    color: white;
    transition: all 0.3s ease;
}
.gold-button:hover {
    background-color: #b08d4a;
    transform: translateY(-1px);
}
```

#### Secondary Button (Outline)
```html
<a class="inline-flex items-center justify-center px-10 py-5 bg-white text-nobel-dark text-sm font-bold tracking-widest uppercase border border-gray-200 hover:border-nobel-gold transition-all rounded-sm">
    Button Text
</a>
```

#### Text Link Button
```html
<a class="text-nobel-dark text-[11px] font-bold tracking-widest uppercase border-b border-nobel-gold pb-1 hover:text-nobel-gold transition-colors">
    Link Text &rarr;
</a>
```

### Cards

#### Standard Card
```html
<div class="card p-10">
    <!-- Content -->
</div>
```
**CSS:**
```css
.card {
    background: white;
    border: 1px solid #e5e7eb;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
    border-color: #C5A059;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(197, 160, 89, 0.15);
}
```

#### Card with Icon
```html
<div class="card p-10 flex flex-col group">
    <div class="w-12 h-12 bg-nobel-dark flex items-center justify-center rounded-sm mb-8 group-hover:rotate-6 transition-transform">
        <svg class="w-6 h-6 text-nobel-gold">...</svg>
    </div>
    <h3 class="serif text-2xl font-bold text-nobel-dark mb-4">Title</h3>
    <p class="text-nobel-dark/60 mb-10 leading-relaxed font-medium">Description</p>
</div>
```

### Badges & Labels

#### Section Label
```html
<span class="text-xs font-bold tracking-[0.2em] uppercase text-nobel-gold mb-4 block">
    Label Text
</span>
```

#### Status Badge
```html
<div class="inline-flex items-center px-3 py-1 bg-nobel-gold/10 text-nobel-gold text-[10px] font-bold tracking-widest uppercase rounded-sm">
    Badge Text
</div>
```

#### Dark Badge
```html
<div class="px-2 py-0.5 bg-nobel-dark text-[9px] font-bold tracking-widest text-white uppercase rounded-sm">
    Badge Text
</div>
```

### Form Elements

#### Input Fields
```html
<input class="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-nobel-gold focus:border-nobel-gold outline-none transition-shadow font-medium">
```

#### Select Dropdown
```html
<select class="w-full p-3 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-nobel-gold outline-none font-medium">
```

#### Toggle/Switch
Use subtle styling with gold accent on checked state.

### Navigation

#### Desktop Nav
```html
<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-6 sm:px-8">
        <div class="flex items-center justify-between h-20">
            <!-- Logo + Nav items -->
        </div>
    </div>
</nav>
```

#### Nav Link Hover Effect
```css
.nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #C5A059;
    transition: width 0.3s ease;
}
.nav-link:hover::after {
    width: 100%;
}
```

---

## 5. ICONOGRAPHY

### Icon Containers
- Dark background: `w-10 h-10 bg-nobel-dark flex items-center justify-center rounded-sm`
- Light background: `w-20 h-20 bg-white flex items-center justify-center rounded-sm shadow-sm`

### Icon Colors
- On dark bg: `text-nobel-gold`
- On light bg: `text-nobel-dark`
- Muted: `text-gray-400`

### Icon Sizes
- Small: `w-4 h-4` or `w-5 h-5`
- Medium: `w-6 h-6`
- Large: `w-10 h-10`

---

## 6. EFFECTS & ANIMATIONS

### Hover Transitions
```css
transition: all 0.3s ease;           /* Standard */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);  /* Cards */
transition-transform duration-700;    /* Slow scale */
```

### Hover Transforms
- Buttons: `hover:translate-y-[-1px]` or `hover:scale-[1.02]`
- Cards: `hover:translate-y-[-4px]`
- Icons: `group-hover:rotate-6` or `group-hover:rotate-12`

### Shadows
| Type | Class |
|------|-------|
| Card shadow | `shadow-sm` → `shadow-md` on hover |
| Button shadow | `shadow-lg shadow-nobel-gold/10` |
| Elevated | `shadow-2xl` |

### Blur Effects
- Nav backdrop: `backdrop-blur-md`
- Decorative: `blur-3xl` on colored divs

### Decorative Elements
```html
<!-- Blur orbs -->
<div class="absolute -top-10 -right-10 w-40 h-40 bg-nobel-gold/10 blur-3xl rounded-full"></div>
<div class="absolute -bottom-10 -left-10 w-40 h-40 bg-nobel-dark/5 blur-3xl rounded-full"></div>
```

---

## 7. LAYOUT PATTERNS

### Container
```html
<div class="max-w-7xl mx-auto px-6 sm:px-8">
```

### Two-Column Layout (Hero)
```html
<div class="grid lg:grid-cols-12 gap-16 items-center">
    <div class="lg:col-span-7"><!-- Content --></div>
    <div class="lg:col-span-5"><!-- Visual --></div>
</div>
```

### Card Grid
```html
<div class="grid md:grid-cols-3 gap-10">
    <!-- Cards -->
</div>
```

### Split Panel (Calculator)
```html
<div class="flex flex-col md:flex-row">
    <div class="w-full md:w-2/5"><!-- Input Panel --></div>
    <div class="w-full md:w-3/5"><!-- Results Panel --></div>
</div>
```

---

## 8. BORDER RADIUS

| Usage | Class |
|-------|-------|
| Buttons, badges, inputs | `rounded-sm` (4px) |
| Cards, containers | `rounded-sm` to `rounded-2xl` |
| Pills/dots | `rounded-full` |

**Key Rule:** Prefer `rounded-sm` for a more refined, editorial look. Avoid overly rounded corners.

---

## 9. SCROLLBAR

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F9F8F4; }
::-webkit-scrollbar-thumb { background: #C5A059; border-radius: 10px; }
```

---

## 10. DARK MODE (Optional)

The landing page does NOT use dark mode. The calculator currently has dark mode but should be updated to match the light-only aesthetic of the landing page, OR dark mode should use:
- Background: `#1a1a1a`
- Card background: `#2a2a2a`
- Gold accent remains: `#C5A059`
- Text: white/white-opacity variants

---

## 11. RESPONSIVE BREAKPOINTS

| Breakpoint | Min Width |
|------------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

### Mobile Considerations
- Stack columns on mobile
- Reduce padding: `p-4 sm:p-6 md:p-8`
- Smaller text: `text-sm` → `text-xs` on mobile
- Full-width buttons on mobile

---

## 12. IMPLEMENTATION CHECKLIST FOR CALCULATOR

### Must Change:
- [ ] Replace indigo accent with `nobel-gold` (#C5A059)
- [ ] Add Playfair Display font for headings
- [ ] Update background from gray-100 to `nobel-cream` (#F9F8F4)
- [ ] Change rounded-3xl/rounded-2xl to rounded-sm
- [ ] Update button styles to match gold-button
- [ ] Add serif class to main heading
- [ ] Update tracking on labels to `tracking-[0.2em]`
- [ ] Match card styling (white bg, gray-200 border, gold hover)
- [ ] Update scrollbar color to gold
- [ ] Consider removing dark mode toggle OR keeping it subtle

### Nice to Have:
- [ ] Add subtle blur decorations
- [ ] Add hover transforms matching landing page
- [ ] Match shadow styles
