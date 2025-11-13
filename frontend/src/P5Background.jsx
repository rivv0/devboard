import { useEffect, useRef } from 'react';
import p5 from 'p5';

function P5Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let particles = [];
      
      class Particle {
        constructor() {
          this.x = p.random(p.windowWidth);
          this.y = p.random(p.windowHeight);
          this.vx = p.random(-0.3, 0.3);
          this.vy = p.random(-0.3, 0.3);
          this.size = p.random(1, 2);
        }
        
        update() {
          this.x += this.vx;
          this.y += this.vy;
          
          if (this.x < 0 || this.x > p.windowWidth) this.vx *= -1;
          if (this.y < 0 || this.y > p.windowHeight) this.vy *= -1;
        }
        
        display() {
          p.noStroke();
          p.fill(60, 60, 60, 80);
          p.circle(this.x, this.y, this.size);
        }
      }
      
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        for (let i = 0; i < 60; i++) {
          particles.push(new Particle());
        }
      };
      
      p.draw = () => {
        p.background(8, 8, 10);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].display();
          
          for (let j = i + 1; j < particles.length; j++) {
            let d = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            if (d < 120) {
              p.stroke(40, 40, 45, p.map(d, 0, 120, 60, 0));
              p.strokeWeight(0.5);
              p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            }
          }
        }
      };
      
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch, canvasRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />;
}

export default P5Background;
