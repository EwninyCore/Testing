// matrix.js
export function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
    const drops = new Array(Math.floor(canvas.width/20)).fill(0);

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = '20px monospace';

        drops.forEach((y, i) => {
            ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*20, y*20);
            drops[i] = y > canvas.height/20 ? 0 : y + 1.5;
        });

        requestAnimationFrame(draw);
    };
    draw();
}
