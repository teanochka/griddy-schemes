# Enhanced Properties Panel - Figma-Style UI

## ✨ Overview

The ContextMenu component has been completely redesigned into a comprehensive Figma-style properties panel with categorized sections and professional UI controls.

## 🎨 New Features

### 1. **Position & Size**
- X, Y coordinates
- Width, Height
- Number inputs with min/max validation

### 2. **Fill (Заливка)**
- Color picker with hex input
- Opacity slider (0-100%)

### 3. **Stroke (Обводка)**
- Border color picker
- Border width slider (0-20px)
- Border radius slider (0-100px)

### 4. **Typography (Текст)**
- Font size slider (8-72px)
- Text color picker
- Font weight slider (100-900)
- Text alignment buttons (left, center, right)
- Only shown for nodes with text content

### 5. **Shadow Effects (Тень)**
- Toggle switch to enable/disable shadow
- Shadow color picker (with alpha support)
- Blur amount slider (0-50px)
- X/Y offset sliders (-50 to +50px)
- Defaults: blur 10px, offsetY 5px, rgba black with alpha

## 🏗️ Architecture

### Updated Type Definitions

```typescript
interface Node {
  // Fill & Stroke
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  
  // Typography
  textAlign?: 'left' | 'center' | 'right'
  fontSize?: number
  textColor?: string
  fontWeight?: number
  
  // Effects
  opacity?: number // 0-100
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}
```

### Reusable Sub-Components

1. **PropertySection** - Category container with title
2. **PropertyInput** - Numeric input with label
3. **PropertySlider** - Range slider with value display
4. **PropertyColorPicker** - Color picker + hex input
5. **PropertyButtonGroup** - Icon button group (alignment, etc.)

## 🎯 UI/UX Design

### Visual Hierarchy
- **Fixed position** on the right side
- **Scrollable content** for long property lists
- **Categorized sections** with clear separators
- **Consistent spacing** (Tailwind spacing scale)

### Color Scheme
- Gray 50-800 for backgrounds and text
- Blue 500-600 for active states
- Subtle borders (gray-200, gray-300)

### Interactions
- **Click-through prevention** with `@mousedown.stop`
- **Live updates** on every input change
- **Visual feedback** on hover/focus/active states
- **Toggle switch** for shadow enable/disable

## 🔧 Integration

### CanvasNode Enhancements

```vue
<!-- Dynamic styling applied -->
<div :style="{
  opacity: node.opacity / 100,
  boxShadow: computedShadow,
  borderColor: node.borderColor,
  borderWidth: `${node.borderWidth}px`,
  borderRadius: `${node.borderRadius}px`
}">
```

### BasicCard Enhancements

```vue
<!-- Typography applied -->
<input :style="{
  fontSize: `${node.fontSize}px`,
  color: node.textColor,
  fontWeight: node.fontWeight
}">
```

## 📊 Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **Layout** | Horizontal inline toolbar | Vertical fixed panel |
| **Properties** | 5 (fill, w, h, align) | 18+ comprehensive |
| **Categories** | None | 5 organized sections |
| **Shadow** | ❌ Not supported | ✅ Full control |
| **Border** | ❌ Not supported | ✅ Color, width, radius |
| **Typography** | Basic align only | ✅ Size, color, weight |
| **UI Controls** | Basic inputs | Sliders, pickers, toggles |

## 🚀 Usage Example

```typescript
// In workspace/[id].vue
<ContextMenu
  v-if="selectedNode"
  :node="selectedNode"
  @update:node="syncCards"
/>
```

The panel automatically:
- Shows/hides based on selection
- Updates node properties reactively
- Emits update events for sync
- Adapts UI (e.g., hides Typography for shapes)

## 🎨 Figma Parity

Our implementation matches Figma's design panel:
- ✅ Vertical list layout
- ✅ Categorized sections
- ✅ Collapsible categories (can be added)
- ✅ Range sliders with value display
- ✅ Color picker with hex input
- ✅ Toggle switches
- ✅ Icon button groups
- ✅ Consistent spacing and typography

## 🔮 Future Enhancements

- [ ] Collapsible section headers
- [ ] Multi-node editing (when multiple selected)
- [ ] Blend modes (multiply, overlay, etc.)
- [ ] Gradient fills
- [ ] Multiple shadows (layer list)
- [ ] Transform controls (rotation, skew)
- [ ] Corner radius per-corner
- [ ] Stroke alignment (inside, center, outside)

## 📝 Notes

- All properties are **optional** and backward compatible
- Shadow is **disabled by default** (toggle to enable)
- Typography section **auto-hides** for non-text nodes
- Values are **validated** (min/max constraints)
- Updates trigger **immediate sync** to backend
