import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Sidebar visibility state
export const leftSidebarOpen = writable(true);
export const rightSidebarOpen = writable(true);

// Mobile detection (updated on mount and resize)
export const isMobile = writable(false);

// Initialize mobile detection
if (browser) {
  const checkMobile = () => {
    const mobile = window.innerWidth <= 768;
    isMobile.set(mobile);
    
    // Auto-close sidebars on mobile by default
    if (mobile) {
      leftSidebarOpen.set(false);
      rightSidebarOpen.set(false);
    } else {
      leftSidebarOpen.set(true);
      rightSidebarOpen.set(true);
    }
  };
  
  // Check on load
  checkMobile();
  
  // Check on resize
  window.addEventListener('resize', checkMobile);
}

// Toggle functions
export function toggleLeftSidebar() {
  leftSidebarOpen.update(v => !v);
}

export function toggleRightSidebar() {
  rightSidebarOpen.update(v => !v);
}

export function closeAllSidebars() {
  leftSidebarOpen.set(false);
  rightSidebarOpen.set(false);
}

// Derived: is any sidebar open (for backdrop)
export const anySidebarOpen = derived(
  [leftSidebarOpen, rightSidebarOpen, isMobile],
  ([$left, $right, $mobile]) => $mobile && ($left || $right)
);
