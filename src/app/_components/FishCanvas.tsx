"use client";

import { useEffect, useRef } from "react";

function FishCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  interface Fish {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    shape: number; // 0=small circle, 1=long ellipse, 2=diamond, 3=bubble
    color: number; // 0=blue, 1=green, 2=teal, 3=pink (rare)
  }

  // Tweak number of fish here:
  const fishCount = 256;
  // Store fish in a ref so we don’t lose them on re-renders:
  const fishes = useRef<Fish[]>([]);

  /**
   * Draw a fish given its shape & color.
   */
  const drawFish = (
    ctx: CanvasRenderingContext2D,
    fish: Fish,
    angle: number,
  ) => {
    const { size, shape, color } = fish;

    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(angle);

    // Define gradient for the fish’s body based on chosen color
    const gradient = ctx.createLinearGradient(-size, 0, size, 0);
    switch (color) {
      // Pastel Blue
      case 0:
        gradient.addColorStop(0, "rgba(191, 219, 254, 0.7)"); // blue-200
        gradient.addColorStop(1, "rgba(147, 197, 253, 0.9)"); // blue-300
        break;
      // Pastel Green
      case 1:
        gradient.addColorStop(0, "rgba(167, 243, 208, 0.7)"); // green-200
        gradient.addColorStop(1, "rgba(110, 231, 183, 0.9)"); // green-300
        break;
      // Teal / Aqua
      case 2:
        gradient.addColorStop(0, "rgba(129, 230, 217, 0.7)"); // teal-200
        gradient.addColorStop(1, "rgba(94, 234, 212, 0.9)"); // teal-300
        break;
      // Rare Pink
      default:
        gradient.addColorStop(0, "rgba(244, 114, 182, 0.7)"); // pink-300
        gradient.addColorStop(1, "rgba(236, 72, 153, 0.9)"); // pink-500
    }
    ctx.fillStyle = gradient;

    // A subtle, bright shadow to stand out on the background
    ctx.shadowColor = "rgba(255,255,255,0.3)";
    ctx.shadowBlur = 10;

    // Draw the shape
    ctx.beginPath();
    switch (shape) {
      // 0 = small round
      case 0:
        ctx.ellipse(0, 0, size, size, 0, 0, 2 * Math.PI);
        break;
      // 1 = longer ellipse
      case 1:
        ctx.ellipse(0, 0, size * 1.5, size, 0, 0, 2 * Math.PI);
        break;
      // 2 = diamond shape
      case 2:
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        break;
      // 3 = bubble shape (two circles)
      default:
        ctx.ellipse(0, 0, size, size, 0, 0, 2 * Math.PI);
        ctx.moveTo(size * 0.6, 0);
        ctx.ellipse(size * 0.6, 0, size * 0.5, size * 0.5, 0, 0, 2 * Math.PI);
        break;
    }
    ctx.fill();

    ctx.restore();
  };

  const updateAndDrawFishes = (ctx: CanvasRenderingContext2D) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Semi-transparent green background
    ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
    ctx.fillRect(0, 0, width, height);

    fishes.current.forEach((fish) => {
      // Small random wandering
      fish.vx += (Math.random() - 0.5) * 0.02;
      fish.vy += (Math.random() - 0.5) * 0.02;

      // Slightly higher speed for diamond shapes, for variety
      const maxSpeed = fish.shape === 2 ? 2.2 : 1.6;
      const speed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
      if (speed > maxSpeed) {
        fish.vx = (fish.vx / speed) * maxSpeed;
        fish.vy = (fish.vy / speed) * maxSpeed;
      }

      // Move
      fish.x += fish.vx;
      fish.y += fish.vy;

      // Wrap around screen edges
      if (fish.x < 0) fish.x = width;
      if (fish.x > width) fish.x = 0;
      if (fish.y < 0) fish.y = height;
      if (fish.y > height) fish.y = 0;

      // Calculate direction for drawing
      const angle = Math.atan2(fish.vy, fish.vx);
      drawFish(ctx, fish, angle);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize fish array
    fishes.current = Array.from({ length: fishCount }, () => {
      // Mostly blue/green/teal fish, rare pink
      const roll = Math.random();
      let color: number;
      if (roll < 0.45)
        color = 0; // pastel blue
      else if (roll < 0.85)
        color = 1; // pastel green
      else if (roll < 0.95)
        color = 2; // teal
      else color = 3; // rare pink

      return {
        x: Math.random() * window.innerWidth, // Use window width instead of canvas
        y: Math.random() * window.innerHeight, // Use window height instead of canvas
        vx: (Math.random() - 0.5) * 250,
        vy: (Math.random() - 0.5) * 250,
        size: 2 + Math.random() * 1, // random size 8..16
        shape: Math.floor(Math.random() * 4), // pick one of 4 shapes
        color,
      };
    });

    // Animation loop
    const animate = () => {
      updateAndDrawFishes(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Re-handle canvas size on resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full"
    />
  );
}

export default FishCanvas;
