import React, { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 56;

function createParticles(width, height) {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    x: ((index * 73.37) % 997) / 997 * width,
    y: ((index * 193.91) % 991) / 991 * height,
    radius: 1 + (index % 3) * 0.45,
    phase: index * 1.71,
    speed: 0.12 + (index % 5) * 0.025,
    color: '15, 118, 110'
  }));
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let particles = [];
    let frameId;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = createParticles(width, height);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const points = particles.map((particle) => ({
        ...particle,
        drawX: particle.x + Math.sin(time * particle.speed + particle.phase) * 12,
        drawY: particle.y + Math.cos(time * particle.speed + particle.phase) * 9
      }));

      points.forEach((point, index) => {
        for (let next = index + 1; next < points.length; next += 1) {
          const other = points[next];
          const distance = Math.hypot(point.drawX - other.drawX, point.drawY - other.drawY);
          if (distance < 115) {
            context.strokeStyle = `rgba(${point.color}, ${(1 - distance / 115) * 0.12})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(point.drawX, point.drawY);
            context.lineTo(other.drawX, other.drawY);
            context.stroke();
          }
        }
        context.fillStyle = `rgba(${point.color}, 0.42)`;
        context.beginPath();
        context.arc(point.drawX, point.drawY, point.radius, 0, Math.PI * 2);
        context.fill();
      });

      if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.4
      }}
    />
  );
}
