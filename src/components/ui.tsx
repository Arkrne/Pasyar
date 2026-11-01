"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { BadgeCheck, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";

/* ---------------- Buttons ---------------- */

type BtnProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
};

export function Button({ children, variant = "primary", size = "md", className, href, onClick, disabled, type = "button", ariaLabel }: BtnProps) {
  const cls = cn(
    "pressable inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none",
    size === "sm" && "h-9 px-4 text-[13px]",
    size === "md" && "h-11 px-5 text-[15px]",
    size === "lg" && "h-14 px-7 text-[17px]",
    variant === "primary" && "bg-ocean text-white hover:bg-ocean-ink",
    variant === "secondary" && "bg-ocean-soft text-ocean-ink hover:bg-[#dcebf8]",
    variant === "ghost" && "bg-black/[0.05] text-ink hover:bg-black/[0.08]",
    variant === "white" && "bg-white text-ink shadow-[var(--shadow-md)]",
    variant === "dark" && "bg-ink text-white hover:bg-black",
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "pressable inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium",
        active ? "bg-ink text-white" : "bg-surface text-ink-2 hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "ocean" | "leaf" | "coral" | "amber"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "neutral" && "bg-surface text-ink-2",
        tone === "ocean" && "bg-ocean-soft text-ocean-ink",
        tone === "leaf" && "bg-leaf-soft text-leaf",
        tone === "coral" && "bg-coral-soft text-[#c24a22]",
        tone === "amber" && "bg-amber-soft text-amber",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Verified({ label = "Verified" }: { label?: string }) {
  return (
    <Badge tone="ocean">
      <BadgeCheck className="size-3" /> {label}
    </Badge>
  );
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-[#f5a623] text-[#f5a623]" : "fill-surface-2 text-surface-2"}
        />
      ))}
    </span>
  );
}

const AV_COLORS = ["#0a6cbf", "#0f9aa0", "#f2683c", "#1f8a4c", "#7a5af8", "#b26a00"];
export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const c = AV_COLORS[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AV_COLORS.length];
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, background: c, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ---------------- Photo ---------------- */

export function Photo({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
  rep,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rep?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {rep && (
        <span className="glass-dark absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
          Nearby area
        </span>
      )}
    </div>
  );
}

/* ---------------- Reveal on scroll ---------------- */

export function Reveal({ children, delay = 0, className, y = 18 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", bounce: 0, duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Bottom sheet ---------------- */

export function Sheet({
  open,
  onClose,
  children,
  title,
  className,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  wide?: boolean;
}) {
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // project where the flick is going, then decide
    const projected = info.offset.y + (info.velocity.y / 1000) * (0.998 / (1 - 0.998));
    if (projected > 220) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[900] flex flex-col justify-end md:items-center md:justify-center md:p-6">
          <motion.div
            className="absolute inset-0 bg-[var(--scrim)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={onDragEnd}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className={cn(
              "relative mx-auto flex max-h-[92dvh] w-full flex-col rounded-t-[var(--radius-sheet)] bg-white shadow-[var(--shadow-lg)] outline-none md:max-h-[86dvh] md:rounded-[var(--radius-sheet)]",
              wide ? "md:max-w-3xl" : "md:max-w-lg",
              className,
            )}
          >
            <div
              className="flex cursor-grab touch-none items-center justify-center pb-1 pt-2.5 active:cursor-grabbing md:hidden"
              onPointerDown={(e) => controls.start(e)}
            >
              <span className="h-1.5 w-10 rounded-full bg-black/15" />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-1 md:pt-5">
              {title ? <h2 className="t-headline">{title}</h2> : <span />}
              <button onClick={onClose} aria-label="Close" className="pressable grid size-8 place-items-center rounded-full bg-black/[0.05]">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(20px+var(--safe-b))]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SectionHead({ eyebrow, title, sub, action, className }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="t-eyebrow mb-1.5 text-muted">{eyebrow}</p>}
        <h2 className="t-title text-balance">{title}</h2>
        {sub && <p className="t-body mt-1.5 max-w-xl text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
