document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("lightning-canvas");
    const ctx = canvas.getContext("2d");
    const thunder = document.getElementById("thunder-sound");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // ⚡ FRAKTÁL VILLÁM
    function createBranch(x, y, angle, length, depth) {
        if (depth <= 0) return;

        const x2 = x + Math.cos(angle) * length;
        const y2 = y + Math.sin(angle) * length;

        // glow rétegek
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = depth;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "cyan";

        ctx.stroke();

        // fő ág folytatás
        createBranch(
            x2,
            y2,
            angle + (Math.random() - 0.5) * 0.3,
            length * 0.9,
            depth - 1
        );

        // elágazás (nem mindig)
        if (Math.random() > 0.7) {
            createBranch(
                x2,
                y2,
                angle + (Math.random() - 0.5),
                length * 0.7,
                depth - 2
            );
        }
    }

    function drawRealLightning(startX, startY) {
        createBranch(startX, startY, Math.PI / 2 + (Math.random() - 0.5) * 0.5, Math.random() * 40 + 30, 12);
    }

    // 💥 villanás
    function flash() {
        const div = document.createElement("div");
        div.style.position = "fixed";
        div.style.top = 0;
        div.style.left = 0;
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.background = "white";
        div.style.opacity = "0.8";
        div.style.zIndex = "9999";

        document.body.appendChild(div);

        setTimeout(() => div.remove(), 100);
    }

    function stormStrike() {
        const text = document.getElementById("stormy-text");
        if (!text) return;

        const rect = text.getBoundingClientRect();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const strikes = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < strikes; i++) {
            let x = rect.left + Math.random() * rect.width;
            let y = rect.top + rect.height / 2;

            drawRealLightning(x, y);
        }

        flash();

        setTimeout(() => {
            thunder.currentTime = 0;
            thunder.play().catch(() => {});
        }, 300 + Math.random() * 500);

        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 200);
    }

    // ⛈️ random idő (sokkal élethűbb)
    function loopStorm() {
        stormStrike();
        setTimeout(loopStorm, 5000);
    }

    loopStorm();
});