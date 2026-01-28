# OmniHR Design System Implementation Guide

## Overview
This document outlines the complete redesign of the Lifeline HR application to match OmniHR's professional, clean design aesthetic while preserving all existing functionality.

## Design System Update Summary

### ✅ Completed Core Changes

#### 1. Color Palette Migration
- **From**: Emerald green (`#10b981`) WorkPay style
- **To**: Deep Indigo/Blue (`#6366f1`, `#4f46e5`) OmniHR style
- **Files Updated**:
  - `frontend/src/index.css` - Updated CSS variables
  - `frontend/tailwind.config.js` - Updated Tailwind theme
  - Created `frontend/src/styles/design-system.css` - New comprehensive design system

#### 2. Typography
- **From**: Plus Jakarta Sans
- **To**: Inter (Google Fonts)
- **Changes**: Updated font imports and family references across base styles

#### 3. Design Principles Applied
Following OmniHR's aesthetic:
- Clean, minimal design with generous whitespace
- Soft shadows instead of harsh borders
- Professional gray backgrounds (`#F9FAFB`)
- White cards with subtle elevation
- Indigo accent for primary actions and active states
- Medium font weights (500-600) for UI elements

### 📋 Component-Level Redesign Strategy

## Phase 1: Core Layout Components (Priority: CRITICAL)

### 1.1 DashboardLayout.jsx
**Current State**: Mixed design with emerald accents
**Target State**: Clean OmniHR layout with:
- White sidebar background
- Indigo active nav states (`bg-primary-50`, `text-primary-700`)
- Subtle borders (`border-gray-200`)
- Gray-50 main content background

**Code Pattern**:
```jsx
// BEFORE (Emerald/WorkPay):
className="bg-emerald-600 text-white"

// AFTER (Indigo/OmniHR):
className="bg-primary-600 hover:bg-primary-700 text-white"
```

### 1.2 Sidebar Navigation
**Key Changes**:
- Remove heavy borders
- Use `hover:bg-gray-50` for interaction
- Active state: `bg-primary-50 text-primary-700`
- Icon colors: `text-gray-500` default, `text-primary-600` active

### 1.3 Header/TopBar
**Key Changes**:
- White background
- `border-b border-gray-200`
- Search bar with subtle gray border
- Profile dropdown with clean shadows

## Phase 2: Form Components (Priority: HIGH)

### 2.1 Input Fields
**Standard Input**:
```jsx
<input
  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
             focus:border-primary-500 focus:ring-2 focus:ring-primary-50 
             transition-all outline-none"
/>
```

### 2.2 Buttons
**Primary Button**:
```jsx
<button className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white 
                   rounded-lg font-medium text-sm transition-colors">
  Action
</button>
```

**Secondary Button**:
```jsx
<button className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 
                   text-gray-700 rounded-lg font-medium text-sm transition-colors">
  Cancel
</button>
```

### 2.3 Select/Dropdown
```jsx
<select className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                   focus:border-primary-500 focus:ring-2 focus:ring-primary-50 
                   bg-white transition-all outline-none">
  <option>Option</option>
</select>
```

## Phase 3: Data Display Components (Priority: HIGH)

### 3.1 Cards
**Standard Card**:
```jsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm 
                hover:shadow-md transition-all p-6">
  {/* Content */}
</div>
```

### 3.2 Tables
**OmniHR Table Style**:
```jsx
<table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 
                     uppercase tracking-wider">
        Header
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">Data</td>
    </tr>
  </tbody>
</table>
```

### 3.3 Badges/Status Indicators
```jsx
// Success Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                 font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
  Approved
</span>

// Warning Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                 font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
  Pending
</span>

// Primary/Info Badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                 font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-600/20">
  Active
</span>
```

## Phase 4: Page-Specific Components

### 4.1 Dashboard Page
**Updates Needed**:
- Stat cards: White background, left border accent
- Charts: Softer colors, gridlines in gray-200
- Quick actions: Primary button styling
- Recent activity feed: Gray-50 background items

### 4.2 Employee List Page
**Updates Needed**:
- Filter/search bar: Gray border, white background
- Table: OmniHR table styling
- Add Employee button: Primary indigo
- Avatar placeholders: Gray-200 background

### 4.3 Forms (Employee, Department, etc.)
**Updates Needed**:
- All inputs: Gray-300 borders
- Labels: Gray-700, font-medium
- Section dividers: Gray-200
- Save buttons: Primary indigo
- Cancel buttons: Gray outline

### 4.4 Attendance Page
**Current**: Has dark "tactical" theme
**Target**: Clean professional theme
- Remove dark backgrounds
- Use white cards
- Indigo accents for clock in/out
- Table with gray alternating rows

### 4.5 Overtime Page
**Current**: Heavy tactical/military aesthetic
**Target**: Clean professional
- White dialog backgrounds
- Indigo primary buttons
- Gray borders
- Simplified card designs

## Phase 5: Specialized Components

### 5.1 Modals/Dialogs
```jsx
<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm">
  <div className="bg-white rounded-xl shadow-2xl max-w-2xl mx-auto my-20 p-0 
                  border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Title</h3>
    </div>
    <div className="p-6">
      {/* Content */}
    </div>
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
      <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
        Cancel
      </button>
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### 5.2 Dropdowns/Menus
```jsx
<div className="absolute mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-200 
                py-1">
  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
    Menu Item
  </button>
</div>
```

## Implementation Checklist

### Core Files (Do First):
- [x] `frontend/src/index.css` - Base styles
- [x] `frontend/tailwind.config.js` - Tailwind config
- [x] `frontend/src/styles/design-system.css` - Design system
- [ ] `frontend/src/layouts/DashboardLayout.jsx` - Main layout
- [ ] `frontend/src/layouts/EmployeePortalLayout.jsx` - Employee layout
- [ ] `frontend/src/components/ui/Button.jsx` - Button component
- [ ] `frontend/src/components/ui/Input.jsx` - Input component
- [ ] `frontend/src/components/ui/Card.jsx` - Card component

### Feature Pages (Do Second):
- [ ] `frontend/src/features/dashboard/DashboardPage.jsx`
- [ ] `frontend/src/features/employees/EmployeeListPage.jsx`
- [ ] `frontend/src/features/employees/EmployeeFormPage.jsx`
- [ ] `frontend/src/features/auth/LoginPage.jsx`
- [ ] `frontend/src/features/attendance/AttendancePage.jsx`
- [ ] `frontend/src/features/leave/LeaveRequestsPage.jsx`
- [ ] `frontend/src/features/payroll/PayrollIndex.jsx`
- [ ] `frontend/src/features/performance/PerformancePage.jsx`

### Specialized Pages (Do Third):
- [ ] All remaining feature pages
- [ ] Forms and wizards
- [ ] Admin/settings pages
- [ ] Report/analytics pages

## Quick Reference: Color Mapping

### Primary Actions
- **Old**: `bg-emerald-600` → **New**: `bg-primary-600` (indigo)
- **Old**: `text-emerald-600` → **New**: `text-primary-600`
- **Old**: `border-emerald-600` → **New**: `border-primary-600`

### Backgrounds
- **Main**: `bg-gray-50` (very light gray)
- **Cards**: `bg-white`
- **Hover**: `hover:bg-gray-50`
- **Active Nav**: `bg-primary-50` (very light indigo)

### Text
- **Headings**: `text-gray-900` (almost black)
- **Body**: `text-gray-700`
- **Muted**: `text-gray-500`
- **Labels**: `text-gray-600`

### Borders
- **Default**: `border-gray-200`
- **Focus**: `border-primary-500`
- **Dividers**: `border-gray-100`

## Design Standards

### Spacing
- **Page padding**: `p-6` or `p-8`
- **Card padding**: `p-6`
- **Button padding**: `px-4 py-2.5`
- **Input padding**: `px-4 py-2.5`
- **Section gaps**: `space-y-6` or `gap-6`

### Border Radius
- **Small**: `rounded-lg` (8px)
- **Medium**: `rounded-xl` (12px)
- **Large**: `rounded-2xl` (16px)
- **Pills**: `rounded-full`

### Shadows
- **Subtle**: `shadow-sm`
- **Default**: `shadow-md`
- **Elevated**: `shadow-lg`
- **Maximum**: `shadow-xl` or `shadow-2xl`

### Font Weights
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

## Next Steps

1. **Review this guide** to understand the design direction
2. **Update layout components first** - This gives immediate visual impact
3. **Systematically update each page** following the patterns above
4. **Test as you go** to ensure functionality is preserved
5. **Remove dark mode variations** for now (focus on light theme matching OmniHR)

## Notes
- All functionality must be preserved
- Only visual styling should change
- Use the provided class patterns for consistency
- Test each component after updating
- The `@tailwind` and `@apply` lint warnings are expected and safe to ignore
