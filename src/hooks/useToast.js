import { useState, useCallback } from 'react';

/**
 * Simple toast state hook.
 *
 * Usage:
 *   const { toastMsg, toastVisible, showToast, hideToast } = useToast();
 *   showToast('Book added ♥');
 *   <Toast message={toastMsg} visible={toastVisible} onHide={hideToast} />
 */
export default function useToast() {
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return { toastMsg, toastVisible, showToast, hideToast };
}
