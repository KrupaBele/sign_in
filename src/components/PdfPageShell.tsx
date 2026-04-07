import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * Positions signature/placeholder overlays in the same coordinate space as the
 * visible PDF canvas. Stored x/y are in baseWidth units (default 600); when CSS
 * scales the canvas (e.g. max-width: 100% on mobile), multiply by canvasW/baseWidth.
 */
export function signatureOverlayStyle(
  x: number,
  y: number,
  canvasW: number,
  baseWidth: number,
  zoom: number
): React.CSSProperties {
  if (canvasW > 0) {
    const s = canvasW / baseWidth;
    return {
      left: (x - 60) * s,
      top: (y - 20) * s,
      width: 120 * s,
      height: 40 * s,
    };
  }
  return {
    left: x * zoom - 60 * zoom,
    top: y * zoom - 20 * zoom,
    width: `${120 * zoom}px`,
    height: `${40 * zoom}px`,
  };
}

type PdfPageShellProps = {
  zoom: number;
  className: string;
  onClick: (e: React.MouseEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  children: React.ReactNode;
  overlays: (canvasW: number) => React.ReactNode;
};

export function PdfPageShell({
  zoom,
  className,
  onClick,
  onDrop,
  onDragOver,
  children,
  overlays,
}: PdfPageShellProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const c = el.querySelector("canvas");
      setCanvasW(c ? c.getBoundingClientRect().width : 0);
    };

    measure();

    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });

    const c = el.querySelector("canvas");
    let ro: ResizeObserver | null = null;
    if (c) {
      ro = new ResizeObserver(measure);
      ro.observe(c);
    }

    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, [zoom]);

  return (
    <div
      ref={wrapRef}
      className={className}
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
      {overlays(canvasW)}
    </div>
  );
}
