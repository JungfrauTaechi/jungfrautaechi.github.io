import { useEffect, useRef, useState } from "react";

export function FullscreenFrame({ children, className = "", id, label }) {
  const frameRef = useRef(null);
  const buttonRef = useRef(null);
  const [native, setNative] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const active = native || expanded;
  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    const resize = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    if (active) buttonRef.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(resize);
  }, [active]);
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); setExpanded(false); buttonRef.current?.focus({ preventScroll: true }); }
      if (event.key === "Tab") {
        const controls = [...frameRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); };
  }, [expanded]);
  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    if (document.fullscreenElement === frameRef.current) { await document.exitFullscreen(); return; }
    if (frameRef.current.requestFullscreen) {
      try { await frameRef.current.requestFullscreen(); return; } catch { /* Use an in-page overlay when fullscreen is unavailable. */ }
    }
    setExpanded(true);
  };
  return <div ref={frameRef} id={id} className={`fullscreen-frame ${className}${active ? " is-fullscreen" : ""}${expanded ? " is-expanded" : ""}`} role={expanded ? "dialog" : undefined} aria-modal={expanded ? true : undefined} aria-label={expanded ? label : undefined}>
    {children}
    <button ref={buttonRef} className="panorama-fullscreen-button" type="button" onClick={toggle} aria-label={`${active ? "Vollbild schliessen" : "Vollbild öffnen"}: ${label}`} aria-pressed={active} title={active ? "Vollbild schliessen" : "Vollbild öffnen"}><span aria-hidden="true">{active ? "✕" : "⛶"}</span><span>{active ? "Schliessen" : "Vollbild"}</span></button>
  </div>;
}
