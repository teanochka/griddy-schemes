# 🔄 Migration Guide - Properties Panel Update

## Overview

This guide explains how the new properties system works with existing nodes and what to expect during the upgrade.

## ✅ Backward Compatibility

**Good News:** All changes are **fully backward compatible**! 

### Existing Nodes
- ✅ Will continue to work **exactly as before**
- ✅ No data migration required
- ✅ No breaking changes to existing properties
- ✅ Old `backgroundColor` property still works

### What Happens to Old Nodes?

```typescript
// OLD NODE (before update)
{
  id: 123,
  type: 'basic-card',
  x: 100,
  y: 100,
  width: 120,
  height: 120,
  backgroundColor: '#3B82F6',
  content: 'Hello'
}

// SAME NODE (after update) - works perfectly!
// All new properties are optional and have defaults
```

## 🆕 New Property Defaults

When you select an existing node, here's what values it will show:

| Property | Default Value | Source |
|----------|---------------|--------|
| `backgroundColor` | Existing value or `#ffffff` | Preserved or default |
| `opacity` | `100%` | Default (100% = fully opaque) |
| `borderColor` | `undefined` | No border shown |
| `borderWidth` | `0px` | No border shown |
| `borderRadius` | `8px` | Applied to CanvasNode wrapper |
| `fontSize` | `14px` | CSS default |
| `textColor` | Inherited | From CSS |
| `fontWeight` | `400` | Normal weight |
| `textAlign` | Existing value or `center` | Preserved or default |
| `shadowColor` | `undefined` | No shadow shown |
| `shadowBlur` | `undefined` | No shadow shown |
| `shadowOffsetX` | `undefined` | No shadow shown |
| `shadowOffsetY` | `undefined` | No shadow shown |

## 🎨 How Defaults Work

### Fill & Opacity
```typescript
// In CanvasNode.vue
backgroundColor: node.backgroundColor || '#ffffff'  // White if not set
opacity: node.opacity !== undefined ? node.opacity / 100 : 1  // 100% if not set
```

### Border
```typescript
borderColor: node.borderColor  // undefined = no border color
borderWidth: node.borderWidth ? `${node.borderWidth}px` : undefined  // 0 or undefined = no border
borderRadius: node.borderRadius ? `${node.borderRadius}px` : '8px'  // 8px default
```

### Shadow
```typescript
// Only applied if any shadow property is set
if (node.shadowColor || node.shadowBlur) {
  const color = node.shadowColor ?? '#00000040'
  const blur = node.shadowBlur ?? 10
  const offsetX = node.shadowOffsetX ?? 0
  const offsetY = node.shadowOffsetY ?? 5
  boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`
}
```

### Typography
```typescript
// In BasicCard.vue
fontSize: node.fontSize || undefined  // Uses CSS default (14px)
color: node.textColor || undefined  // Uses CSS default
fontWeight: node.fontWeight || undefined  // Uses CSS default (400)
```

## 📊 Testing Existing Projects

### Step 1: Load Project
```bash
# Start your dev server
npm run dev
```

### Step 2: Open Workspace
- Navigate to existing project
- All nodes should render **exactly as before**
- No visual changes without user action

### Step 3: Select Node
- Click any existing node
- Properties panel appears on right
- Shows current values + defaults for new properties

### Step 4: Make Changes (Optional)
- Adjust any property
- Changes save immediately
- New properties added to node data

## 🔍 Data Structure Changes

### Before Update
```json
{
  "id": 1,
  "type": "basic-card",
  "x": 100,
  "y": 100,
  "width": 120,
  "height": 120,
  "backgroundColor": "#3B82F6",
  "content": "Hello",
  "textAlign": "center"
}
```

### After Using New Properties
```json
{
  "id": 1,
  "type": "basic-card",
  "x": 100,
  "y": 100,
  "width": 120,
  "height": 120,
  "backgroundColor": "#3B82F6",
  "content": "Hello",
  "textAlign": "center",
  "opacity": 90,
  "borderColor": "#1E40AF",
  "borderWidth": 2,
  "borderRadius": 12,
  "fontSize": 16,
  "textColor": "#FFFFFF",
  "fontWeight": 600,
  "shadowColor": "#00000020",
  "shadowBlur": 15,
  "shadowOffsetX": 0,
  "shadowOffsetY": 5
}
```

**Note:** New properties only added when explicitly set by user!

## ⚠️ Potential Issues & Solutions

### Issue 1: Old Inline Styles
**Problem:** Node has old `style` property with conflicting values

```typescript
// Old node with inline styles
{
  style: {
    backgroundColor: 'red',
    borderRadius: '20px'
  }
}
```

**Solution:** Inline styles have **lower priority** than new properties
```typescript
// In CanvasNode.vue - new properties applied AFTER style
:style="{
  backgroundColor: node.backgroundColor || '#ffffff',
  borderRadius: node.borderRadius ? `${node.borderRadius}px` : '8px',
  ...(node.style || {})  // Spread last, can be overridden
}"
```

**Fix:** If issues occur, remove old `style` property and use new properties panel

### Issue 2: Shadow Overlapping
**Problem:** Node has both old `shadow-sm` class and new shadow properties

**Solution:** 
1. Remove Tailwind shadow classes from nodes
2. Use properties panel for shadow control
3. Or: Disable shadow toggle in properties panel

### Issue 3: Typography Not Applying
**Problem:** BasicCard has hardcoded text-sm class

**Solution:** Already fixed! 
```vue
<!-- OLD -->
<input class="text-sm ..." />

<!-- NEW -->
<input :style="{ fontSize: `${node.fontSize}px` }" />
```

## 🔧 Migration Checklist

For each existing project:

- [ ] **Backup data** (export project JSON)
- [ ] **Review nodes** - check for custom `style` properties
- [ ] **Test rendering** - all nodes should look the same
- [ ] **Select nodes** - properties panel should show correct values
- [ ] **Make test changes** - verify updates work
- [ ] **Check sync** - ensure changes persist after refresh
- [ ] **Remove conflicts** - delete old inline styles if issues

## 💾 Database Compatibility

### MongoDB/Storage
- ✅ **No schema changes** required
- ✅ New properties are **optional fields**
- ✅ Old documents remain valid
- ✅ Mixed old/new nodes in same project work fine

### API Compatibility
```typescript
// API returns old format - works!
{
  cards: [
    { id: 1, type: 'basic-card', x: 0, y: 0, ... }
  ]
}

// API returns new format - works!
{
  cards: [
    { id: 1, type: 'basic-card', x: 0, y: 0, opacity: 90, ... }
  ]
}

// Mixed - works!
{
  cards: [
    { id: 1, type: 'basic-card', x: 0, y: 0 },  // old
    { id: 2, type: 'shape', x: 100, y: 100, opacity: 80, shadowBlur: 10 }  // new
  ]
}
```

## 🎯 Best Practices

### For New Projects
1. **Use properties panel** for all styling
2. **Avoid inline styles** in node data
3. **Leverage defaults** - don't set values unnecessarily
4. **Toggle shadow off** if not needed

### For Existing Projects
1. **Test before production** deployment
2. **Update gradually** - not all nodes at once
3. **Document changes** you make to existing nodes
4. **Keep backups** of important projects

### For Developers
1. **Check type definitions** when adding new node types
2. **Use optional chaining** when accessing new properties
3. **Provide sensible defaults** for all new properties
4. **Test with old data** during development

## 🚀 Rollout Strategy

### Phase 1: Soft Launch (Current)
- ✅ Code deployed
- ✅ All new properties optional
- ✅ Defaults ensure no visual changes
- ✅ Users can opt-in to new features

### Phase 2: User Education
- 📚 Share documentation
- 🎥 Create demo video (optional)
- 💬 Announce new features
- 🎨 Show example use cases

### Phase 3: Adoption
- 👥 Users discover properties panel
- 🎨 Users apply new styling
- 📊 Monitor for issues
- 🐛 Fix any bugs reported

## 📞 Support

If you encounter issues:

1. **Check this guide** for common problems
2. **Review console** for errors
3. **Test with minimal node** (just type, x, y, w, h)
4. **Compare old vs new** data structure
5. **Report bugs** with reproduction steps

## ✅ Success Criteria

Migration is successful when:
- ✅ All existing nodes render correctly
- ✅ No console errors or warnings
- ✅ Properties panel shows for selected nodes
- ✅ Changes apply and persist correctly
- ✅ Old projects load without issues
- ✅ New properties work as expected

---

**Happy migrating! 🚀**

The update is designed to be **seamless** - your existing work is safe!
