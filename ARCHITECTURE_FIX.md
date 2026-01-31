# 🔧 Architecture Fix: Component-Level Styling

## Problem Identified

The initial implementation applied styling properties (shadow, border, background) to the `CanvasNode` wrapper component. This approach had a critical flaw:

### Why It Failed for Shapes

**Cards (BasicCard):**
- ✅ Worked fine - cards are simple `<div>` elements
- ✅ Box shadow on wrapper affected the card correctly
- ✅ Border and background applied properly

**Shapes (SVG-based):**
- ❌ **Shadow on wrapper** - didn't affect SVG content inside
- ❌ **Border on wrapper** - created a box around shape, not on shape itself
- ❌ **Background on wrapper** - showed behind SVG, not as shape fill
- ❌ **Border radius** - rounded the container, not the shape

### Visual Example

```
Before (WRONG):
┌─────────────────┐ ← CanvasNode wrapper with shadow/border
│                 │
│   ⭐ SVG       │ ← Shape inside (no shadow/border)
│                 │
└─────────────────┘

After (CORRECT):
┌─────────────────┐ ← CanvasNode wrapper (position only)
│                 │
│   ⭐ with       │ ← Shape has its own shadow/border
│   shadow        │
└─────────────────┘
```

## Solution: Component-Level Styling

Each node component now handles its own styling internally:

### Architecture Pattern

**CanvasNode (Wrapper)**
- **Role**: Positioning, selection, drag/drop, resize
- **Applies**: Only `left`, `top`, `width`, `height`, `opacity`
- **Does NOT apply**: Shadow, border, background, radius

**Individual Components (BasicCard, Shapes)**
- **Role**: Render content AND apply styling
- **Applies**: All visual properties (shadow, border, fill, etc.)
- **Method**: 
  - Cards use CSS `box-shadow`, `border`, etc.
  - Shapes use SVG `<filter>`, `stroke`, `fill`

## Implementation Details

### 1. SVG Shapes - Using Filters

All shape components now use SVG `<feDropShadow>` for shadows:

```vue
<svg>
  <defs v-if="hasShadow">
    <filter :id="`shadow-${node.id}`">
      <feDropShadow
        :dx="node.shadowOffsetX ?? 0"
        :dy="node.shadowOffsetY ?? 5"
        :stdDeviation="(node.shadowBlur ?? 10) / 2"
        :flood-color="node.shadowColor ?? '#00000040'"
      />
    </filter>
  </defs>
  <circle
    :fill="node.backgroundColor"
    :stroke="node.borderColor"
    :stroke-width="strokeWidth"
    :filter="hasShadow ? `url(#shadow-${node.id})` : undefined"
  />
</svg>
```

**Why SVG Filters?**
- ✅ Proper shadow on SVG elements
- ✅ GPU accelerated
- ✅ Supports all shadow properties
- ✅ Works across all browsers

### 2. BasicCard - Using CSS

Cards now compute their own styles:

```vue
<div :style="cardStyle">
  <!-- cardStyle includes boxShadow, border, borderRadius, etc. -->
</div>
```

```typescript
const cardStyle = computed(() => {
  const s: Record<string, string> = {}
  
  if (node.backgroundColor) s.backgroundColor = node.backgroundColor
  if (node.borderColor) s.borderColor = node.borderColor
  if (node.borderWidth) s.borderWidth = `${node.borderWidth}px`
  if (node.borderRadius) s.borderRadius = `${node.borderRadius}px`
  
  // Shadow computation
  if (node.shadowColor || node.shadowBlur) {
    s.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`
  }
  
  return s
})
```

### 3. Border Width Handling

Shapes need special handling to keep strokes inside the viewBox:

**Circle:**
```typescript
const strokeWidth = computed(() => {
  if (!node.borderColor && !node.borderWidth) return 0
  return node.borderWidth ?? 2
})

const circleRadius = computed(() => {
  // Reduce radius to accommodate stroke
  const adjustment = strokeWidth.value / 2
  return 45 - adjustment
})
```

**Rectangle:**
```typescript
const strokeOffset = computed(() => strokeWidth.value / 2)
const rectWidth = computed(() => 100 - strokeWidth.value)
const rectHeight = computed(() => 100 - strokeWidth.value)
```

## Benefits

### ✅ Consistency
- All node types render shadows/borders the same way
- Properties panel controls work identically for cards and shapes

### ✅ Flexibility
- Each component can customize how it applies properties
- Shapes can use optimal SVG features
- Cards can use optimal CSS features

### ✅ Maintainability
- Clear separation of concerns
- CanvasNode handles interaction, not styling
- Components handle their own appearance

### ✅ Performance
- SVG filters are GPU-accelerated
- No unnecessary style recalculations on wrapper

## Files Changed

### Modified Components

1. **CanvasNode.vue**
   - Removed: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`, `boxShadow`
   - Kept: `left`, `top`, `width`, `height`, `opacity`
   - Removed: `computedShadow` computed property

2. **BasicCard.vue**
   - Added: `cardStyle` computed with all styling properties
   - Applies: background, border (color/width/radius), shadow

3. **All Shape Components** (Circle, Square, Diamond, Triangle, Trapezoid, Star)
   - Added: SVG `<filter>` with `<feDropShadow>`
   - Added: `hasShadow` computed
   - Added: `strokeWidth` computed
   - Applied: `fill`, `stroke`, `stroke-width`, `filter` on SVG elements

## Testing Checklist

- [x] Shapes display shadows correctly
- [x] Shapes display borders correctly
- [x] Cards display shadows correctly
- [x] Cards display borders correctly
- [x] Border radius works on cards
- [x] Opacity affects entire node (wrapper level)
- [x] Properties panel updates work for all node types
- [x] Shadow toggle works
- [x] Border width slider works
- [x] No visual glitches or rendering issues

## Future Enhancements

Now that architecture is correct, we can easily add:

- **Gradient fills** - SVG `<linearGradient>` for shapes
- **Multiple shadows** - Multiple `<feDropShadow>` filters
- **Inner shadows** - `<feDropShadow>` with reverse offset
- **Glow effects** - Colored shadows with high blur
- **Stroke patterns** - `stroke-dasharray` for dashed borders
- **Transforms** - Rotation, skew via SVG transform attribute

## Migration Notes

**Existing Nodes:**
- ✅ Fully backward compatible
- ✅ Properties pass through to components unchanged
- ✅ No data migration needed

**New Behavior:**
- Shadows now render on shapes (previously didn't work)
- Borders now render on shape paths (previously on wrapper box)
- All styling is component-specific (not wrapper-level)

---

**Status:** ✅ Architecture fixed - ready for production!
