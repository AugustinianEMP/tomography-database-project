import { useEffect } from 'react';

// Reusable hook for handling swipe-right exit gestures
export const useSwipeExit = (onExit, shouldAutoSave = false, formData = null) => {
  useEffect(() => {
    let isNavigating = false;

    // Handle trackpad swipe gestures using wheel events
    const handleWheel = (e) => {
      // Prevent multiple rapid navigations
      if (isNavigating) return;

      // Check for horizontal trackpad swipe (deltaX indicates horizontal movement)
      // On macOS, trackpad swipes generate wheel events with deltaX
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX < -50) {
        // deltaX < -50 means swipe right (negative values for right swipe)
        e.preventDefault();
        isNavigating = true;
        
        // Auto-save if enabled
        if (shouldAutoSave && formData) {
          localStorage.setItem('addDatasetFormDraft', JSON.stringify(formData));
        }
        
        // Add small delay to prevent accidental multiple triggers
        setTimeout(() => {
          onExit && onExit();
          isNavigating = false;
        }, 100);
      }
    };

    // Alternative: Handle using touchpad gestures through touch events
    let startX = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 2) { // Two finger gesture
        startX = e.touches[0].clientX + e.touches[1].clientX;
        startTime = Date.now();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length === 2) {
        const currentX = e.touches[0].clientX + e.touches[1].clientX;
        const deltaX = currentX - startX;
        const deltaTime = Date.now() - startTime;
        
        // Right swipe: positive deltaX, within reasonable time
        if (deltaX > 100 && deltaTime < 500) {
          e.preventDefault();
          
          // Auto-save if enabled
          if (shouldAutoSave && formData) {
            localStorage.setItem('addDatasetFormDraft', JSON.stringify(formData));
          }
          
          onExit && onExit();
        }
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || (e.metaKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        
        // Auto-save if enabled
        if (shouldAutoSave && formData) {
          localStorage.setItem('addDatasetFormDraft', JSON.stringify(formData));
        }
        
        onExit && onExit();
      }
    };

    // Add event listeners - wheel events are most reliable for trackpad
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit, shouldAutoSave, formData]);
}; 