# Color Scheme Implementation Guide

## Overview
This guide shows you how to implement colors in your fitness app.

## Files Created

### 1. `src/utils/colors.ts`
Contains the color scheme logic and utilities.

### 2. `src/components/ColorProvider.tsx`
React context provider that provides colors.

## How to Use

### Step 1: Wrap Your App with ColorProvider

```tsx
import { ColorProvider } from './components/ColorProvider';

function App() {
  return (
    <ColorProvider>
      {/* Your app content here */}
      <YourMainComponent />
    </ColorProvider>
  );
}
```

### Step 2: Use Colors in Any Component

```tsx
import { useColors } from '../components/ColorProvider';

function YourComponent() {
  const { colorScheme } = useColors();
  
  return (
    <div>
      {/* Button with app color */}
      <button style={{
        backgroundColor: colorScheme.button,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
      }}>
        Get Started
      </button>
      
      {/* Card with app color */}
      <div style={{
        backgroundColor: colorScheme.background,
        border: `2px solid ${colorScheme.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
      }}>
        <h2 style={{ color: colorScheme.primary }}>
          Welcome to Fitness App
        </h2>
      </div>
    </div>
  );
}
```

### Step 3: Quick Reference - Color Variables

```tsx
const { colorScheme } = useColors();

// Available colors:
colorScheme.primary   // Main color
colorScheme.light     // Light background
colorScheme.dark      // Dark variant
colorScheme.button    // For buttons
colorScheme.background // For backgrounds
colorScheme.border     // For borders
```

## Example Implementation

```tsx
import React from 'react';
import { useColors } from './components/ColorProvider';

function ProfileCard() {
  const { colorScheme } = useColors();
  
  return (
    <div style={{
      backgroundColor: colorScheme.background,
      border: `2px solid ${colorScheme.border}`,
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      margin: '20px auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h2 style={{ 
          color: colorScheme.primary,
          margin: 0,
          fontSize: '24px',
        }}>
          Fitness Dashboard
        </h2>
      </div>
      
      {/* Content */}
          <div>
            <p style={{ color: '#374151', marginBottom: '8px' }}>
              ✓ Unlimited workouts
            </p>
            <p style={{ color: '#374151', marginBottom: '8px' }}>
          ✓ AI-generated plans
            </p>
            <p style={{ color: '#374151' }}>
          ✓ Track your progress
        </p>
      </div>
      
      {/* Action Button */}
      <button
        onClick={() => {
          // Handle action
        }}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          backgroundColor: colorScheme.button,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Start Your Journey
      </button>
    </div>
  );
}

export default ProfileCard;
```

## Color Values

- Primary: `#3b82f6` (Blue-500)
- Light: `#eff6ff` (Blue-50)
- Dark: `#2563eb` (Blue-600)
- Button: `#3b82f6` (Blue-500)
- Background: `#eff6ff` (Light blue)
- Border: `#3b82f6` (Blue)

## Notes

- The color scheme is consistent across the app
- The context provides colors that work well for fitness applications

## Troubleshooting

**"useColors must be used within ColorProvider" error:**
- Make sure your component is wrapped with `<ColorProvider>`
