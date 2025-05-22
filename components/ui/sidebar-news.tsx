'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface NewsArticle {
  href: string;
  title: string;
  summary: string;
  image: string;
}

const OFFSET_FACTOR = 4;
const SCALE_FACTOR = 0.03;
const OPACITY_FACTOR = 0.1;

export function News({ articles }: { articles: NewsArticle[] }) {
  const [dismissedNews, setDismissedNews] = React.useState<string[]>([]);
  const cards = articles.filter(({ href }) => !dismissedNews.includes(href));
  const cardCount = cards.length;
  const [showCompleted, setShowCompleted] = React.useState(cardCount > 0);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (cardCount === 0) {
      timeout = setTimeout(() => setShowCompleted(false), 2700);
    }
    return () => clearTimeout(timeout);
  }, [cardCount]);

  return cards.length || showCompleted ? (
    <div
      className="group overflow-hidden px-3 pb-3 pt-8"
      data-active={cardCount !== 0}
    >
      <div className="relative size-full">
        {cards.toReversed().map(({ href, title, summary, image }, idx) => (
          <div
            key={href}
            className={cn(
              'absolute left-0 top-0 size-full scale-[var(--scale)] transition-[opacity,transform] duration-200',
              cardCount - idx > 3
                ? [
                  'opacity-0 sm:group-hover:translate-y-[var(--y)] sm:group-hover:opacity-[var(--opacity)]',
                  'sm:group-has-[*[data-dragging=true]]:translate-y-[var(--y)] sm:group-has-[*[data-dragging=true]]:opacity-[var(--opacity)]',
                ]
                : 'translate-y-[var(--y)] opacity-[var(--opacity)]'
            )}
            style={
              {
                '--y': `-${(cardCount - (idx + 1)) * OFFSET_FACTOR}%`,
                '--scale': 1 - (cardCount - (idx + 1)) * SCALE_FACTOR,
                '--opacity':
                  cardCount - (idx + 1) >= 6
                    ? 0
                    : 1 - (cardCount - (idx + 1)) * OPACITY_FACTOR,
              } as React.CSSProperties
            }
            aria-hidden={idx !== cardCount - 1}
          >
            <NewsCard
              title={title}
              description={summary}
              image={image}
              href={href}
              hideContent={cardCount - idx > 2}
              active={idx === cardCount - 1}
              onDismiss={() =>
                setDismissedNews([href, ...dismissedNews.slice(0, 50)])
              }
            />
          </div>
        ))}
        <div className="pointer-events-none invisible" aria-hidden>
          <NewsCard title="Title" description="Description" />
        </div>
        {showCompleted && !cardCount && (
          <div
            className="absolute inset-0 flex size-full flex-col items-center justify-center gap-3"
            style={{ '--offset': '10px' } as React.CSSProperties}
          >
            <div className="animate-fade-in absolute inset-0 rounded-lg border border-neutral-300 [animation-delay:2.3s] [animation-direction:reverse] [animation-duration:0.2s]" />
            <span className="animate-fade-in text-xs font-medium text-muted-foreground [animation-delay:2.3s] [animation-direction:reverse] [animation-duration:0.2s]">
              Vous êtes à jour !
            </span>
          </div>
        )}
      </div>
    </div>
  ) : null;
}

function NewsCard({
  title,
  description,
  image,
  onDismiss,
  hideContent,
  href,
  active,
}: {
  title: string;
  description: string;
  image?: string;
  onDismiss?: () => void;
  hideContent?: boolean;
  href?: string;
  active?: boolean;
}) {
  const { isMobile } = useMediaQuery();

  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{
    start: number;
    delta: number;
    startTime: number;
    maxDelta: number;
  }>({
    start: 0,
    delta: 0,
    startTime: 0,
    maxDelta: 0,
  });
  const animation = React.useRef<Animation>();
  const [dragging, setDragging] = React.useState(false);

  const onDragMove = (e: PointerEvent) => {
    if (!ref.current) {
      return;
    }
    const { clientX } = e;
    const dx = clientX - drag.current.start;
    drag.current.delta = dx;
    drag.current.maxDelta = Math.max(drag.current.maxDelta, Math.abs(dx));
    ref.current.style.setProperty('--dx', dx.toString());
  };

  const dismiss = () => {
    if (!ref.current) {
      return;
    }

    const cardWidth = ref.current.getBoundingClientRect().width;
    const translateX = Math.sign(drag.current.delta) * cardWidth;

    // Dismiss card
    animation.current = ref.current.animate(
      { opacity: 0, transform: `translateX(${translateX}px)` },
      { duration: 150, easing: 'ease-in-out', fill: 'forwards' }
    );
    animation.current.onfinish = () => onDismiss?.();
  };

  const stopDragging = (cancelled: boolean) => {
    if (!ref.current) {
      return;
    }
    unbindListeners();
    setDragging(false);

    const dx = drag.current.delta;
    if (Math.abs(dx) > ref.current.clientWidth / (cancelled ? 2 : 3)) {
      dismiss();
      return;
    }

    // Animate back to original position
    animation.current = ref.current.animate(
      { transform: 'translateX(0)' },
      { duration: 150, easing: 'ease-in-out' }
    );
    animation.current.onfinish = () =>
      ref.current?.style.setProperty('--dx', '0');

    drag.current = { start: 0, delta: 0, startTime: 0, maxDelta: 0 };
  };

  const onDragEnd = () => stopDragging(false);
  const onDragCancel = () => stopDragging(true);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active || !ref.current || animation.current?.playState === 'running') {
      return;
    }

    bindListeners();
    setDragging(true);
    drag.current.start = e.clientX;
    drag.current.startTime = Date.now();
    drag.current.delta = 0;
    ref.current.style.setProperty('--w', ref.current.clientWidth.toString());
  };

  const onClick = () => {
    if (!ref.current) {
      return;
    }
    if (
      isMobile &&
      drag.current.maxDelta < ref.current.clientWidth / 10 &&
      (!drag.current.startTime || Date.now() - drag.current.startTime < 250)
    ) {
      // Touch user didn't drag far or for long, navigate to the link in the same tab
      if (href) {
        window.location.href = href; // Navigation dans l'onglet actuel
      }
    }
  };

  const bindListeners = () => {
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
    document.addEventListener('pointercancel', onDragCancel);
  };

  const unbindListeners = () => {
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    document.removeEventListener('pointercancel', onDragCancel);
  };

  return (
    <Card
      ref={ref}
      data-dragging={dragging}
      className={cn(
        'relative flex flex-col justify-between h-48 p-4 transition-shadow',
        dragging && 'shadow-lg',
        'overflow-hidden'
      )}
      style={{
        '--dx': '0',
        '--w': '100%',
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
    >
      {/* Dégradé bleu pastel en fond */}
      <div className="absolute inset-0 z-0 rounded-lg bg-gradient-to-br from-[#B8CBFC] via-[#E6EDFD] to-[#7FA3F9]" />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <h3 className="font-semibold text-base mb-1 text-[#1A2B3C] truncate">{title}</h3>
          <p className="text-sm text-[#4A5568] mb-2 truncate">{description}</p>
        </div>
        {/* Footer actions (ex: boutons) */}
        <div className="flex justify-between items-end text-xs text-[#718096]">
          {href && <Link href={href} className="font-medium hover:underline">En savoir plus</Link>}
          {onDismiss && <button onClick={onDismiss} className="ml-auto text-xs text-[#718096] hover:text-[#467FF7]">Ignorer</button>}
        </div>
      </div>
    </Card>
  );
} 