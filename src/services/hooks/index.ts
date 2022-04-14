import { DependencyList, RefObject, useCallback, useEffect, useMemo } from 'react';

export const useClass = (classes: (string | boolean | undefined)[], deps: DependencyList): string =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo<string>(() => classes.filter(Boolean).join(' '), deps);

export type UseOnEventsConfig = {
  callback: () => void;
  element: RefObject<HTMLElement>;
  events: (keyof DocumentEventMap)[];
};

export const useOnEvents = ({ callback, element, events }: UseOnEventsConfig): void => {
  const onDocumentClickHandler = useCallback(
    (event: Event) => {
      if (element.current) {
        if (!element.current.contains(event.target as Node)) {
          callback();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, element.current]
  );

  useEffect(() => {
    events.forEach((eventType) => {
      document.addEventListener(eventType, onDocumentClickHandler);
    });

    return () => {
      events.forEach((eventType) => {
        document.removeEventListener(eventType, onDocumentClickHandler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDocumentClickHandler]);
};
