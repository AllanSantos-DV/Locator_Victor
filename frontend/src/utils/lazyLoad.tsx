import React, { Suspense, ComponentType } from 'react';
import { LoadingComponent } from '../components/common/LoadingComponent';

export function lazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
): React.FC<P> {
  const LazyComponent = React.lazy(importFunc);

  return function LazyLoadWrapper(props: P) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
} 