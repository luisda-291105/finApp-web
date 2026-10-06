/**
 * @uso        Detecta si un elemento entró al viewport para animar reveal
 * @funciones  useReveal(options)
 * @datos      Recibe options de IntersectionObserver, no transforma data externa
 * @eventos    IntersectionObserver -> marca visible=true una sola vez
 * @estados    visible (boolean)
 * @usadoPor   Hero, Stats, Features, ComoFunciona
 */
import { useEffect, useRef, useState } from "react";

export function useReveal(options = { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
