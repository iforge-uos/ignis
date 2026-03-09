import { useCallback, useEffect, useRef, useState } from "react";

interface UsePromiseDialogReturn<TData, TResult> {
  data: TData | null;
  isOpen: boolean;
  request: (data: TData) => Promise<TResult>;
  resolve: (result: TResult) => void;
  close: () => void;
}

export const usePromiseDialog = <TData, TResult = boolean>(
  onCloseValue: TResult,
): UsePromiseDialogReturn<TData, TResult> => {
  const [data, setData] = useState<TData | null>(null);
  const resolverRef = useRef<((result: TResult) => void) | null>(null);

  const resolve = useCallback((result: TResult) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setData(null);
  }, []);

  const close = useCallback(() => {
    resolve(onCloseValue);
  }, [onCloseValue, resolve]);

  const request = useCallback((nextData: TData) => {
    setData(nextData);
    return new Promise<TResult>((resolvePromise) => {
      resolverRef.current = resolvePromise;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(onCloseValue);
        resolverRef.current = null;
      }
    };
  }, [onCloseValue]);

  return {
    data,
    isOpen: data !== null,
    request,
    resolve,
    close,
  };
};
