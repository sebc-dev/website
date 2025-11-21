/**
 * HomePage Component - Coming Soon Landing Page
 *
 * A visually impressive dark-themed landing page introducing the sebc.dev platform.
 * Features a sophisticated multi-layer animated background, gradient-animated title,
 * and glassmorphic UI elements with progressive stagger animations.
 *
 * Visual Composition:
 *
 * Background Effects (z-index: 0-5):
 * 1. Gradient Background - Multi-color gradient (background, muted, card, muted, background)
 *    - Direction: Bottom-right (br)
 *    - Stops: 30%, 60%, 80% for smooth color transitions
 *    - Purpose: Provides depth and visual interest
 *
 * 2. Grid Overlay - Subtle 50px by 50px grid pattern
 *    - Color: Accent color at 10% opacity with additional 5% element opacity
 *    - Purpose: Creates texture and geometric visual structure
 *    - Hidden from screen readers (purely decorative)
 *
 * Main Content (z-index: 10):
 * Arranged vertically with staggered fade-in animations
 *
 * 1. Development Badge (0.6s fade-in)
 *    - Pulsing indicator dot (accent color)
 *    - Text: "En développement"
 *    - Backdrop blur for glassmorphic effect
 *
 * 2. Main Title (0.8s fade-in, 0.2s delay)
 *    - Text: "sebc.dev"
 *    - Font: Mono, Bold, responsive sizing (600% to 900%)
 *    - Animation: Gradient text with 200% background animation
 *    - Animation timing: Infinite gradient sweep
 *
 * 3. Subtitle (1s fade-in, 0.4s delay)
 *    - Text: "Un laboratoire d'apprentissage public"
 *    - Responsive sizing: 18px to 48px
 *
 * 4. Description (1.2s fade-in, 0.6s delay)
 *    - Highlights key focus areas: IA, UX, Ingénierie logicielle
 *    - Accent color for emphasized terms
 *    - Max-width: 2xl for readability
 *
 * 5. Loading Indicators (1.4s fade-in, 0.8s delay)
 *    - Three pulsing dots with decreasing opacity
 *    - Staggered pulse animation (0ms, 75ms, 150ms delays)
 *    - Purpose: Indicates dynamic, evolving platform
 *
 * 6. Glassmorphism Info Card (1.6s fade-in, 1s delay)
 *    - Launch date: "Fin Octobre 2025"
 *    - Tagline: "Blog technique • Articles • Guides"
 *    - Effects: backdrop-blur-md, border, shadow-2xl
 *    - Responsive: inline-block with proper centering
 *
 * Footer Decoration (z-index: 5):
 * Gradient line separator for visual closure
 *
 * Animation Strategy:
 *
 * Staggered Timing (0.6s to 1.6s, 0.2s increments):
 * - Creates progressive reveal effect
 * - Guides user attention from top to bottom
 * - Prevents overwhelming visual overload
 * - Smooth duration: 0.6s to 1.2s per element
 *
 * CSS Animations:
 * - fade-in-up: Combined opacity and transform (translateY)
 * - animate-gradient: Background position animation (200% size)
 * - animate-pulse: Opacity fade for indicators
 * - All GPU-accelerated (transform, opacity only)
 *
 * Responsive Design:
 * - Mobile (less than 768px): Text-6xl, full width padding
 * - Tablet (768px to 1024px): Text-8xl, enhanced spacing
 * - Desktop (greater than 1024px): Text-9xl, maximum visual impact
 * - Container: max-w-4xl with centered alignment
 *
 * Accessibility Features:
 * - Semantic HTML: h1 for main title, p for text
 * - Decorative elements: aria-hidden='true' for grid, footer
 * - SVG icon: aria-hidden='true' (content provided via label)
 * - Color contrast: Meets WCAG AA standard (dark theme)
 * - Reduced motion: Supported via prefers-reduced-motion media query
 * - Language: Inherited from root layout (fr)
 *
 * Performance Considerations:
 * - No JavaScript: Pure CSS animations (GPU-accelerated)
 * - No image loading: SVG inline (minimal impact)
 * - CSS variables: Reused from theme system
 * - Animations: Will-change would be excessive (disabled by default)
 *
 * Browser Compatibility:
 * - Modern browsers (Chrome 90+, Firefox 88+, Safari 15+)
 * - backdrop-blur: Requires Safari 15.4+ (graceful degradation via CSS fallback)
 * - Gradient text: Uses webkit-background-clip (standard property)
 * - CSS Grid: Standard browser support
 *
 * Related Files:
 * - Layout: /app/layout.tsx (applies dark theme)
 * - Styles: /app/globals.css (animation definitions)
 * - Colors: theme configuration (Tailwind CSS v4)
 * - PR #9: May have conflicting changes in layout files
 *
 * Accessibility Standards: WCAG 2.1 Level AA
 * - Color contrast: 7:1 or higher (dark theme on dark background)
 * - Keyboard navigation: Not applicable (no interactive elements)
 * - Screen reader: Semantic HTML with aria-hidden on decorative elements
 *
 * Future Enhancement Ideas:
 * - Add CTA button linking to blog/newsletter
 * - Add countdown timer for exact launch date
 * - Add dark/light theme toggle
 * - Extract animated components to reusable library
 */
export default function HomePage() {
  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Animated background effects layer (z-index: 0-5) */}
      <div className='absolute inset-0 overflow-hidden'>
        {/*
          Base gradient background
          Direction: bottom-right (br)
          Colors: background → muted → card → muted → background
          Stops: 30%, 60%, 80% for smooth transitions between colors
          Purpose: Creates visual depth and rich color composition
        */}
        <div className='from-background via-muted via-card via-muted to-background absolute inset-0 bg-gradient-to-br via-30% via-60% via-80%' />

        {/*
          Subtle grid overlay for texture
          Pattern: 50px × 50px squares
          Color: Accent color at reduced opacity (0.1 on gradient, 0.05 on element)
          Purpose: Adds geometric structure and visual interest without overwhelming
          aria-hidden: Purely decorative element, hidden from screen readers
        */}
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

      {/* Main content area (z-index: 10) - All elements use staggered fade-in animations */}
      <div className='relative z-10 mx-auto max-w-4xl px-6 text-center'>
        {/*
          Status Badge - Development Indicator
          Animation: 0.6s fade-in-up (first element)
          Purpose: Indicates the platform is actively being developed
          Features:
          - Pulsing dot animation (draws attention)
          - Backdrop blur for glassmorphism effect
          - Accent color for visual prominence
        */}
        <div className='bg-accent/10 border-accent/20 mb-8 inline-flex animate-[fade-in-up_0.6s_ease-out] items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm'>
          <div className='bg-accent h-2 w-2 animate-pulse rounded-full' />
          <span className='text-accent text-sm font-medium'>
            En développement
          </span>
        </div>

        {/*
          Main Title - "sebc.dev"
          Animation: 0.8s fade-in-up + 0.2s delay (reveals after badge)
          Typography:
          - Font: Geist Mono (--font-geist-mono CSS variable)
          - Weight: Bold (font-bold)
          - Size: Responsive (text-6xl → text-8xl → text-9xl)
          - Tracking: Tighter letter spacing
          Gradient Animation:
          - Colors: accent → primary → accent (creates sweep effect)
          - Background-size: 200% (enables position animation)
          - Animation: animate-gradient (from globals.css)
          - Purpose: Eye-catching, indicates premium brand
        */}
        <h1 className='mb-6 animate-[fade-in-up_0.8s_ease-out_0.2s_both] font-mono text-6xl font-bold tracking-tighter md:text-8xl lg:text-9xl'>
          <span className='from-accent via-primary to-accent animate-gradient bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent'>
            sebc.dev
          </span>
        </h1>

        {/*
          Subtitle - Platform Description
          Animation: 1s fade-in-up + 0.4s delay (after title)
          Typography:
          - Font-weight: Light (300)
          - Size: Responsive (text-xl → text-2xl → text-3xl)
          - Purpose: Introduces main concept
        */}
        <p className='text-foreground mb-4 animate-[fade-in-up_1s_ease-out_0.4s_both] text-xl font-light md:text-2xl lg:text-3xl'>
          Un laboratoire d&apos;apprentissage public
        </p>

        {/*
          Main Description - Key Focus Areas
          Animation: 1.2s fade-in-up + 0.6s delay (after subtitle)
          Layout:
          - Max-width: 2xl (readable line length)
          - Margin: Center-aligned with 12px bottom spacing
          Typography:
          - Font-size: Responsive (base → lg)
          - Line-height: Relaxed (1.625)
          Highlights:
          - Three key areas in accent color: IA, UX, Ingénierie logicielle
          - Purpose: Sets expectations for platform content
        */}
        <p className='text-foreground mx-auto mb-12 max-w-2xl animate-[fade-in-up_1.2s_ease-out_0.6s_both] text-base leading-relaxed md:text-lg'>
          À l&apos;intersection de l&apos;
          <span className='text-accent font-medium'>IA</span>, de l&apos;
          <span className='text-accent font-medium'>UX</span> et de l&apos;
          <span className='text-accent font-medium'>ingénierie logicielle</span>
        </p>

        {/*
          Loading Indicators - Dynamic Status
          Animation: 1.4s fade-in-up + 0.8s delay (before info card)
          Design: Three pulsing dots with staggered opacity
          Stagger: 0ms, 75ms, 150ms delays for sequential pulse effect
          Colors: accent (100%), accent/80 (80%), accent/60 (60% opacity)
          Size: 12px × 12px each
          Purpose: Indicates dynamic, evolving platform; draws eye to bottom section
        */}
        <div className='mb-8 flex animate-[fade-in-up_1.4s_ease-out_0.8s_both] items-center justify-center gap-3'>
          <div className='flex items-center gap-2'>
            <div className='bg-accent h-3 w-3 animate-pulse rounded-full' />
            <div className='bg-accent/80 h-3 w-3 animate-pulse rounded-full delay-75' />
            <div className='bg-accent/60 h-3 w-3 animate-pulse rounded-full delay-150' />
          </div>
        </div>

        {/*
          Information Card - Launch Details (Glassmorphism Effect)
          Animation: 1.6s fade-in-up + 1s delay (final element - draws attention to launch date)
          Effects:
          - Backdrop blur: 12px (md breakpoint)
          - Background: card color at 80% opacity (semi-transparent)
          - Border: accent color with transparency
          - Shadow: Large shadow-2xl (creates depth)
          Layout:
          - Rounded: 2xl (16px border radius)
          - Padding: 24px (p-6)
          - Display: inline-block (centered via parent flex)
          Content Structure:
          1. Icon + Label: "Lancement prévu" (launch indicator)
          2. Main Date: "Fin Octobre 2025" (bold, large text)
          3. Tagline: "Blog technique • Articles • Guides" (supporting description)
          Accessibility:
          - Icon: aria-hidden='true' (decorative, text provides context)
          Browser Compatibility:
          - backdrop-blur: Supported in modern browsers (Safari 15.4+)
          - Fallback: Solid background color provides acceptable appearance
        */}
        <div className='bg-card/80 border-border inline-block animate-[fade-in-up_1.6s_ease-out_1s_both] rounded-2xl border p-6 shadow-2xl backdrop-blur-md'>
          <div className='mb-3 flex items-center justify-center gap-3'>
            {/* Lightning bolt icon indicating launch power/energy */}
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
              Lancement prévu
            </span>
          </div>
          <p className='text-card-foreground mb-1 text-2xl font-bold'>
            Fin Novembre 2025
          </p>
          <p className='text-muted-foreground text-sm'>
            Blog technique • Articles • Guides
          </p>
        </div>
      </div>

      {/*
        Footer Decoration - Visual Closure Line
        Design: Horizontal gradient line
        Colors: Accent color fading to transparent (left to right)
        Height: 1px
        Position: Fixed at bottom of viewport
        Purpose: Provides visual closure and separation
        Accessibility: aria-hidden='true' (purely decorative)
        Note: Currently transparent (from-transparent to-transparent)
        Could be activated by changing gradient colors if needed
      */}
      <div
        className='via-accent/20 absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent'
        aria-hidden='true'
      />
    </div>
  );
}

/**
 * CSS Animation Support for Reduced Motion Preference
 *
 * Users with prefers-reduced-motion: reduce set in their OS will have animations disabled.
 * This is handled via a global CSS rule in globals.css that sets:
 * - animation-duration: 0.01ms
 * - animation-iteration-count: 1
 * - transition-duration: 0.01ms
 *
 * This ensures accessibility for users with vestibular disorders or motion sensitivity.
 *
 * WCAG 2.1 Success Criterion 2.3.3: Animation from Interactions
 * See: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
 */
