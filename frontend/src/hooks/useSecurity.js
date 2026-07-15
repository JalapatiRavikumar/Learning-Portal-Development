// ============================================================
// frontend/src/hooks/useSecurity.js
// Custom hook: all DRM / anti-screenshot event logic
// ============================================================
import { useState, useEffect, useCallback } from 'react';

export const useSecurity = ({ videoRef, addApiLog, addSecurityLog, setIsPlaying }) => {
  const [isWatermarkEnabled,   setIsWatermarkEnabled]   = useState(true);
  const [securityViolations,   setSecurityViolations]   = useState(0);
  const [isScreenShieldActive, setIsScreenShieldActive] = useState(false);
  const [shieldReason,         setShieldReason]         = useState('');

  const triggerShield = useCallback((reason) => {
    setIsScreenShieldActive(true);
    setShieldReason(reason);
    setSecurityViolations(v => v + 1);
    addApiLog?.('SHIELD', `Security shield activated: ${reason}`, 403, 'Video stream locked out.');
  }, [addApiLog]);

  const dismissShield = useCallback(() => {
    // 1. Lower the UI shield block immediately
    setIsScreenShieldActive(false);
    
    // 2. Safely trigger the video engine to resume playing
    setIsPlaying(true);
    
    addApiLog?.("SHIELD", "Security shield cleared by student. Video playback resumed.", 200, "Portal viewing active.");
  }, [addApiLog, videoRef]);

  useEffect(() => {
    // 1. Block right-click inside secure video container
    const handleContextMenu = (e) => {
      if (e.target.closest('.secure-video-container')) {
        e.preventDefault();
        addSecurityLog?.('Context Menu Blocked', 'Right-click inside secure player suppressed.');
        addApiLog?.('SECURITY', '/api/drm/context-block', 403, 'Context menu blocked on video element.');
      }
    };

    // 2. Block PrintScreen / F12 / DevTools combos
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerShield('OS Print-Screen Attempted');
        navigator.clipboard.writeText('PROTECTED_GVCC_PORTAL_CONTENT').catch(() => {});
        addSecurityLog?.('PrintScreen Blocked', 'Dummy string injected into clipboard.');
      }
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key))
      ) {
        addSecurityLog?.('DevTools Attempt', `Key combo inhibited: Ctrl+Shift+${e.key}`);
        addApiLog?.('SECURITY', '/api/drm/devtools-block', 403, 'DevTools shortcut intercepted.');
      }
    };

    // 3. Tab Visibility API — pause on tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
        triggerShield('Browser Tab Switched / Hidden');
        addSecurityLog?.('Tab Hidden', 'Video paused — tab switch detected.');
      }
    };

    // 4. Window blur — pause when focus leaves browser (e.g. Snipping Tool)
    const handleWindowBlur = () => {
      setIsPlaying(false);
      triggerShield('Window Blur (Snipping Tool / External Capture)');
      addSecurityLog?.('Window Blur', 'Focus left browser window — playback paused.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [triggerShield, addApiLog, addSecurityLog, videoRef]);

  return {
    isWatermarkEnabled,
    setIsWatermarkEnabled,
    securityViolations,
    isScreenShieldActive,
    shieldReason,
    dismissShield,
  };
};
