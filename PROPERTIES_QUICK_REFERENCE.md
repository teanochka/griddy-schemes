# 🎯 Properties Panel - Quick Reference Guide

## 🎨 New Properties

### Fill & Stroke
| Property | Control Type | Range/Values | Default |
|----------|-------------|--------------|---------|
| Background Color | Color Picker + Hex | Any valid color | `#ffffff` |
| Opacity | Slider | 0-100% | 100% |
| Border Color | Color Picker + Hex | Any valid color | None |
| Border Width | Slider | 0-20px | 0px |
| Border Radius | Slider | 0-100px | 8px |

### Typography *(Text nodes only)*
| Property | Control Type | Range/Values | Default |
|----------|-------------|--------------|---------|
| Font Size | Slider | 8-72px | 14px |
| Text Color | Color Picker + Hex | Any valid color | Node's color |
| Font Weight | Slider | 100-900 (steps of 100) | 400 |
| Text Align | Button Group | Left / Center / Right | Center |

### Effects
| Property | Control Type | Range/Values | Default |
|----------|-------------|--------------|---------|
| Shadow Enabled | Toggle Switch | On / Off | Off |
| Shadow Color | Color Picker + Hex | Any valid color (with alpha) | `#00000040` |
| Shadow Blur | Slider | 0-50px | 10px |
| Shadow Offset X | Slider | -50 to 50px | 0px |
| Shadow Offset Y | Slider | -50 to 50px | 5px |

### Position & Size
| Property | Input Type | Range | Default |
|----------|-----------|-------|---------|
| X Position | Number Input | Any | Node's X |
| Y Position | Number Input | Any | Node's Y |
| Width | Number Input | 50-1200px | 120px |
| Height | Number Input | 50-1200px | 120px |

## 🖱️ How to Use Controls

### Sliders
- **Click and drag** the handle to adjust value
- **Click on track** to jump to that value
- **Current value** shown on the right
- **Unit** (px, %) displayed after value

### Color Pickers
- **Click swatch** to open native color picker
- **Type hex code** directly in text field
- Supports **6-digit** (#RRGGBB) and **8-digit** (#RRGGBBAA) format
- Alpha values work for shadow colors

### Number Inputs
- **Type value** directly
- **Arrow keys** to increment/decrement
- **Min/max** constraints enforced automatically

### Button Groups
- **Click button** to select option
- **Blue highlight** indicates active option
- **Hover** for visual feedback

### Toggle Switches
- **Click anywhere** on switch to toggle
- **Blue** = enabled, **Gray** = disabled
- **Shadow section** uses toggle

## 💡 Tips & Tricks

### Working with Colors
1. **Use hex codes** for precise colors: `#3B82F6`
2. **Add alpha channel** for transparency: `#3B82F640`
3. **Click swatch** for visual picker with recent colors

### Shadows
1. **Enable shadow first** with toggle switch
2. **Soft shadow**: Low offset, high blur (0, 5, 20)
3. **Hard shadow**: High offset, low blur (10, 10, 2)
4. **Inset shadow**: Negative offsets (-5, -5)

### Typography
1. **Font weights**:
   - 100-300: Thin/Light
   - 400: Normal/Regular *(default)*
   - 500-600: Medium/Semibold
   - 700-900: Bold/Black
2. **Typography section auto-hides** for shape nodes

### Borders
1. **Border only visible** when width > 0
2. **Radius affects** outer corners only
3. **Combine with shadow** for depth effect

### Performance
- ✅ Changes apply **instantly** (no "Apply" button needed)
- ✅ Updates **sync automatically** to backend
- ✅ No lag with **reasonable values**

## 🎨 Common Styling Patterns

### Card with Shadow
```
Fill: #FFFFFF (white)
Border: 1px, #E5E7EB (gray)
Radius: 12px
Shadow: Enabled
  - Color: #00000010 (subtle)
  - Blur: 20px
  - Offset: 0, 8px
```

### Emphasis Card
```
Fill: #3B82F6 (blue)
Opacity: 90%
Border: 2px, #1E40AF (dark blue)
Radius: 8px
Text Color: #FFFFFF (white)
Font Weight: 600 (semibold)
```

### Soft Shape
```
Fill: #10B981 (green)
Opacity: 80%
Border: None
Shadow: Enabled
  - Color: #10B98140
  - Blur: 15px
  - Offset: 0, 4px
```

### Outlined Card
```
Fill: Transparent or white
Border: 3px, #8B5CF6 (purple)
Radius: 16px
No shadow
```

## 🔄 Workflow Tips

### Quick Adjustments
1. **Select node** → Properties panel appears
2. **Adjust slider** → See live preview
3. **Release** → Change saved automatically

### Experimenting
1. **Try different values** freely
2. **Ctrl+Z** to undo (workspace level)
3. **Copy node** to preserve original (Ctrl+C, Ctrl+V)

### Consistent Styling
1. **Note down values** you like
2. **Copy node** with desired styles
3. Apply to other nodes manually
4. *(Future: Style presets)*

## 🎯 Keyboard Shortcuts (Existing)

| Action | Shortcut |
|--------|----------|
| Select node | Click |
| Multi-select | Ctrl/Cmd + Click |
| Range select | Shift + Click (in layers) |
| Marquee select | Drag on canvas |
| Copy | Ctrl/Cmd + C |
| Paste | Ctrl/Cmd + V |
| Cut | Ctrl/Cmd + X |
| Delete | Delete or Backspace |
| Deselect | Click on empty canvas |

## 📱 Responsive Design

The properties panel:
- ✅ **Fixed width** (256px) on right side
- ✅ **Scrollable content** when overflow
- ✅ **Stays visible** above other elements (z-index: 30)
- ✅ **Prevents click-through** to canvas below

## 🐛 Troubleshooting

### Property not applying?
- Check if node is **selected** (blue ring around it)
- Ensure **value is within valid range**
- For borders: **Width must be > 0** to be visible

### Shadow not showing?
- Verify **toggle is enabled** (blue switch)
- Increase **blur value** for more visibility
- Check **shadow color** isn't transparent (`#00000000`)
- Try adjusting **offset values**

### Text properties hidden?
- Typography section only shows for **text-supporting nodes**
- Shapes don't have text properties (by design)

### Panel not appearing?
- **Select a node** first
- Panel appears **only when single node selected**
- Multi-selection hides panel (by design)

## 🚀 Next Steps

After mastering the properties panel:
1. Explore **combining effects** (border + shadow)
2. Create **visual hierarchy** with opacity
3. Use **consistent colors** across project
4. Experiment with **typography weights**

---

**Have fun designing! 🎨✨**
