# 🚀 START HERE - Lovable.dev Instructions

## ⚠️ MOST IMPORTANT RULE

**DO NOT USE TAILWIND CSS!**

This project uses **Bootstrap 5 + React Bootstrap**.

Your job: **Enhance the visual design, NOT change the tech stack.**

---

## 📚 Read These Files in Order:

### 1. **LOVABLE_INSTRUCTIONS.md** ⭐ MUST READ
   - Critical rules and guidelines
   - What to do and what NOT to do
   - Code examples
   - Enhancement patterns

### 2. **FOR_LOVABLE_AI.md** 📖 Complete Guide
   - Full project overview
   - Design system details
   - All features explained

### 3. **DESIGN_QUICK_REFERENCE.md** ⚡ Quick Lookup
   - Design tokens
   - Common patterns
   - Quick reference

---

## 🎯 Your Mission

Enhance ShareHub 2.0's visual design while keeping Bootstrap.

### What You'll Do:
- ✨ Add better gradients and shadows
- 🎨 Improve color usage
- 🎭 Add smooth animations
- 📱 Enhance mobile experience
- 🖼️ Add empty state illustrations
- 💡 Improve UX patterns

### What You WON'T Do:
- ❌ Install Tailwind CSS
- ❌ Remove Bootstrap
- ❌ Rewrite components
- ❌ Change file structure
- ❌ Break existing features

---

## 🛠 Tech Stack (DO NOT CHANGE)

```
React 18.2.0
Bootstrap 5.3.8
React Bootstrap 2.10.10
Bootstrap Icons 1.13.1
Vite 5.0.8
```

---

## 🎨 Design System

**Primary Color**: Emerald Green (#10b981)
**Style**: Modern, clean, card-based
**Framework**: Bootstrap (NOT Tailwind)

---

## 📁 Key Files

### Enhance These:
- `src/styles/custom.css` - Add better styles here
- `src/pages/*.jsx` - Improve page layouts
- `src/components/**/*.css` - Enhance component styles

### Don't Touch:
- `src/api/*` - API clients
- `src/contexts/*` - React contexts
- `src/hooks/*` - Custom hooks
- `package.json` - Dependencies

---

## 🎯 Priority Pages

1. **Home.jsx** - Landing page
2. **Products.jsx** - Product listing
3. **ProductDetail.jsx** - Product details
4. **SignIn.jsx / SignUp.jsx** - Auth pages
5. Dashboards (Seller, Buyer, Admin, NGO)

---

## 💡 Quick Example

### ✅ CORRECT (Bootstrap Enhancement):
```jsx
<Card className="border-0 shadow-lg hover-lift rounded-3">
  <Card.Body className="p-4">
    <h5 className="fw-bold">Title</h5>
    <Button variant="primary" size="lg">
      <i className="bi bi-cart-plus me-2"></i>
      Add to Cart
    </Button>
  </Card.Body>
</Card>
```

### ❌ WRONG (Tailwind):
```jsx
<div className="rounded-lg shadow-lg p-4 hover:scale-105">
  <h5 className="font-bold">Title</h5>
  <button className="bg-blue-500 px-4 py-2">
    Add to Cart
  </button>
</div>
```

---

## 🚀 How to Test

```bash
cd ShareHub2.0/frontend
npm run dev
```

Visit: http://localhost:3000/

Test Credentials:
- Admin: admin@marketplace.com / admin123
- Buyer: buyer1@example.com / buyer123
- Seller: seller1@example.com / seller123

---

## ✅ Success Checklist

- [ ] Read LOVABLE_INSTRUCTIONS.md
- [ ] Understand current Bootstrap setup
- [ ] NO Tailwind CSS installed
- [ ] Enhanced visual design
- [ ] All features still work
- [ ] Mobile responsive
- [ ] Smooth animations added

---

## 📞 Need Help?

1. Read **LOVABLE_INSTRUCTIONS.md** for detailed rules
2. Check **FOR_LOVABLE_AI.md** for complete guide
3. Reference **COMPONENT_EXAMPLES.md** for code patterns

---

## 🎨 Remember

**ENHANCE, DON'T REPLACE**

Keep Bootstrap. Make it beautiful. ✨

---

**Now read LOVABLE_INSTRUCTIONS.md for detailed guidelines!** 📚
