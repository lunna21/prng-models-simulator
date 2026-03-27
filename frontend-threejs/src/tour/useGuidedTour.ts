import { useRef, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './driver-styles.css';
import { getEquationsTourSteps, getGeneratorTourSteps, getTourSteps } from './tour-steps';
import { useStore } from '@/store/store';

const TOUR_SEEN_KEY = 'tour-seen';
const EQUATIONS_TOUR_SEEN_KEY = 'tour-equations-seen';

export function useGuidedTour() {
  const driverRef = useRef<Driver | null>(null);

  const createDriver = useCallback((steps: ReturnType<typeof getTourSteps>, markSeenOnDestroy: boolean) => {
    const store = useStore.getState();

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
        if (markSeenOnDestroy) {
          localStorage.setItem(TOUR_SEEN_KEY, 'true');
        }
        store.setConfigOpen(false);
      },
    });

    driverRef.current.drive();
  }, []);

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
      getGeneratorType: () => useStore.getState().generatorType,
    });

    createDriver(steps, true);
  }, [createDriver]);

  const startGeneratorTour = useCallback(() => {
    const store = useStore.getState();

    const steps = getGeneratorTourSteps({
      openConfig: (tab: string) => {
        store.setConfigTab(tab);
        store.setConfigOpen(true);
      },
      closeConfig: () => {
        store.setConfigOpen(false);
      },
      getGeneratorType: () => useStore.getState().generatorType,
    });

    createDriver(steps, false);
  }, [createDriver]);

  const startEquationsTour = useCallback((markSeen = false) => {
    const store = useStore.getState();

    const steps = getEquationsTourSteps({
      openConfig: (tab: string) => {
        store.setConfigTab(tab);
        store.setConfigOpen(true);
      },
      closeConfig: () => {
        store.setConfigOpen(false);
      },
      getGeneratorType: () => useStore.getState().generatorType,
    });

    createDriver(steps, false);

    if (markSeen) {
      localStorage.setItem(EQUATIONS_TOUR_SEEN_KEY, 'true');
    }
  }, [createDriver]);

  const stopTour = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const hasSeenTour = useCallback(() => {
    return localStorage.getItem(TOUR_SEEN_KEY) === 'true';
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_SEEN_KEY);
    localStorage.removeItem(EQUATIONS_TOUR_SEEN_KEY);
  }, []);

  const hasSeenEquationsTour = useCallback(() => {
    return localStorage.getItem(EQUATIONS_TOUR_SEEN_KEY) === 'true';
  }, []);

  return {
    startTour,
    startGeneratorTour,
    startEquationsTour,
    stopTour,
    hasSeenTour,
    hasSeenEquationsTour,
    resetTour,
  };
}
