import { DependencyList, useMemo } from 'react';

export const useClass = (classes: (string | boolean | undefined)[], deps: DependencyList): string =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo<string>(() => classes.filter(Boolean).join(' '), deps);
