'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Hook for creating portal containers
 */
export function usePortal(id: string = 'portal-root') {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let portalRoot = document.getElementById(id);

    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = id;
      document.body.appendChild(portalRoot);
    }

    setContainer(portalRoot);

    return () => {
      // Only remove if we created it and it's empty
      if (portalRoot && portalRoot.childNodes.length === 0) {
        portalRoot.remove();
      }
    };
  }, [id]);

  return container;
}

/**
 * Create a portal that renders content to a specific container
 */
export function Portal({
  children,
  containerId = 'portal-root',
}: {
  children: React.ReactNode;
  containerId?: string;
}) {
  const container = usePortal(containerId);

  if (!container) return null;

  return createPortal(children, container);
}

/**
 * Hook for managing portal state and container
 */
export function usePortalState(portalId?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const container = usePortal(portalId);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    container,
    Portal: ({ children }: { children: React.ReactNode }) =>
      isOpen && container ? createPortal(children, container) : null,
  };
}

/**
 * Hook for managing layered portals (z-index stacking)
 */
export function useLayeredPortal(baseZIndex: number = 1000) {
  const layerRef = useRef(0);
  const [layers, setLayers] = useState<Map<string, number>>(new Map());

  const addLayer = useCallback(
    (id: string) => {
      layerRef.current += 1;
      setLayers((prev) => new Map(prev).set(id, baseZIndex + layerRef.current));
      return baseZIndex + layerRef.current;
    },
    [baseZIndex]
  );

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getZIndex = useCallback(
    (id: string) => layers.get(id) ?? baseZIndex,
    [layers, baseZIndex]
  );

  const isTopLayer = useCallback(
    (id: string) => {
      const layerValues = Array.from(layers.values());
      const maxZ = Math.max(...layerValues, 0);
      return layers.get(id) === maxZ;
    },
    [layers]
  );

  return {
    addLayer,
    removeLayer,
    getZIndex,
    isTopLayer,
    layerCount: layers.size,
  };
}

/**
 * Component for rendering portal content with overlay
 */
export function PortalOverlay({
  children,
  isOpen,
  onClose,
  zIndex = 1000,
  className = '',
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  className?: string;
}) {
  const container = usePortal('overlay-root');

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !container) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${className}`}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative h-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>,
    container
  );
}

/**
 * Hook for tooltip portal positioning
 */
export function useTooltipPortal() {
  const triggerRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const container = usePortal('tooltip-root');

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return {
    triggerRef,
    position,
    container,
    updatePosition,
  };
}

export default Portal;
