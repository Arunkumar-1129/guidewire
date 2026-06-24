import { useEffect, useRef } from 'react';

/**
 * Attach scroll-reveal animations using IntersectionObserver.
 * Elements with class `scroll-reveal`, `scroll-reveal-left`,
 * `scroll-reveal-right`, or `scroll-scale` get `.visible` added
 * when they enter the viewport.
 *
 * @param {string} selector  CSS selector for target elements
 * @param {object} options   IntersectionObserver options
 * @returns {React.RefObject} attach to the container element
 */
export function useScrollReveal(selector = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-scale', options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current || document;

    const targets = root.querySelectorAll(selector);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once revealed, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, options]);

  return containerRef;
}

/**
 * Animate a numeric value from 0 to `target` over `duration` ms.
 */
export function useCountUp(target, duration = 1200, start = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!start || !ref.current) return;
    const startTime = performance.now();
    const startVal = 0;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(startVal + (target - startVal) * eased);
      if (ref.current) ref.current.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, start]);

  return ref;
}
