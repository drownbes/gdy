import MainLoop from './../../dist/mainloop.js';
// tslint:disable-next-line
CanvasRenderingContext2D.prototype.circle = function (x, y, r, fillStyle) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, false);
    if (fillStyle) {
        this.fillStyle = fillStyle;
    }
    this.fill();
};
class Planet {
    constructor({ center, radius, orbitRadius, velocity, color }) {
        this.orbitRadius = 0;
        this.velocity = 0;
        this.theta = 0;
        this.color = 'black';
        this.center = center;
        this.x = center.x + orbitRadius;
        this.y = center.y;
        this.lastX = this.x;
        this.lastY = this.y;
        this.radius = radius;
        this.orbitRadius = orbitRadius;
        this.velocity = velocity;
        this.theta = 0;
        this.color = color;
    }
    update(delta) {
        this.lastX = this.x;
        this.lastY = this.y;
        this.theta += this.velocity * delta;
        this.x = this.center.x + Math.cos(this.theta) * this.orbitRadius;
        this.y = this.center.y + Math.sin(this.theta) * this.orbitRadius;
    }
    draw(context, interpolationPercentage) {
        var x = this.lastX + (this.x - this.lastX) * interpolationPercentage, y = this.lastY + (this.y - this.lastY) * interpolationPercentage;
        context.circle(x, y, this.radius, this.color);
    }
    ;
}
class Scene {
    constructor() {
        this.planets = [];
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.fpsCounter = document.getElementById('fpscounter');
        this.fpsValue = document.getElementById('fpsvalue');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.setup();
    }
    setup() {
        let smallerDimension = Math.min(window.innerWidth, window.innerHeight), earthOrbitRadius = smallerDimension * 0.38, moonOrbitRadius = smallerDimension * 0.10, moonRadius = smallerDimension * 0.01, sunRadius = earthOrbitRadius * 0.5, earthRadius = earthOrbitRadius * 0.15, sun = new Planet({
            center: { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 },
            radius: sunRadius,
            velocity: 0,
            orbitRadius: 0,
            color: '#FFD000'
        }), earth = new Planet({
            center: sun,
            radius: earthRadius,
            orbitRadius: earthOrbitRadius,
            velocity: 0.03 * Math.PI / 180,
            color: 'blue'
        }), moon = new Planet({
            center: earth,
            radius: moonRadius,
            orbitRadius: moonOrbitRadius,
            velocity: 0.1 * Math.PI / 180,
            color: 'gray'
        });
        this.planets = [sun, earth, moon];
        document.getElementById('fps').addEventListener('input', (e) => {
            this.fpsValue.textContent = Math.round(parseInt(e.target.value, 10)).toString();
        });
        // Throttle the FPS when the slider value is set.
        document.getElementById('fps').addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            this.mainLoop.setMaxAllowedFPS(val === 60 ? Infinity : val);
        });
    }
    start() {
        this.mainLoop = new MainLoop({
            draw: this.draw.bind(this),
            update: this.update.bind(this),
            end: this.end.bind(this)
        });
        this.mainLoop.start();
    }
    update(delta) {
        this.planets.forEach(planet => planet.update(delta));
    }
    draw(interpolationPercentage) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.planets.forEach(planet => planet.draw(this.context, interpolationPercentage));
    }
    end(fps, panic) {
        this.fpsCounter.textContent = Math.round(fps) + ' FPS';
        if (panic) {
            var discardedTime = Math.round(this.mainLoop.resetFrameDelta());
            console.warn(`Main loop panicked, probably because the browser
        tab was put in the background. Discarding ${discardedTime} ms`);
        }
    }
}
const scene = new Scene();
scene.start();
