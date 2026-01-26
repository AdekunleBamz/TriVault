'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  icon?: ReactNode;
  className?: string;
}

export interface Toast extends Required<Pick<ToastOptions, 'id' | 'type' | 'duration' | 'dismissible'>> {
  title?: string;
  description?: string;
  action?: ToastOptions['action'];
  onDismiss?: () => void;
  icon?: ReactNode;
  className?: string;
  createdAt: number;
  visible: boolean;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  success: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  error: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  warning: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  info: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  loading: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
  gap?: number;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

function generateId(): string {
  return `toast-${++toastCounter}-${Date.now()}`;
}

// ============================================================================
// Toast Provider
// ============================================================================

export function ToastProvider({
  children,
  position = 'bottom-right',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    // First mark as not visible for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );

    // Then remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const timeout = timeoutsRef.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        timeoutsRef.current.delete(id);
      }
    }, 200);
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((prev) => prev.map((t) => ({ ...t, visible: false })));
    setTimeout(() => {
      setToasts([]);
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    }, 200);
  }, []);

  const toast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id ?? generateId();
      const duration = options.duration ?? (options.type === 'loading' ? 0 : defaultDuration);

      const newToast: Toast = {
        id,
        type: options.type ?? 'info',
        title: options.title,
        description: options.description,
        duration,
        dismissible: options.dismissible ?? true,
        action: options.action,
        onDismiss: options.onDismiss,
        icon: options.icon,
        className: options.className,
        createdAt: Date.now(),
        visible: true,
      };

      setToasts((prev) => {
        // Remove oldest if at max
        const filtered = prev.length >= maxToasts ? prev.slice(1) : prev;
        return [...filtered, newToast];
      });

      // Auto dismiss
      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismiss(id);
          newToast.onDismiss?.();
        }, duration);
        timeoutsRef.current.set(id, timeout);
      }

      return id;
    },
    [defaultDuration, maxToasts, dismiss]
  );

  const success = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) =>
      toast({ ...options, type: 'success', title }),
    [toast]
  );

  const error = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) =>
      toast({ ...options, type: 'error', title }),
    [toast]
  );

  const warning = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) =>
      toast({ ...options, type: 'warning', title }),
    [toast]
  );

  const info = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) =>
      toast({ ...options, type: 'info', title }),
    [toast]
  );

  const loading = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) =>
      toast({ ...options, type: 'loading', title, duration: 0 }),
    [toast]
  );

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...options,
              type: options.type ?? t.type,
            }
          : t
      )
    );

    // Handle duration update
    if (options.duration !== undefined && options.duration > 0) {
      const existing = timeoutsRef.current.get(id);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        dismiss(id);
      }, options.duration);
      timeoutsRef.current.set(id, timeout);
    }
  }, [dismiss]);

  const promiseFn = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ): Promise<T> => {
      const id = toast({ type: 'loading', title: options.loading });

      try {
        const data = await promise;
        const successMessage =
          typeof options.success === 'function'
            ? options.success(data)
            : options.success;
        update(id, { type: 'success', title: successMessage, duration: defaultDuration });
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const errorMessage =
          typeof options.error === 'function'
            ? options.error(error)
            : options.error;
        update(id, { type: 'error', title: errorMessage, duration: defaultDuration });
        throw error;
      }
    },
    [toast, update, defaultDuration]
  );

  const value: ToastContextValue = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
    update,
    promise: promiseFn,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position={position} toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ============================================================================
// useToast Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ============================================================================
// Toast Container
// ============================================================================

interface ToastContainerProps {
  position: ToastPosition;
  toasts: Toast[];
  dismiss: (id: string) => void;
}

function ToastContainer({ position, toasts, dismiss }: ToastContainerProps) {
  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const typeStyles: Record<ToastType, { bg: string; icon: ReactNode }> = {
    success: {
      bg: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
      icon: (
        <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    loading: {
      bg: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
      icon: (
        <svg className="h-5 w-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
    },
  };

  const { bg, icon: defaultIcon } = typeStyles[toast.type];

  return (
    <div
      className={`
        flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg
        transition-all duration-200
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${bg}
        ${toast.className ?? ''}
      `}
      role="alert"
    >
      <div className="flex-shrink-0">{toast.icon ?? defaultIcon}</div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {toast.title}
          </p>
        )}
        {toast.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Standalone Toast Functions (for use without context)
// ============================================================================

let globalToast: ToastContextValue | null = null;

export function setGlobalToast(toastContext: ToastContextValue): void {
  globalToast = toastContext;
}

export const toast = {
  show: (options: ToastOptions) => {
    if (!globalToast) {
      console.warn('Toast not initialized. Wrap your app with ToastProvider.');
      return '';
    }
    return globalToast.toast(options);
  },
  success: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => {
    if (!globalToast) return '';
    return globalToast.success(title, options);
  },
  error: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => {
    if (!globalToast) return '';
    return globalToast.error(title, options);
  },
  warning: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => {
    if (!globalToast) return '';
    return globalToast.warning(title, options);
  },
  info: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => {
    if (!globalToast) return '';
    return globalToast.info(title, options);
  },
  loading: (title: string, options?: Omit<ToastOptions, 'type' | 'title'>) => {
    if (!globalToast) return '';
    return globalToast.loading(title, options);
  },
  dismiss: (id: string) => globalToast?.dismiss(id),
  dismissAll: () => globalToast?.dismissAll(),
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    if (!globalToast) return promise;
    return globalToast.promise(promise, options);
  },
};

// ============================================================================
// Exports
// ============================================================================

export default ToastProvider;
