import { useRef, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './driver-styles.css';
import { getTourSteps } from './tour-steps';
import { useStore } from '@/store/store';

const TOUR_SEEN_KEY = 'tour-seen';

export function useGuidedTour() {
  const driverRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    const store = useStore.getState();

    const steps = getTourSteps({
      openConfig: (tab: string) => {
        store.setConfigTab(tab);
        store.setConfigOpen(true);
      },
      closeConfig: () => {
        store.setConfigOpen(false);
      },
    });

    if (driverRef.current) {
      driverRef.current.destroy();
    }

    driverRef.current = driver({
      animate: true,
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Finalizar',
      allowClose: true,
      allowKeyboardControl: true,
      overlayClickBehavior: 'nextStep',
      popoverClass: 'driverjs-theme',
      stagePadding: 6,
      stageRadius: 8,
      steps,
      onDestroyed: () => {
        localStorage.setItem(TOUR_SEEN_KEY, 'true');
        store.setConfigOpen(false);
      },
    });

    driverRef.current.drive();
  }, []);

  const stopTour = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const hasSeenTour = useCallback(() => {
    return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_SEEN_KEY);
  }, []);

  return { startTour, stopTour, hasSeenTour, resetTour };
}
