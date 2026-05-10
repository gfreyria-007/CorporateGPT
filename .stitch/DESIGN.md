# CorporateGPT Design System

## 1. Brand Identity
- **App Name:** CorporateGPT
- **Tagline:** Enterprise Neural Intelligence
- **Primary Color:** #2563eb (Blue 600)
- **Background Light:** #f8fafc (Slate 50)
- **Background Dark:** #020817 (Corporate 950)
- **Accent:** #0f172a (Corporate secondary)

## 2. Typography
- **Display Font:** Space Grotesk (700-900 weight)
- **Body Font:** Inter (400-800 weight)
- **Mono Font:** JetBrains Mono
- **Style:** ALL CAPS labels, tight letter-spacing, black weights

## 3. Component Language
- **Border Radius:** Hyper-rounded — 2rem to 3.5rem for cards, 2rem for buttons, 1.5rem for inputs
- **Shadows:** Colored shadows matching button/card accent color at 20-30% opacity
- **Cards:** White bg (light), white/5 (dark), subtle border, heavy rounded corners
- **Buttons:** Solid filled CTA in #2563eb, uppercase tracking-widest text, pill or large-radius
- **Inputs:** Rounded pill inputs with icon prefix, large padding

## 4. Mobile Navigation Pattern
- **Bottom Nav:** 4 tabs — Chat, Images, GPTs, Menu
- **Active Tab Indicator:** Filled pill container under icon
- **Center CTA:** Floating elevated button for primary action (+GPT or Send)
- **Safe Area:** env(safe-area-inset-*) padding on all edges
- **Header:** 64px h, blur backdrop, logo left, user avatar right

## 5. Color Tokens
```
--blue-600: #2563eb       (primary action)
--blue-500: #3b82f6       (hover state)
--emerald-500: #10b981    (success / active)
--red-500: #ef4444        (danger / error)
--slate-400: #94a3b8      (secondary text)
--slate-50: #f8fafc       (page bg light)
--corporate-950: #020817  (page bg dark)
--white/5: rgba(255,255,255,0.05)  (dark card bg)
```

## 6. Design System Notes for Stitch Generation

**MOBILE FIRST — 390px wide (iPhone 14 Pro)**

Design language: **Corporate Neural** — Premium enterprise with a futuristic neural network aesthetic. Clean, bold, and secure-feeling.

Key patterns:
- Cards: `rounded-[2.5rem] border shadow-xl` — very round, elevated
- Headers: `h-16 backdrop-blur-xl border-b` with safe-area-top
- Bottom nav: `h-[68px] border-t backdrop-blur-xl` with safe-area-bottom
- Primary buttons: `bg-blue-600 text-white rounded-full py-4 font-black uppercase tracking-widest`
- Labels: `text-[10px] font-black uppercase tracking-widest text-slate-400`
- Stats: `text-5xl font-black tracking-tighter` with `text-2xl text-slate-400` for units
- Status badges: `px-3 py-1 rounded-full text-[9px] font-black uppercase border`
- All icons: Lucide, 20-22px for nav, 18px for actions
- Animations: Framer Motion spring transitions, opacity fade for page switches
- Haptic: On all interactive elements (vibrate API)
