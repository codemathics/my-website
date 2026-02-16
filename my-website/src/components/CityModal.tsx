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

// dubai content — images from public/dubai
const dubaiImageFiles = [
  "1.png", "1a.png", "1b.png", "2.png", "3.png", "4.png", "5.png", "6.png",
  "7.png", "8.png", "9.png", "10.png", "11.png", "12.png", "13.png", "14.png",
  "15.png", "16.png", "18.png", "19.png", "20.png", "21.png", "22.png", "23.png",
  "24.png", "25.png", "26.png", "27.png", "28.png", "29.png", "30.png", "31.png",
  "32.png",
];
const dubaiContent = {
  title: ["habibi,", "welcome", "to", "dubai 😎"],
  description: "my collage of me in dubai",
  images: dubaiImageFiles.map((file) => `/dubai/${file}`),
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
  viewportW: number;
  viewportH: number;
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
  const momentumRafRef = useRef<number | null>(null);

  // velocity tracking — exponential moving average for smooth values
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);

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

  // compute masonry layout (Figma-style: columns, 8px gap, no overlap; wider & taller than viewport so drag works both ways)
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

      const gap = 8;
      const paddingH = 24;
      const paddingV = 24;
      // content larger than viewport so user can drag in all directions
      const segmentWidthPx = Math.max(viewportW * 1.8, viewportW + 400);
      const segmentHeightPx = Math.max(viewportH * 1.8, viewportH + 400);
      const columnCount = viewportW < 768 ? 3 : 5;
      const totalGapW = gap * (columnCount - 1);
      const columnWidth =
        (segmentWidthPx - paddingH * 2 - totalGapW) / columnCount;

      // build enough image indices to fill the wider and taller area
      const minItems = columnCount * 18;
      const indices: number[] = [];
      for (let i = 0; i < minItems; i++) {
        indices.push(i % baseImages.length);
      }

      const columnTops: number[] = Array.from(
        { length: columnCount },
        () => paddingV
      );
      const items: RandomShotItem[] = [];

      for (let i = 0; i < indices.length; i++) {
        const imgIdx = indices[i];
        const src = baseImages[imgIdx];
        const imgDim = imageDimensions[imgIdx];
        const aspect = imgDim?.aspect ?? 1;

        const w = columnWidth;
        const h = columnWidth / aspect;

        const col = columnTops.indexOf(Math.min(...columnTops));
        const leftPx = paddingH + col * (columnWidth + gap);
        const topPx = columnTops[col];

        columnTops[col] += h + gap;

        items.push({
          src,
          leftPx,
          topPx,
          widthPx: w,
          heightPx: h,
          rotateDeg: 0,
          zIndex: 1,
          parallax: 0,
        });
      }

      const finalSegmentHeightPx = Math.max(
        segmentHeightPx,
        Math.max(...columnTops) - gap + paddingV
      );
      setRandomShot({
        segmentWidthPx,
        segmentHeightPx: finalSegmentHeightPx,
        viewportW,
        viewportH,
        items,
      });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showContent, city, baseImages, imageDimensions]);

  // set initial scroll offset to top-left of masonry
  useEffect(() => {
    if (!showContent) return;
    const carouselEl = carouselRef.current;
    if (!carouselEl || !randomShot || randomShot.segmentWidthPx <= 0) return;

    const jumpToStart = () => {
      offsetXRef.current = 0;
      offsetYRef.current = 0;
      carouselEl.style.setProperty("--rs-offset-x", `${offsetXRef.current}`);
      carouselEl.style.setProperty("--rs-offset-y", `${offsetYRef.current}`);
    };

    jumpToStart();
    const raf = requestAnimationFrame(jumpToStart);
    const t = window.setTimeout(jumpToStart, 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [showContent, randomShot]);

  // cleanup momentum animation on unmount
  useEffect(() => {
    const raf = momentumRafRef;
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ─── drag helpers ────────────────────────────────────

  const applyOffset = (nextOffsetX: number, nextOffsetY: number) => {
    const carouselEl = carouselRef.current;
    const rs = randomShot;
    if (!carouselEl || !rs) return;
    const { segmentWidthPx: sw, segmentHeightPx: sh, viewportW: vw, viewportH: vh } = rs;
    if (!sw || !sh) return;

    // clamp to content bounds (masonry: single tile, no wrap)
    const maxX = Math.max(0, sw - vw);
    const maxY = Math.max(0, sh - vh);
    offsetXRef.current = Math.max(0, Math.min(maxX, nextOffsetX));
    offsetYRef.current = Math.max(0, Math.min(maxY, nextOffsetY));

    carouselEl.style.setProperty("--rs-offset-x", `${offsetXRef.current}`);
    carouselEl.style.setProperty("--rs-offset-y", `${offsetYRef.current}`);
  };

  // stop any running momentum animation
  const stopMomentum = () => {
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
    carouselRef.current?.classList.remove("momentum");
  };

  // rAF-based momentum — smooth exponential deceleration
  const startMomentum = () => {
    const el = carouselRef.current;
    if (!el) return;

    el.classList.add("momentum");

    let { vx, vy } = velocityRef.current;
    const friction = 0.955;
    const minSpeed = 0.005;

    const step = () => {
      vx *= friction;
      vy *= friction;

      // stop when both axes are barely moving
      if (Math.abs(vx) < minSpeed && Math.abs(vy) < minSpeed) {
        el.classList.remove("momentum");
        momentumRafRef.current = null;
        return;
      }

      // velocity is in px/ms, each frame is ~16ms
      applyOffset(
        offsetXRef.current - vx * 16,
        offsetYRef.current - vy * 16
      );

      momentumRafRef.current = requestAnimationFrame(step);
    };

    momentumRafRef.current = requestAnimationFrame(step);
  };

  const onCanvasPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!randomShot || e.button !== 0) return;
    const el = carouselRef.current;
    if (!el) return;

    // kill any running momentum immediately
    stopMomentum();

    // apply dragging class directly to DOM — no React batching delay
    el.classList.add("dragging");
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

    // track velocity with exponential smoothing for stable values
    const now = performance.now();
    const last = lastMoveRef.current;
    if (last) {
      const dt = Math.max(1, now - last.t);
      const instantVx = (e.clientX - last.x) / dt;
      const instantVy = (e.clientY - last.y) / dt;

      // blend 30% new, 70% old — prevents spiky velocity on slow frames
      const blend = 0.3;
      velocityRef.current = {
        vx: velocityRef.current.vx * (1 - blend) + instantVx * blend,
        vy: velocityRef.current.vy * (1 - blend) + instantVy * blend,
      };
    }
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== e.pointerId) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    dragPointerIdRef.current = null;

    // remove dragging class from DOM directly
    const el = carouselRef.current;
    if (el) el.classList.remove("dragging");

    // start smooth rAF-based momentum deceleration
    const { vx, vy } = velocityRef.current;
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed > 0.02) {
      startMomentum();
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
            className={`city-modal-carousel ${showContent ? "visible" : ""}`}
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
                  ? `${randomShot.segmentWidthPx}px`
                  : undefined,
                height: randomShot
                  ? `${randomShot.segmentHeightPx}px`
                  : undefined,
              }}
            >
              {randomShot &&
                randomShot.items.map((it, idx) => (
                  <div
                    key={`${idx}-${it.src}`}
                    className={`city-modal-random-item ${showContent ? "visible" : ""}`}
                    style={{
                      left: `${it.leftPx}px`,
                      top: `${it.topPx}px`,
                      width: `${it.widthPx}px`,
                      height: `${it.heightPx}px`,
                      zIndex: it.zIndex,
                      ["--rs-rot" as string]: `${it.rotateDeg}deg`,
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
                ))}
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
