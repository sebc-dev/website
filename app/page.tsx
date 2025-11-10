export default function HomePage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-background">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient de base */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted via-30% via-card via-60% via-muted via-80% to-background" />

        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--accent) / 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--accent) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm animate-[fade-in-up_0.6s_ease-out]">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-sm font-medium text-accent">
            En développement
          </span>
        </div>

        {/* Titre principal */}
        <h1 className="font-mono font-bold text-6xl md:text-8xl lg:text-9xl mb-6 tracking-tighter animate-[fade-in-up_0.8s_ease-out_0.2s_both]">
          <span className="bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-gradient bg-clip-text text-transparent">
            sebc.dev
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-xl md:text-2xl lg:text-3xl text-foreground mb-4 font-light animate-[fade-in-up_1s_ease-out_0.4s_both]">
          Un laboratoire d&apos;apprentissage public
        </p>

        {/* Description */}
        <p className="text-base md:text-lg text-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-[fade-in-up_1.2s_ease-out_0.6s_both]">
          À l&apos;intersection de l&apos;
          <span className="text-accent font-medium">IA</span>, de l&apos;
          <span className="text-accent font-medium">UX</span> et de l&apos;
          <span className="text-accent font-medium">ingénierie logicielle</span>
        </p>

        {/* Indicateurs de chargement stylisés */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-[fade-in-up_1.4s_ease-out_0.8s_both]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-accent/80 rounded-full animate-pulse delay-75" />
            <div className="w-3 h-3 bg-accent/60 rounded-full animate-pulse delay-150" />
          </div>
        </div>

        {/* Carte d'info avec effet glassmorphism */}
        <div className="inline-block p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-2xl animate-[fade-in-up_1.6s_ease-out_1s_both]">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm font-medium text-card-foreground">
              Lancement prévu
            </span>
          </div>
          <p className="text-2xl font-bold text-card-foreground mb-1">
            Fin Octobre 2025
          </p>
          <p className="text-sm text-muted-foreground">
            Blog technique • Articles • Guides
          </p>
        </div>
      </div>

      {/* Décoration bas de page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
