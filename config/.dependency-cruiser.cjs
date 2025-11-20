/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-server-in-client',
      severity: 'error',
      comment:
        'Client Components cannot import server-only code (security & bundle size risk)',
      from: {
        path: '^(lib|app)/.*',
        pathNot: '^lib/server',
      },
      to: {
        path: [
          '^lib/server', // Code serveur explicite
          'drizzle-orm', // ORM (DB queries)
          '@cloudflare/workers-types', // Types Workers
          'jose', // JWT validation (server-only)
        ],
        dependencyTypes: ['import', 'require', 'import-equals'],
      },
    },
    {
      name: 'no-circular-dependencies',
      severity: 'warn',
      comment: 'Circular dependencies can cause runtime issues',
      from: {},
      to: {
        circular: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', '.next', '.open-next'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
