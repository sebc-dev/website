import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n';
import { locales } from '@/i18n';

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

/**
 * HomePage Component - Coming Soon Landing Page
 *
 * A visually impressive dark-themed landing page introducing the sebc.dev platform.
 * Features a sophisticated multi-layer animated background, gradient-animated title,
 * and glassmorphic UI elements with progressive stagger animations.
 *
 * Now fully internationalized using next-intl for French/English support.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering for this locale
  setRequestLocale(locale as Locale);

  return <HomePageContent />;
}

function HomePageContent() {
  const t = useTranslations('home');

  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Animated background effects layer */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='from-background via-muted via-card via-muted to-background absolute inset-0 bg-gradient-to-br via-30% via-60% via-80%' />
        <div
          className='absolute inset-0 opacity-5'
          style={{
            backgroundImage: `linear-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--accent) / 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
          aria-hidden='true'
        />
      </div>

      {/* Main content area */}
      <div className='relative z-10 mx-auto max-w-4xl px-6 text-center'>
        {/* Status Badge */}
        <div className='bg-accent/10 border-accent/20 mb-8 inline-flex animate-[fade-in-up_0.6s_ease-out] items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm'>
          <div className='bg-accent h-2 w-2 animate-pulse rounded-full' />
          <span className='text-accent text-sm font-medium'>{t('badge')}</span>
        </div>

        {/* Main Title */}
        <h1 className='mb-6 animate-[fade-in-up_0.8s_ease-out_0.2s_both] font-mono text-6xl font-bold tracking-tighter md:text-8xl lg:text-9xl'>
          <span className='from-accent via-primary to-accent animate-gradient bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent'>
            sebc.dev
          </span>
        </h1>

        {/* Subtitle */}
        <p className='text-foreground mb-4 animate-[fade-in-up_1s_ease-out_0.4s_both] text-xl font-light md:text-2xl lg:text-3xl'>
          {t('subtitle')}
        </p>

        {/* Main Description */}
        <p className='text-foreground mx-auto mb-12 max-w-2xl animate-[fade-in-up_1.2s_ease-out_0.6s_both] text-base leading-relaxed md:text-lg'>
          {t('descriptionPrefix')}
          <span className='text-accent font-medium'>{t('ai')}</span>
          {t('descriptionMiddle')}
          <span className='text-accent font-medium'>{t('ux')}</span>
          {t('descriptionSuffix')}
          <span className='text-accent font-medium'>{t('engineering')}</span>
        </p>

        {/* Loading Indicators */}
        <div className='mb-8 flex animate-[fade-in-up_1.4s_ease-out_0.8s_both] items-center justify-center gap-3'>
          <div className='flex items-center gap-2'>
            <div className='bg-accent h-3 w-3 animate-pulse rounded-full' />
            <div className='bg-accent/80 h-3 w-3 animate-pulse rounded-full delay-75' />
            <div className='bg-accent/60 h-3 w-3 animate-pulse rounded-full delay-150' />
          </div>
        </div>

        {/* Information Card */}
        <div className='bg-card/80 border-border inline-block animate-[fade-in-up_1.6s_ease-out_1s_both] rounded-2xl border p-6 shadow-2xl backdrop-blur-md'>
          <div className='mb-3 flex items-center justify-center gap-3'>
            <svg
              className='text-accent h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
            <span className='text-card-foreground text-sm font-medium'>
              {t('launchLabel')}
            </span>
          </div>
          <p className='text-card-foreground mb-1 text-2xl font-bold'>
            {t('launchDate')}
          </p>
          <p className='text-muted-foreground text-sm'>{t('tagline')}</p>
        </div>
      </div>

      {/* Footer Decoration */}
      <div
        className='via-accent/20 absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent'
        aria-hidden='true'
      />
    </div>
  );
}
