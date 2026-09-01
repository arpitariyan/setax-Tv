import { useState, useEffect, useRef, useCallback } from 'react';

export type SleepTimerOption = 0 | 15 | 30 | 45 | 60; // 0 means Off

export function useSleepTimer(onTimerExpired?: () => void) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [activeMinutesOption, setActiveMinutesOption] = useState<SleepTimerOption>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const setTimer = useCallback((minutes: SleepTimerOption) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveMinutesOption(minutes);

    if (minutes === 0) {
      setMinutesLeft(null);
      endTimeRef.current = null;
      return;
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    endTimeRef.current = endTime;
    setMinutesLeft(minutes);

    timerRef.current = setInterval(() => {
      if (!endTimeRef.current) return;
      const diffMs = endTimeRef.current - Date.now();
      const remMin = Math.ceil(diffMs / (1000 * 60));

      if (diffMs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setMinutesLeft(0);
        setActiveMinutesOption(0);
        endTimeRef.current = null;
        onTimerExpired?.();
      } else {
        setMinutesLeft(remMin);
      }
    }, 1000);
  }, [onTimerExpired]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    activeMinutesOption,
    minutesLeft,
    setTimer,
  };
}
