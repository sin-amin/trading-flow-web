      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const toast = document.getElementById("toast");

      // Video facade — click-to-load YouTube (nothing loads until clicked).
      document.querySelectorAll(".video-facade").forEach((btn) => {
        btn.addEventListener("click", () => {
          const videoId = btn.dataset.videoId;
          if (!videoId) {
            toast.textContent = "Video coming soon — contact us for a preview.";
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2200);
            return;
          }
          const iframe = document.createElement("iframe");
          iframe.title = "Official Ebook Introduction";
          iframe.loading = "lazy";
          iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
          iframe.allowFullscreen = true;
          iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
          btn.replaceWith(iframe);
        });
      });

      // FAQ accordion
      document.querySelectorAll(".faq-btn").forEach((btn) =>
        btn.addEventListener("click", () => {
          const item = btn.parentElement;
          const wasOpen = item.classList.contains("open");
          document
            .querySelectorAll(".faq-item.open")
            .forEach((i) => i.classList.remove("open"));
          if (!wasOpen) item.classList.add("open");
        }),
      );

      // Wallet copy toast
      document.querySelectorAll(".copyWallet").forEach(button => {

  button.addEventListener("click", async () => {

    const sourceId = button.dataset.copy;
    const source = document.getElementById(sourceId);

    if (!source) return;

    const text = source.textContent.trim();
    const label = button.dataset.label || "Wallet address copied.";

    try {

      await navigator.clipboard.writeText(text);

      toast.textContent = label;
      toast.classList.add("show");

    } catch (error) {

      // Fallback for browsers where Clipboard API is unavailable
      const input = document.createElement("textarea");

      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";

      document.body.appendChild(input);
      input.select();

      try {
        document.execCommand("copy");

        toast.textContent = label;
        toast.classList.add("show");

      } catch (e) {

        toast.textContent = "Copy failed — please copy manually.";
        toast.classList.add("show");

      }

      document.body.removeChild(input);
    }

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);

  });

});

      // Scroll reveal — trigger as soon as an element approaches the viewport
      // so content never "pops in" late during fast scrolling.
      const reveal = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (!entry.isIntersecting) return;
            entry.target.style.animationDelay = `${Math.min(index * 35, 140)}ms`;
            entry.target.classList.add("visible");
            reveal.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px 120px 0px" },
      );
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => reveal.observe(el));

      // Animated candlestick market backdrop: green bullish, red bearish.
      const canvas = document.getElementById("marketCanvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      let W = 0,
        H = 0,
        DPR = 1,
        candles = [],
        trend = [],
        raf = 0,
        running = false;

      function rand(min, max) {
        return Math.random() * (max - min) + min;
      }
      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 1.5);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        const count = Math.max(52, Math.floor(W / 24));
        candles = [];
        trend = [];
        let price = H * 0.56;
        for (let i = 0; i < count; i++) {
          const drift = rand(-18, 18) + Math.sin(i / 7) * 7;
          const open = price;
          const close = Math.max(H * 0.16, Math.min(H * 0.82, open + drift));
          const body = Math.max(4, Math.abs(close - open));
          const high = Math.max(open, close) - rand(12, 34);
          const low = Math.min(open, close) + rand(12, 34);
          // In screen coordinates, smaller y = higher price.
          const hi = Math.max(12, high);
          const lo = Math.min(H - 12, low);
          candles.push({
            x: 16 + i * ((W - 32) / (count - 1)),
            open,
            close,
            high: hi,
            low: lo,
            body,
            phase: rand(0, Math.PI * 2),
            speed: rand(0.00055, 0.00135),
            alpha: rand(0.055, 0.13),
          });
          price = close * 0.86 + price * 0.14;
          trend.push({ x: candles[i].x, y: close });
        }
      }

      function draw(time) {
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";

        // Soft chart wash.
        const wash = ctx.createRadialGradient(
          W * 0.5,
          H * 0.46,
          0,
          W * 0.5,
          H * 0.46,
          Math.max(W, H) * 0.65,
        );
        wash.addColorStop(0, "rgba(255,255,255,.018)");
        wash.addColorStop(0.45, "rgba(0,0,0,0)");
        wash.addColorStop(1, "rgba(0,0,0,.28)");
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, W, H);

        // Price/trend line behind candles.
        ctx.beginPath();
        trend.forEach((p, i) => {
          const y =
            p.y + (reduced ? 0 : Math.sin(time * 0.0009 + i * 0.18) * 1.7);
          if (i === 0) ctx.moveTo(p.x, y);
          else ctx.lineTo(p.x, y);
        });
        ctx.strokeStyle = "rgba(255,255,255,.075)";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(255,255,255,.08)";
        ctx.stroke();
        ctx.shadowBlur = 0;

        candles.forEach((c, i) => {
          const float = reduced ? 0 : Math.sin(time * c.speed + c.phase) * 1.7;
          const o = c.open + float;
          const cl = c.close + float;
          const hi =
            Math.min(o, cl) - Math.abs(c.high - Math.min(c.open, c.close));
          const lo =
            Math.max(o, cl) + Math.abs(c.low - Math.max(c.open, c.close));
          const bullish = cl < o; // upward price movement in screen space
          const green = "rgba(34,197,94," + c.alpha + ")";
          const red = "rgba(239,68,68," + c.alpha + ")";
          const edge = bullish
            ? "rgba(102,230,141,.42)"
            : "rgba(255,115,115,.36)";
          const top = Math.min(o, cl);
          const bodyH = Math.max(5, Math.abs(cl - o));

          ctx.strokeStyle = edge;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(c.x, hi);
          ctx.lineTo(c.x, lo);
          ctx.stroke();

          ctx.fillStyle = bullish ? green : red;
          ctx.fillRect(c.x - 4.5, top, 9, bodyH);
          ctx.strokeStyle = edge;
          ctx.strokeRect(c.x - 4.5, top, 9, bodyH);
        });
        ctx.shadowBlur = 0;

        if (!reduced && running) raf = requestAnimationFrame(draw);
      }

      function startLoop() {
        if (reduced || running) return;
        running = true;
        raf = requestAnimationFrame(draw);
      }

      function stopLoop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }

      resize();
      window.addEventListener("resize", resize, { passive: true });
      draw(0);
      startLoop();

      // Pause the animation entirely when the tab is hidden to save CPU/battery.
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopLoop();
        else startLoop();
      });

      // Very subtle pointer depth; kept intentionally restrained.
      if (!reduced) {
        const backdrop = document.querySelector(".market-backdrop");
        let tx = 0,
          ty = 0,
          cx = 0,
          cy = 0;
        function parallax() {
          if (document.hidden) {
            rafP = requestAnimationFrame(parallax);
            return;
          }
          cx += (tx - cx) * 0.045;
          cy += (ty - cy) * 0.045;
          backdrop.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
          // Stop the loop once converged; restarted on the next pointer move.
          if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
            rafP = 0;
            return;
          }
          rafP = requestAnimationFrame(parallax);
        }
        let rafP = 0;
        window.addEventListener(
          "pointermove",
          (e) => {
            tx = (e.clientX / window.innerWidth - 0.5) * 10;
            ty = (e.clientY / window.innerHeight - 0.5) * 7;
            if (!rafP) rafP = requestAnimationFrame(parallax);
          },
          { passive: true },
        );
      }