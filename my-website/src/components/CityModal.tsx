"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./CityModal.css";

interface CityModalProps {
  city: "san-francisco" | "dubai" | null;
  onClose: () => void;
}

// san francisco content
const sfContent = {
  title: ["the", "golden", "gate", "city"],
  description:
    "a collage of my most cherished moments with the best people, city, cafe, events in san francisco, ca!",
  images: [
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770141794/sf-01_dkcx7g.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770141795/sf-02_bihrdk.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770141794/sf-03_nwflty.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770141793/sf-04_qmzugr.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770152654/sf-05_rbjofh.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770152649/sf-06_eq3j8e.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770156016/sf-08_hykuej.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770156014/sf-09_c6qdvc.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770156023/sf-10_upxhmi.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770156028/sf-11_nmtfrf.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1770156015/sf-12_htvhgx.jpg",
  ],
};

// dubai content
const dubaiContent = {
  title: ["habibi,", "welcome", "to", "dubai 😎"],
  description: "this page is still under construction 🚧, bear with me! 😭",
  images: [
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1738355118/IMG_7869_f1ddrm.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1738355118/IMG_7784_j6d0w4.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1738355117/IMG_7695_tpyquh.jpg",
    "https://res.cloudinary.com/dhajah4xb/image/upload/v1738355116/IMG_6936_h1szrb.jpg",
  ],
};

// ─── types ───────────────────────────────────────────────

type ImageDimensions = {
  src: string;
  width: number;
  height: number;
  aspect: number;
};

type RandomShotItem = {
  src: string;
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
  rotateDeg: number;
  zIndex: number;
  parallax: number;
};

type RandomShotLayout = {
  segmentWidthPx: number;
  segmentHeightPx: number;
  items: RandomShotItem[];
};

// ─── helpers ─────────────────────────────────────────────

// mulberry32 seeded rng — deterministic layout per city
const seededRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

// ─── component ───────────────────────────────────────────

export default function CityModal({ city, onClose }: CityModalProps) {
  // animation state
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [descriptionBox, setDescriptionBox] = useState<{
    leftPx: number;
    widthPx: number;
  } | null>(null);

  // dom refs
  const contentRef = useRef<HTMLDivElement | null>(null);
  const topLeftTitleRef = useRef<HTMLSpanElement | null>(null);
  const topRightTitleRef = useRef<HTMLSpanElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const content = city === "san-francisco" ? sfContent : dubaiContent;
  const baseImages = content.images;

  // preloaded image dimensions (preserves aspect ratios)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions[]>([]);

  // computed collage layout
  const [randomShot, setRandomShot] = useState<RandomShotLayout | null>(null);

  // drag state refs
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartOffsetXRef = useRef(0);
  const dragStartOffsetYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);

  // velocity tracking for momentum
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // drag-me cursor indicator
  const [dragIndicator, setDragIndicator] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // ─── close handler ───────────────────────────────────

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setShowContent(false);
    setIsVisible(false);
    // wait for panel collapse animation, then unmount
    setTimeout(onClose, 550);
  }, [onClose]);

  // ─── effects ─────────────────────────────────────────

  // preload images to get natural dimensions
  useEffect(() => {
    if (!city) {
      setImageDimensions([]);
      return;
    }
    let cancelled = false;
    const loadAll = async () => {
      const dims: ImageDimensions[] = await Promise.all(
        baseImages.map(
          (src) =>
            new Promise<ImageDimensions>((resolve) => {
              const img = new Image();
              img.onload = () => {
                resolve({
                  src,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  aspect: img.naturalHeight / img.naturalWidth,
                });
              };
              img.onerror = () => {
                resolve({ src, width: 1, height: 1, aspect: 1 });
              };
              img.src = src;
            })
        )
      );
      if (!cancelled) setImageDimensions(dims);
    };
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [city, baseImages]);

  // open / close lifecycle
  useEffect(() => {
    if (city) {
      setIsClosing(false);
      setDescriptionBox(null);
      setIsVisible(true);
      const timer = setTimeout(() => setShowContent(true), 400);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      setShowContent(false);
      setIsVisible(false);
      setIsClosing(false);
      setDescriptionBox(null);
    }
  }, [city]);

  // esc to close
  useEffect(() => {
    if (!city) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [city, handleClose]);

  // drag-me cursor visibility (hides over close button)
  useEffect(() => {
    if (!city) return;
    const onMove = (e: PointerEvent) => {
      const canvas = carouselRef.current;
      if (!canvas) return;
      const closeBtn = closeBtnRef.current;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const overClose = !!(el && closeBtn && closeBtn.contains(el));
      const inCanvas = !!(el && canvas.contains(el));

      if (overClose || !inCanvas) {
        if (dragIndicator.visible) {
          setDragIndicator((p) => ({ ...p, visible: false }));
        }
        return;
      }
      setDragIndicator({ visible: true, x: e.clientX, y: e.clientY });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [city, dragIndicator.visible]);

  // description box positioning (centered between title columns)
  useLayoutEffect(() => {
    if (!showContent) return;

    const SIDE_GAP_PX = 74;
    const DESCRIPTION_MAX_WIDTH_PX = 405.922;

    const compute = () => {
      const contentEl = contentRef.current;
      const leftTitleEl = topLeftTitleRef.current;
      const rightTitleEl = topRightTitleRef.current;
      if (!contentEl || !leftTitleEl || !rightTitleEl) return;

      const contentRect = contentEl.getBoundingClientRect();
      const leftRect = leftTitleEl.getBoundingClientRect();
      const rightRect = rightTitleEl.getBoundingClientRect();

      const leftEdgeInContent = leftRect.right - contentRect.left;
      const rightEdgeInContent = rightRect.left - contentRect.left;

      const innerLeftPx = leftEdgeInContent + SIDE_GAP_PX;
      const innerRightPx = rightEdgeInContent - SIDE_GAP_PX;
      const innerWidthPx = Math.max(0, innerRightPx - innerLeftPx);

      const widthPx = Math.min(innerWidthPx, DESCRIPTION_MAX_WIDTH_PX);
      const leftPx = innerLeftPx + Math.max(0, (innerWidthPx - widthPx) / 2);

      setDescriptionBox({ leftPx, widthPx });
    };

    compute();
    requestAnimationFrame(compute);
    const t = window.setTimeout(compute, 250);
    window.addEventListener("resize", compute);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", compute);
    };
  }, [showContent, city]);

  // compute collage layout from preloaded image dimensions
  useLayoutEffect(() => {
    if (!showContent) return;
    if (imageDimensions.length === 0) return;
    const el = carouselRef.current;
    if (!el) return;
    if (baseImages.length === 0) return;

    const compute = () => {
      const viewportW = el.clientWidth;
      const viewportH = el.clientHeight;
      if (!viewportW || !viewportH) return;

      const seed = city === "dubai" ? 0x0d0b0a1 : 0x51f0c0;
      const rand = seededRng(seed);

      // shuffle indices so the same photo doesn't repeat back-to-back
      const numCycles = Math.max(4, Math.ceil(24 / baseImages.length));
      const shuffledIndices: number[] = [];

      for (let cycle = 0; cycle < numCycles; cycle++) {
        const cycleIndices = Array.from(
          { length: baseImages.length },
          (_, i) => i
        );
        // fisher-yates shuffle
        for (let j = cycleIndices.length - 1; j > 0; j--) {
          const k = Math.floor(rand() * (j + 1));
          [cycleIndices[j], cycleIndices[k]] = [cycleIndices[k], cycleIndices[j]];
        }
        shuffledIndices.push(...cycleIndices);
      }

      const count = shuffledIndices.length;
      const baseStep = Math.max(240, viewportW * 0.2);
      const items: RandomShotItem[] = [];

      const estimatedSegmentWidth = count * baseStep;
      const centerClusterX = estimatedSegmentWidth * 0.4;

      for (let i = 0; i < count; i++) {
        const imgIdx = shuffledIndices[i];
        const src = baseImages[imgIdx];
        const imgDim = imageDimensions[imgIdx];
        const naturalAspect = imgDim?.aspect ?? 1;

        // varied sizes — small, medium, large
        const sizeRoll = rand();
        let w: number;
        if (sizeRoll < 0.25) {
          w = 180 + rand() * 120;
        } else if (sizeRoll < 0.6) {
          w = 300 + rand() * 180;
        } else {
          w = 420 + rand() * 200;
        }

        let h = w * naturalAspect;
        const maxH = viewportH * 0.92;
        if (h > maxH) h = maxH;

        // horizontal position with overlap variance
        let leftPx = i * baseStep + (rand() - 0.3) * (baseStep * 0.7);

        // pull some images toward center for density
        if (rand() < 0.35) {
          const pullStrength = 0.3 + rand() * 0.4;
          leftPx = leftPx + (centerClusterX - leftPx) * pullStrength;
        }

        // vertical position biased toward center (gaussian-ish)
        const centerY = (viewportH - h) / 2;
        const spread = (viewportH - h) * 0.35;
        const gaussianBias = (rand() + rand() + rand()) / 3;
        const topPx = Math.max(
          0,
          Math.min(viewportH - h, centerY + (gaussianBias - 0.5) * spread * 2)
        );

        const rotateDeg = (rand() * 2 - 1) * 1.8;
        const zIndex = 1 + Math.floor(rand() * 4);
        const parallax =
          zIndex === 1
            ? 0.25
            : zIndex === 2
              ? 0.12
              : zIndex === 3
                ? -0.08
                : -0.18;

        items.push({
          src,
          leftPx,
          topPx,
          widthPx: w,
          heightPx: h,
          rotateDeg,
          zIndex,
          parallax,
        });
      }

      const last = items[items.length - 1];
      const segmentWidthPx = last.leftPx + last.widthPx + baseStep;
      const segmentHeightPx = viewportH;
      setRandomShot({ segmentWidthPx, segmentHeightPx, items });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showContent, city, baseImages, imageDimensions]);

  // set initial scroll offset to center the collage
  useEffect(() => {
    if (!showContent) return;
    const carouselEl = carouselRef.current;
    if (!carouselEl || !randomShot || randomShot.segmentWidthPx <= 0) return;

    const segmentWidth = randomShot.segmentWidthPx;
    const segmentHeight = randomShot.segmentHeightPx;

    const jumpToMiddle = () => {
      offsetXRef.current = segmentWidth * 0.4;
      offsetYRef.current = segmentHeight * 0.5;
      carouselEl.style.setProperty("--rs-offset-x", `${offsetXRef.current}`);
      carouselEl.style.setProperty("--rs-offset-y", `${offsetYRef.current}`);
    };

    jumpToMiddle();
    const raf = requestAnimationFrame(jumpToMiddle);
    const t = window.setTimeout(jumpToMiddle, 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [showContent, randomShot]);

  // cleanup timers on unmount
  useEffect(() => {
    const raf = rafRef;
    const settle = settleTimeoutRef;
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (settle.current) window.clearTimeout(settle.current);
    };
  }, []);

  // ─── drag helpers ────────────────────────────────────

  const applyOffset = (nextOffsetX: number, nextOffsetY: number) => {
    const carouselEl = carouselRef.current;
    const rs = randomShot;
    if (!carouselEl || !rs) return;
    const { segmentWidthPx: sw, segmentHeightPx: sh } = rs;
    if (!sw || !sh) return;

    // keep offsets within [segment, 2×segment) for seamless tiling
    offsetXRef.current = ((nextOffsetX % sw) + sw) % sw + sw;
    offsetYRef.current = ((nextOffsetY % sh) + sh) % sh + sh;

    carouselEl.style.setProperty("--rs-offset-x", `${offsetXRef.current}`);
    carouselEl.style.setProperty("--rs-offset-y", `${offsetYRef.current}`);
  };

  const onCanvasPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!randomShot || e.button !== 0) return;
    const el = carouselRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    setDragIndicator((p) => ({ ...p, visible: true, x: e.clientX, y: e.clientY }));

    dragPointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartOffsetXRef.current = offsetXRef.current;
    dragStartOffsetYRef.current = offsetYRef.current;
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    velocityRef.current = { vx: 0, vy: 0 };

    el.setPointerCapture(e.pointerId);
  };

  const onCanvasPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDraggingRef.current || dragPointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;
    applyOffset(dragStartOffsetXRef.current - dx, dragStartOffsetYRef.current - dy);

    // track velocity for momentum on release
    const now = performance.now();
    const last = lastMoveRef.current;
    if (last) {
      const dt = Math.max(16, now - last.t);
      velocityRef.current = {
        vx: (e.clientX - last.x) / dt,
        vy: (e.clientY - last.y) / dt,
      };
      lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== e.pointerId) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    dragPointerIdRef.current = null;

    // momentum throw
    const rs = randomShot;
    if (!rs) return;
    const { vx, vy } = velocityRef.current;
    const throwFactor = 480;
    applyOffset(
      offsetXRef.current - vx * throwFactor,
      offsetYRef.current - vy * throwFactor
    );

    // css settle animation
    const el = carouselRef.current;
    if (el) {
      el.classList.add("settling");
      if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = window.setTimeout(() => {
        el.classList.remove("settling");
      }, 850);
    }
  };

  // ─── render ──────────────────────────────────────────

  if (!city) return null;

  return (
    <div className="city-modal-overlay" onClick={handleClose}>
      {/* panel */}
      <div className={`city-modal-panel ${isVisible ? "visible" : ""}`}>
        <div
          ref={contentRef}
          className={`city-modal-content ${isClosing ? "closing" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* title words */}
          <div className="city-modal-titles">
            {content.title.map((word, index) => (
              <span
                key={word}
                ref={
                  index === 0
                    ? topLeftTitleRef
                    : index === 1
                      ? topRightTitleRef
                      : undefined
                }
                className={`city-modal-title ${showContent ? "visible" : ""}`}
                style={{
                  transitionDelay: `${index * 0.1 + 0.2}s`,
                  gridArea: `title${index + 1}`,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* description */}
          <p
            className={`city-modal-description ${showContent && descriptionBox ? "visible" : ""}`}
            style={{
              transitionDelay: "0.5s",
              ...(descriptionBox
                ? {
                    left: `${descriptionBox.leftPx}px`,
                    width: `${descriptionBox.widthPx}px`,
                  }
                : null),
            }}
          >
            {content.description}
          </p>

          {/* image collage canvas */}
          <div
            ref={carouselRef}
            className={`city-modal-carousel ${showContent ? "visible" : ""} ${isDragging ? "dragging" : ""}`}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={(e) => {
              // hide drag indicator over close button
              const closeBtn = closeBtnRef.current;
              if (closeBtn) {
                const rect = closeBtn.getBoundingClientRect();
                const isOverClose =
                  e.clientX >= rect.left - 10 &&
                  e.clientX <= rect.right + 10 &&
                  e.clientY >= rect.top - 10 &&
                  e.clientY <= rect.bottom + 10;
                if (isOverClose) {
                  if (dragIndicator.visible) {
                    setDragIndicator((p) => ({ ...p, visible: false }));
                  }
                  return;
                }
              }
              if (!isDraggingRef.current && !dragIndicator.visible) {
                setDragIndicator({ visible: true, x: e.clientX, y: e.clientY });
              } else if (!isDraggingRef.current && dragIndicator.visible) {
                setDragIndicator((p) => ({ ...p, x: e.clientX, y: e.clientY }));
              }
              onCanvasPointerMove(e);
            }}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerEnter={(e) => {
              const closeBtn = closeBtnRef.current;
              if (closeBtn) {
                const rect = closeBtn.getBoundingClientRect();
                const isOverClose =
                  e.clientX >= rect.left - 10 &&
                  e.clientX <= rect.right + 10 &&
                  e.clientY >= rect.top - 10 &&
                  e.clientY <= rect.bottom + 10;
                if (isOverClose) return;
              }
              setDragIndicator({ visible: true, x: e.clientX, y: e.clientY });
            }}
            onPointerLeave={() => {
              if (!isDraggingRef.current)
                setDragIndicator((p) => ({ ...p, visible: false }));
            }}
          >
            <div
              ref={trackRef}
              className="city-modal-random-track"
              style={{
                width: randomShot
                  ? `${randomShot.segmentWidthPx * 3}px`
                  : undefined,
                height: randomShot
                  ? `${randomShot.segmentHeightPx * 3}px`
                  : undefined,
              }}
            >
              {randomShot &&
                [0, 1, 2].flatMap((segX) =>
                  [0, 1, 2].map((segY) =>
                    randomShot.items.map((it, idx) => (
                      <div
                        key={`${segX}-${segY}-${idx}-${it.src}`}
                        className={`city-modal-random-item ${showContent ? "visible" : ""}`}
                        style={{
                          left: `${it.leftPx + segX * randomShot.segmentWidthPx}px`,
                          top: `${it.topPx + segY * randomShot.segmentHeightPx}px`,
                          width: `${it.widthPx}px`,
                          height: `${it.heightPx}px`,
                          zIndex: it.zIndex,
                          ["--rs-rot" as string]: `${it.rotateDeg}deg`,
                          ["--rs-settle-ms" as string]: `${240 + it.zIndex * 90}ms`,
                          ["--rs-parallax" as string]: `${it.parallax}`,
                          transitionDelay: `${(idx % 10) * 0.04 + 0.35}s`,
                        }}
                      >
                        <img
                          src={it.src}
                          alt={`${city} moment ${idx + 1}`}
                          draggable={false}
                          onDragStart={(ev) => ev.preventDefault()}
                        />
                      </div>
                    ))
                  )
                )}
            </div>
          </div>

          {/* drag-me cursor */}
          <div
            className={`city-modal-dragme ${dragIndicator.visible ? "visible" : ""} ${isDragging ? "dragging" : ""}`}
            style={{ left: dragIndicator.x, top: dragIndicator.y }}
            aria-hidden="true"
          >
            <div className="city-modal-dragme-inner">
              <span className="city-modal-dragme-text">drag</span>
              <span className="city-modal-dragme-text">me</span>
            </div>
          </div>
        </div>
      </div>

      {/* close button (outside panel to avoid overflow / stacking issues) */}
      <button
        ref={closeBtnRef}
        className={`city-modal-close ${showContent ? "visible" : ""} ${isClosing ? "closing" : ""}`}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleClose();
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerEnter={() =>
          setDragIndicator((p) => ({ ...p, visible: false }))
        }
        onPointerLeave={(e) => {
          const el = carouselRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            if (
              e.clientX >= rect.left &&
              e.clientX <= rect.right &&
              e.clientY >= rect.top &&
              e.clientY <= rect.bottom
            ) {
              setDragIndicator({ visible: true, x: e.clientX, y: e.clientY });
            }
          }
        }}
      >
        ✕
      </button>
    </div>
  );
}
