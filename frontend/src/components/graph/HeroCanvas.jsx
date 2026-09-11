import React, { useEffect, useRef } from 'react';

export function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;
    let W = 0, H = 0;
    let animId;

    function resize() {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      W = wrap.clientWidth || Math.round(rect.width) || 520;
      H = wrap.clientHeight || Math.round(rect.height) || 420;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(200, W) * dpr;
      canvas.height = Math.max(200, H) * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    // Rich topology nodes: Flagged scatter-gather mule ring + legitimate background accounts
    const heroNodes = [
      // Flagged mule cluster (Red / Hot)
      { id: 'ACC-7734', label: '7734', type: 'acc', sub: 'Hub Account', x: 0.38, y: 0.28, vx: 0.0002, vy: 0.00015, hot: true },
      { id: 'ACC-2210', label: '2210', type: 'acc', sub: 'Scatter Leg', x: 0.22, y: 0.52, vx: -0.00015, vy: 0.0002, hot: true },
      { id: 'ACC-5589', label: '5589', type: 'acc', sub: 'Scatter Leg', x: 0.54, y: 0.52, vx: 0.0002, vy: -0.00015, hot: true },
      { id: 'ACC-9081', label: '9081', type: 'acc', sub: 'Cash-out Leg', x: 0.38, y: 0.75, vx: -0.00015, vy: -0.0002, hot: true },
      { id: 'DEV-CF', label: 'CF19', type: 'dev', sub: 'Shared Device', x: 0.16, y: 0.32, vx: 0.0001, vy: -0.00015, hot: true },
      { id: 'NET-58', label: '.58', type: 'net', sub: 'Mule Subnet', x: 0.62, y: 0.32, vx: -0.00015, vy: 0.0001, hot: true },

      // Background legitimate accounts (Cool blue, amber, violet)
      { id: 'ACC-1123', label: '1123', type: 'acc', sub: 'Clean Account', x: 0.78, y: 0.22, vx: 0.0002, vy: 0.00015, hot: false },
      { id: 'ACC-8890', label: '8890', type: 'acc', sub: 'Clean Account', x: 0.86, y: 0.56, vx: -0.00015, vy: -0.0002, hot: false },
      { id: 'ACC-3345', label: '3345', type: 'acc', sub: 'Clean Account', x: 0.74, y: 0.78, vx: 0.00025, vy: -0.00015, hot: false },
      { id: 'DEV-77', label: '77CX', type: 'dev', sub: 'Clean Device', x: 0.88, y: 0.36, vx: -0.0001, vy: 0.00015, hot: false },
      { id: 'NET-192', label: '.192', type: 'net', sub: 'ISP Subnet', x: 0.66, y: 0.62, vx: 0.00015, vy: 0.0001, hot: false },
      { id: 'ACC-4412', label: '4412', type: 'acc', sub: 'Clean Account', x: 0.12, y: 0.72, vx: -0.00015, vy: 0.0001, hot: false },
      { id: 'ACC-6671', label: '6671', type: 'acc', sub: 'Clean Account', x: 0.28, y: 0.15, vx: 0.0001, vy: 0.00015, hot: false },
    ];

    const heroEdges = [
      // Scatter-gather flows (Red hot, fast pulses)
      { from: 0, to: 1, hot: true, speed: 1.3 },
      { from: 0, to: 2, hot: true, speed: 1.5 },
      { from: 1, to: 3, hot: true, speed: 1.4 },
      { from: 2, to: 3, hot: true, speed: 1.2 },
      { from: 0, to: 4, hot: true, speed: 0.7, dash: true },
      { from: 3, to: 4, hot: true, speed: 0.7, dash: true },
      { from: 0, to: 5, hot: true, speed: 0.6, dash: true },
      { from: 2, to: 5, hot: true, speed: 0.6, dash: true },

      // Background connections (Faint subtle lines)
      { from: 6, to: 7, hot: false, speed: 0.3 },
      { from: 7, to: 8, hot: false, speed: 0.25 },
      { from: 6, to: 9, hot: false, speed: 0.2, dash: true },
      { from: 8, to: 10, hot: false, speed: 0.2, dash: true },
      { from: 11, to: 1, hot: false, speed: 0.2 },
      { from: 12, to: 0, hot: false, speed: 0.25 },
    ];

    let mousePos = { x: -999, y: -999 };
    let hoveredNode = null;

    const handleMouseMove = e => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.x = -999;
      mousePos.y = -999;
      hoveredNode = null;
    };

    wrap.addEventListener('mousemove', handleMouseMove);
    wrap.addEventListener('mouseleave', handleMouseLeave);

    const tStart = performance.now();

    function loop() {
      animId = requestAnimationFrame(loop);
      if (!W || !H || W === 0 || H === 0) {
        resize();
        if (!W || !H) return;
      }

      ctx.clearRect(0, 0, W, H);
      const elapsed = (performance.now() - tStart) / 1000;

      // Update positions gently within bounds
      heroNodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0.08 || n.x > 0.92) n.vx *= -1;
        if (n.y < 0.10 || n.y > 0.90) n.vy *= -1;
      });

      // Check hover
      hoveredNode = null;
      heroNodes.forEach(n => {
        const px = n.x * W, py = n.y * H;
        const dist = Math.hypot(mousePos.x - px, mousePos.y - py);
        if (dist < 22) hoveredNode = n;
      });

      // Draw Edges
      heroEdges.forEach((e, idx) => {
        const a = heroNodes[e.from], b = heroNodes[e.to];
        const ax = a.x * W, ay = a.y * H;
        const bx = b.x * W, by = b.y * H;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);

        if (e.hot) {
          ctx.strokeStyle = 'rgba(229, 72, 77, 0.55)';
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = 'rgba(76, 141, 255, 0.22)';
          ctx.lineWidth = 1.0;
        }

        if (e.dash) {
          ctx.setLineDash([3, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Flow pulse particles
        const p = (elapsed * (e.speed || 1.0) + (idx * 0.17)) % 1;
        const px = ax + (bx - ax) * p;
        const py = ay + (by - ay) * p;

        ctx.beginPath();
        ctx.arc(px, py, e.hot ? 2.8 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = e.hot ? '#FF8A8D' : '#8BC2FF';
        ctx.shadowColor = e.hot ? '#E5484D' : '#4C8DFF';
        ctx.shadowBlur = e.hot ? 6 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      heroNodes.forEach(n => {
        const px = n.x * W, py = n.y * H;
        const isHovered = (hoveredNode === n);
        const radius = n.hot ? 14 : 11;

        // Outer glow / radar ring on hot nodes
        if (n.hot) {
          const pulse = 1 + 0.18 * Math.sin(elapsed * 3.5 + n.x * 10);
          ctx.beginPath();
          ctx.arc(px, py, (radius + 6) * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(229, 72, 77, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Base circle
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? radius + 3 : radius, 0, Math.PI * 2);
        if (n.hot) {
          ctx.fillStyle = '#E5484D';
        } else if (n.type === 'dev') {
          ctx.fillStyle = '#F2A93C';
        } else if (n.type === 'net') {
          ctx.fillStyle = '#8B5CF6';
        } else {
          ctx.fillStyle = '#4C8DFF';
        }
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? radius + 3 : radius, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(11, 15, 26, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label text
        ctx.fillStyle = '#0B0F1A';
        ctx.font = '700 8.5px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, px, py + 0.5);

        // Tooltip on hover
        if (isHovered) {
          ctx.fillStyle = 'rgba(11, 15, 26, 0.92)';
          ctx.strokeStyle = n.hot ? '#E5484D' : '#4C8DFF';
          ctx.lineWidth = 1;
          const ttText = `${n.id} (${n.sub})`;
          ctx.font = '600 10px "Inter", sans-serif';
          const tw = ctx.measureText(ttText).width + 16;
          const th = 22;
          const ttx = Math.min(Math.max(10, px - tw / 2), W - tw - 10);
          const tty = Math.max(10, py - 32);

          ctx.fillRect(ttx, tty, tw, th);
          ctx.strokeRect(ttx, tty, tw, th);

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ttText, ttx + tw / 2, tty + th / 2);
        }
      });
    }

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      wrap.removeEventListener('mousemove', handleMouseMove);
      wrap.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} id="heroCanvas" />;
}
