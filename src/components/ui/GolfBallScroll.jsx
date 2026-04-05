import { useEffect, useRef } from "react";

export default function GolfBallScroll() {
  const ballRef = useRef(null);
  const state = useRef({ y: 0, targetY: 0, x: 0, rotation: 0, opacity: 0 });

  useEffect(() => {
    if (window.innerWidth < 768) return;

    let animFrame;
    const ball = ballRef.current;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = scrollY / maxScroll;
      state.current.targetY = scrollY * 0.6;
      state.current.opacity = scrollY < 100 ? 0 : progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 1;
    };

    const animate = () => {
      const s = state.current;
      s.y += (s.targetY - s.y) * 0.08;
      s.rotation += 2;
      s.x = Math.sin(s.y * 0.01) * 30;

      if (ball) {
        ball.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`;
        ball.style.opacity = s.opacity;
      }
      animFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    animFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={ballRef}
      style={{
        position: "fixed",
        top: 80,
        right: 40,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #ffffff, #d0d0d0)",
        boxShadow: "2px 4px 12px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(0,0,0,0.1)",
        opacity: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {[
        { top: "30%", left: "20%" },
        { top: "50%", left: "60%" },
        { top: "65%", left: "30%" },
        { top: "25%", left: "55%" },
        { top: "55%", left: "15%" },
      ].map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          top: d.top, left: d.left,
          width: 2, height: 2,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.12)",
        }} />
      ))}
    </div>
  );
}
