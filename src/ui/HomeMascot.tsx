import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Decorative companion. Keyboard feedback comes from the real primary action. */
export function HomeMascot({ attention }: { attention: boolean }) {
  const reducedMotion = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const inView = useRef(true);
  const [visible, setVisible] = useState(true);
  const [curious, setCurious] = useState(false);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      setVisible(entry.isIntersecting && !document.hidden);
    });
    const onVisibility = () => setVisible(!document.hidden && inView.current);
    observer.observe(element);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(touchTimer.current);
    };
  }, []);

  const reacting = attention || curious;
  return (
    <div
      ref={container}
      className="home-mascot-wrap"
      aria-hidden="true"
      data-playing={visible && !reducedMotion}
      data-reacting={reacting}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setCurious(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setCurious(false);
      }}
      onPointerCancel={() => setCurious(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== 'touch') return;
        clearTimeout(touchTimer.current);
        setCurious(true);
        touchTimer.current = setTimeout(() => setCurious(false), 900);
      }}
    >
      <span className="mascot-ground" />
      <div className="mascot-idle">
        <motion.div
          className="mascot-pose"
          animate={{
            rotate: reducedMotion ? 0 : reacting ? -4 : 0,
            y: reducedMotion ? 0 : reacting ? -4 : 0,
            x: reducedMotion ? 0 : attention ? -5 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}icons/sane-mascot.png`}
            alt=""
            width="1431"
            height="1100"
            className="home-mascot"
            draggable={false}
          />
          <span className="mascot-eyelids">
            <span className="mascot-lid mascot-lid-left" />
            <span className="mascot-lid mascot-lid-right" />
          </span>
        </motion.div>
      </div>
    </div>
  );
}
