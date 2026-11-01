"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, Copy, Flag, Heart, ImagePlus, MapPin, MessageCircle, PenLine, Send, Star } from "lucide-react";
import { Page } from "@/components/shell";
import { Avatar, Button, Chip, Sheet, Stars, Verified } from "@/components/ui";
import { toast } from "@/components/toast";
import { POSTS, type Post, type Review } from "@/data/community";
import { PLACES, PLACE_BY_ID } from "@/data/places";
import { OPERATORS, OPERATOR_BY_ID } from "@/data/operators";
import { TOWN_BY_ID } from "@/data/towns";
import { useStore, useHydrated } from "@/lib/store";
import { planTrip } from "@/lib/planner";
import { cn } from "@/lib/cn";
import { Fancy } from "@/components/fancy";

function ago(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
}

export function CommunityView() {
  const hydrated = useHydrated();
  const myPosts = useStore((s) => s.myPosts);
  const [tab, setTab] = useState<"latest" | "trips" | "following">("latest");
  const [compose, setCompose] = useState(false);
  const [review, setReview] = useState(false);
  const following = useStore((s) => s.following);

  const posts = useMemo(() => {
    const all = [...(hydrated ? myPosts : []), ...POSTS];
    if (tab === "trips") return all.filter((p) => p.trip);
    if (tab === "following") return all.filter((p) => following.includes(p.author.handle));
    return all;
  }, [hydrated, myPosts, tab, following]);

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4 md:pt-6">
        <div>
          <p className="t-eyebrow text-muted">Community</p>
          <h1 className="t-display mt-1"><Fancy hat>Trips</Fancy> by people who went.</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setReview(true)}>
            <Star className="size-4" /> Write a review
          </Button>
          <Button onClick={() => setCompose(true)}>
            <PenLine className="size-4" /> Share your trip
          </Button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Chip active={tab === "latest"} onClick={() => setTab("latest")}>Latest</Chip>
        <Chip active={tab === "trips"} onClick={() => setTab("trips")}>Copyable trips</Chip>
        <Chip active={tab === "following"} onClick={() => setTab("following")}>Following</Chip>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr]">
        <div className="space-y-6">
          {posts.length === 0 && (
            <p className="rounded-[24px] bg-surface p-8 text-center text-muted">Follow travelers and their posts will show up here.</p>
          )}
          <AnimatePresence initial={false}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </AnimatePresence>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-[80px] space-y-4">
            <TopRated />
            <div className="rounded-[24px] bg-ocean-soft p-5">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ocean-ink">
                <Verified label="Verified visit" />
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ocean-ink/80">
                Only travelers who booked and finished a trip through Pasyar get this badge on their review. It keeps fake reviews
                out, and it tells operators the feedback is real.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <Composer open={compose} onClose={() => setCompose(false)} />
      <ReviewComposer open={review} onClose={() => setReview(false)} />
    </Page>
  );
}

function PostCard({ post: p }: { post: Post }) {
  const router = useRouter();
  const liked = useStore((s) => s.liked.includes(p.id));
  const saved = useStore((s) => s.savedPosts.includes(p.id));
  const follows = useStore((s) => s.following.includes(p.author.handle));
  const toggleLike = useStore((s) => s.toggleLike);
  const toggleSave = useStore((s) => s.toggleSavePost);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const setCurrent = useStore((s) => s.setCurrent);
  const draft = useStore((s) => s.draft);
  const me = useStore((s) => s.user.handle);
  const [burst, setBurst] = useState(0);
  const [comments, setComments] = useState(p.comments);
  const [text, setText] = useState("");
  const lastTap = useRef(0);

  const place = p.placeId ? PLACE_BY_ID[p.placeId] : null;
  const op = p.operatorId ? OPERATOR_BY_ID[p.operatorId] : null;

  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) toggleLike(p.id);
      setBurst((b) => b + 1);
      navigator.vibrate?.(10);
    }
    lastTap.current = now;
  };

  const copyTrip = () => {
    if (!p.trip) return;
    const locked = Object.fromEntries(p.trip.stops.map((s, i) => [i, s]));
    const it = planTrip({
      ...draft,
      days: p.trip.days,
      interests: p.trip.interests,
      locked,
      seed: Math.floor(Math.random() * 1e6),
    });
    setCurrent(it);
    toast("Trip copied", `${p.author.name.split(" ")[0]}'s ${p.trip.days}-day plan is now yours to edit and book.`);
    router.push("/trip");
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      className="card overflow-hidden"
    >
      <header className="flex items-center gap-3 p-4">
        <Avatar name={p.author.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
            {p.author.name}
            {p.verified && <Verified label="Verified trip" />}
          </p>
          <p className="truncate text-[12px] text-muted">
            @{p.author.handle} · {p.author.from} · {ago(p.createdAt)}
          </p>
        </div>
        {p.author.handle !== me && (
          <button
            onClick={() => toggleFollow(p.author.handle)}
            className={cn("pressable h-8 rounded-full px-3.5 text-[13px] font-semibold", follows ? "bg-surface text-ink-2" : "bg-ink text-white")}
          >
            {follows ? "Following" : "Follow"}
          </button>
        )}
      </header>

      <div className="relative aspect-[4/5] select-none bg-surface" onClick={onTap}>
        <Image src={p.photo} alt={place?.name ?? "Trip photo"} fill sizes="(max-width:768px) 100vw, 560px" className="object-cover" unoptimized={p.photo.startsWith("blob:")} />
        <AnimatePresence>
          {burst > 0 && (
            <motion.div
              key={burst}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.15, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={() => setTimeout(() => setBurst(0), 250)}
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <Heart className="size-24 fill-white text-white drop-shadow-xl" />
            </motion.div>
          )}
        </AnimatePresence>
        {place && (
          <Link
            href={`/explore?town=${place.town}`}
            onClick={(e) => e.stopPropagation()}
            className="glass absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold"
          >
            <MapPin className="size-3.5" /> {place.name}
          </Link>
        )}
        {p.trip && (
          <div className="glass-strong absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[18px] p-2 pl-4">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{p.trip.title}</p>
              <p className="truncate text-[12px] text-muted">
                {p.trip.stops.flat().length} stops · {[...new Set(p.trip.stops.flat().map((id) => TOWN_BY_ID[PLACE_BY_ID[id]?.town]?.name))].slice(0, 3).join(", ")}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyTrip();
              }}
              className="pressable flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ocean px-4 text-[14px] font-semibold text-white"
            >
              <Copy className="size-4" /> Copy this trip
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-2 pt-2">
        <IconAction label={liked ? "Unlike" : "Like"} onClick={() => toggleLike(p.id)}>
          <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}>
            <Heart className={cn("size-6", liked && "fill-coral text-coral")} />
          </motion.span>
        </IconAction>
        <IconAction label="Comment" onClick={() => document.getElementById(`c-${p.id}`)?.focus()}>
          <MessageCircle className="size-6" />
        </IconAction>
        <IconAction
          label="Share"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${location.origin}/community#${p.id}`);
              toast("Link copied");
            } catch {}
          }}
        >
          <Send className="size-6" />
        </IconAction>
        <div className="flex-1" />
        <IconAction label="Report" onClick={() => toast("Reported", "Thanks. A moderator will look at this within a day.", "info")}>
          <Flag className="size-5 text-muted" />
        </IconAction>
        <IconAction label={saved ? "Unsave" : "Save"} onClick={() => toggleSave(p.id)}>
          <Bookmark className={cn("size-6", saved && "fill-ink")} />
        </IconAction>
      </div>
      <div className="px-4 pb-4">
        <p className="tabular text-[14px] font-semibold">{(p.likes + (liked ? 1 : 0)).toLocaleString()} likes</p>
        <p className="mt-1 text-[15px] leading-relaxed">
          <span className="font-semibold">{p.author.handle}</span> {p.caption}
        </p>
        {op && (
          <p className="mt-2 text-[13px] text-muted">
            Booked with <span className="font-semibold text-ink-2">{op.name}</span>
          </p>
        )}
        {comments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {comments.slice(-3).map((c, k) => (
              <li key={k} className="text-[14px]">
                <span className="font-semibold">{c.author}</span> <span className="text-ink-2">{c.text}</span>
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setComments((c) => [...c, { author: me, text: text.trim() }]);
            setText("");
          }}
        >
          <input
            id={`c-${p.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment"
            className="h-10 flex-1 rounded-full bg-surface px-4 text-[15px] outline-none"
          />
          {text && (
            <button className="text-[14px] font-semibold text-ocean" type="submit">
              Post
            </button>
          )}
        </form>
      </div>
    </motion.article>
  );
}

function IconAction({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} onClick={onClick} className="pressable grid size-11 place-items-center rounded-full hover:bg-surface">
      {children}
    </button>
  );
}

function TopRated() {
  const top = [...PLACES].sort((a, b) => b.rating * Math.log(b.reviews) - a.rating * Math.log(a.reviews)).slice(0, 5);
  return (
    <div className="card p-5">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Top rated this month</p>
      <ol className="mt-3 space-y-3">
        {top.map((p, k) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="tabular w-4 text-[15px] font-bold text-faint">{k + 1}</span>
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl">
              <Image src={p.photo} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{p.name}</p>
              <p className="flex items-center gap-1 text-[12px] text-muted">
                <Stars value={p.rating} size={10} /> {p.rating} · {p.reviews.toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- Composer ---------------- */

function Composer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const addPost = useStore((s) => s.addPost);
  const current = useStore((s) => s.current);
  const bookings = useStore((s) => s.bookings);
  const [photo, setPhoto] = useState<string>("/photos/binurong-cliff.webp");
  const [caption, setCaption] = useState("");
  const [placeId, setPlaceId] = useState("binurong-point");
  const [attach, setAttach] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const verified = bookings.some((b) => b.guest === user.name && b.lines.some((l) => l.status === "completed"));

  const submit = () => {
    const trip =
      attach && current
        ? {
            title: current.title,
            days: current.input.days,
            interests: current.input.interests,
            stops: current.days.map((d) => d.items.filter((i) => i.type === "place" && i.placeId && !i.serviceId).map((i) => i.placeId!)),
          }
        : undefined;
    addPost({
      id: `mine-${Date.now()}`,
      author: { name: user.name === "Guest traveler" ? "You" : user.name, handle: user.handle, from: user.from, avatar: "" },
      photo,
      caption: caption.trim() || "Catanduanes, you were good to us.",
      placeId,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      trip,
      verified,
    });
    toast("Posted", trip ? "Others can now copy your trip." : undefined);
    setCaption("");
    onClose();
  };

  const gallery = ["binurong-cliff", "puraran-beach", "twin-rock-palms", "hiyop-cow", "nahulugan-falls", "bato-church", "tuwad-tuwadan-view", "viga-sunrise"];

  return (
    <Sheet open={open} onClose={onClose} title="Share your trip">
      <div className="space-y-4 pb-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface">
          <Image src={photo} alt="" fill sizes="480px" className="object-cover" unoptimized={photo.startsWith("blob:")} />
          <button onClick={() => fileRef.current?.click()} className="glass-strong pressable absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold">
            <ImagePlus className="size-4" /> Upload photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(URL.createObjectURL(f));
            }}
          />
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {gallery.map((g) => (
            <button
              key={g}
              onClick={() => setPhoto(`/photos/${g}.webp`)}
              className={cn("pressable relative size-16 shrink-0 overflow-hidden rounded-xl", photo.includes(g) && "ring-2 ring-ocean ring-offset-2")}
              aria-label={`Use photo ${g}`}
            >
              <Image src={`/photos/${g}.webp`} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What made it worth the trip?"
          rows={3}
          className="w-full resize-none rounded-[18px] bg-surface p-4 outline-none"
        />
        <label className="block">
          <span className="text-[13px] font-semibold text-muted">Tag a place</span>
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="mt-1.5 h-12 w-full rounded-2xl bg-surface px-4 outline-none">
            {PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {TOWN_BY_ID[p.town].name}
              </option>
            ))}
          </select>
        </label>
        {current && (
          <button onClick={() => setAttach(!attach)} role="switch" aria-checked={attach} className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left">
            <span>
              <span className="block text-[15px] font-semibold">Attach my itinerary</span>
              <span className="text-[13px] text-muted">{current.title}. Others can copy it.</span>
            </span>
            <span className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors", attach ? "bg-leaf" : "bg-surface-2")}>
              <motion.span layout className={cn("absolute top-[2px] size-[27px] rounded-full bg-white shadow", attach ? "right-[2px]" : "left-[2px]")} />
            </span>
          </button>
        )}
        <p className="text-[12px] text-muted">{verified ? "Your post will carry the Verified trip badge." : "Finish a trip booked through Pasyar to earn the Verified trip badge."}</p>
        <Button size="lg" className="w-full" onClick={submit}>
          Post
        </Button>
      </div>
    </Sheet>
  );
}

function ReviewComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const bookings = useStore((s) => s.bookings);
  const addReview = useStore((s) => s.addReview);
  const [target, setTarget] = useState("alon-surf-camp");
  const [stars, setStars] = useState(5);
  const [aspects, setAspects] = useState({ value: 5, safety: 5, friendliness: 5, cleanliness: 5 });
  const [text, setText] = useState("");

  const completedOps = new Set(
    bookings.filter((b) => b.guest === user.name).flatMap((b) => b.lines.filter((l) => l.status === "completed").map((l) => l.operatorId)),
  );
  const verified = completedOps.has(target);

  const submit = () => {
    const r: Review = {
      id: `rv-${Date.now()}`,
      targetId: target,
      author: user.name === "Guest traveler" ? "You" : user.name,
      stars,
      aspects,
      text: text.trim() || "Would book again.",
      date: new Date().toISOString().slice(0, 10),
      verified,
    };
    addReview(r);
    toast("Review posted", verified ? "Marked as a verified visit." : "Posted without the verified badge.");
    setText("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Write a review">
      <div className="space-y-4 pb-2">
        <label className="block">
          <span className="text-[13px] font-semibold text-muted">Who are you reviewing?</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1.5 h-12 w-full rounded-2xl bg-surface px-4 outline-none">
            <optgroup label="Operators">
              {OPERATORS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Places">
              {PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <div className={cn("rounded-2xl p-3.5 text-[13px]", verified ? "bg-leaf-soft text-leaf" : "bg-surface text-muted")}>
          {verified ? "You finished a booking here. This review gets the Verified visit badge." : "No completed Pasyar booking found for this listing. Your review will show as unverified."}
        </div>
        <div className="flex justify-center gap-2 py-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`} className="pressable">
              <Star className={cn("size-9", n <= stars ? "fill-[#f5a623] text-[#f5a623]" : "fill-surface-2 text-surface-2")} />
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(aspects) as (keyof typeof aspects)[]).map((k) => (
            <label key={k} className="rounded-2xl bg-surface p-3">
              <span className="flex justify-between text-[13px] font-medium capitalize">
                {k} <span className="tabular font-semibold">{aspects[k]}/5</span>
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={aspects[k]}
                onChange={(e) => setAspects({ ...aspects, [k]: Number(e.target.value) })}
                className="mt-2 w-full accent-[var(--ocean)]"
              />
            </label>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What should the next traveler know?" rows={3} className="w-full resize-none rounded-[18px] bg-surface p-4 outline-none" />
        <Button size="lg" className="w-full" onClick={submit}>
          Post review
        </Button>
        <p className="text-center text-[12px] text-faint">Reviews feed back into how Pasyar ranks places and operators.</p>
      </div>
    </Sheet>
  );
}

