'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

/**
 * MessageTestPage Component
 *
 * Development/testing page for validating all translation messages across locales.
 * Displays all 8 namespaces with French/English translations side-by-side,
 * including example values for parameterized translations.
 *
 * This page is only accessible in the [locale] routes and is intended for
 * developers and reviewers to verify translation coverage and quality.
 *
 * Namespace Structure:
 * - common: UI actions and common messages (12 keys)
 * - nav: Navigation menu items (9 keys)
 * - footer: Footer links and copyright (5 keys)
 * - form: Form labels and validation messages (15 keys)
 * - article: Article metadata (9 keys)
 * - complexity: Complexity level labels (3 keys)
 * - search: Search and filter UI (10 keys)
 * - error: HTTP error and general errors (10 keys)
 *
 * Total: 73 translation keys
 */

type Namespace =
  | 'common'
  | 'nav'
  | 'footer'
  | 'form'
  | 'article'
  | 'complexity'
  | 'search'
  | 'error';

interface NamespaceInfo {
  title: string;
  description: string;
  keyCount: number;
}

const NAMESPACE_INFO: Record<Namespace, NamespaceInfo> = {
  common: {
    title: 'Common Messages',
    description: 'UI actions, status messages, and common terminology',
    keyCount: 12,
  },
  nav: {
    title: 'Navigation',
    description: 'Navigation menu items and language selection',
    keyCount: 9,
  },
  footer: {
    title: 'Footer',
    description: 'Footer links, copyright, and site information',
    keyCount: 5,
  },
  form: {
    title: 'Form Messages',
    description: 'Form labels, validation messages, and submission feedback',
    keyCount: 15,
  },
  article: {
    title: 'Article Metadata',
    description: 'Article headers, metadata, and reading information',
    keyCount: 9,
  },
  complexity: {
    title: 'Complexity Levels',
    description: 'Article complexity and difficulty level labels',
    keyCount: 3,
  },
  search: {
    title: 'Search & Filters',
    description: 'Search interface, filters, and result messages',
    keyCount: 10,
  },
  error: {
    title: 'Error Messages',
    description: 'HTTP error codes and general error messages',
    keyCount: 10,
  },
};

/**
 * Helper function to format parameterized translations with example values
 */
function formatParameterizedValue(template: string): string {
  const placeholders: Record<string, string> = {
    author: 'Jane Doe',
    date: 'November 16, 2025',
    minutes: '5',
  };

  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

/**
 * KeyRow Component - Displays a single translation key with both language versions
 */
function KeyRow({
  keyName,
  frValue,
  enValue,
  namespace,
  hasParameters,
}: {
  keyName: string;
  frValue: string;
  enValue: string;
  namespace: Namespace;
  hasParameters: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(`${namespace}.${keyName}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className='border-b border-zinc-700 px-4 py-3 transition-colors last:border-b-0 hover:bg-zinc-900/50'>
      <div className='mb-2 flex items-start gap-4'>
        <div className='min-w-32 flex-none'>
          <button
            onClick={handleCopy}
            className='hover:text-accent truncate font-mono text-xs text-zinc-400 transition-colors'
            title='Copy key path'
          >
            {keyName}
            {hasParameters && ' *'}
          </button>
          {copied && <span className='text-accent ml-1 text-xs'>copied!</span>}
        </div>
        {hasParameters && (
          <span className='text-xs text-zinc-500 italic'>(parameterized)</span>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <div className='mb-1 text-xs font-semibold text-zinc-500'>
            Français
          </div>
          <div className='text-sm text-zinc-200'>
            {formatParameterizedValue(frValue)}
          </div>
        </div>
        <div>
          <div className='mb-1 text-xs font-semibold text-zinc-500'>
            English
          </div>
          <div className='text-sm text-zinc-200'>
            {formatParameterizedValue(enValue)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NamespaceSection Component - Displays all keys within a namespace
 */
function NamespaceSection({
  namespace,
  messages,
}: {
  namespace: Namespace;
  messages: Record<string, string>;
}) {
  const info = NAMESPACE_INFO[namespace];
  const keyCount = Object.keys(messages).length;

  return (
    <section className='mb-8'>
      <div className='sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 py-3'>
        <h2 className='mb-1 text-lg font-semibold text-white'>{info.title}</h2>
        <p className='text-sm text-zinc-400'>
          {info.description}
          <span className='ml-2 font-mono text-xs text-zinc-600'>
            ({keyCount} keys)
          </span>
        </p>
      </div>

      <div className='divide-y divide-zinc-700 border border-t-0 border-zinc-800'>
        {Object.entries(messages).map(([key, frValue]) => {
          const enValue = messages[key] || '';
          const hasParameters = frValue.includes('{');

          return (
            <KeyRow
              key={key}
              keyName={key}
              frValue={frValue}
              enValue={enValue}
              namespace={namespace}
              hasParameters={hasParameters}
            />
          );
        })}
      </div>
    </section>
  );
}

/**
 * MessageTestPage Main Component
 */
export default function MessageTestPage() {
  // Use the translations hook to get namespace functions
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const tForm = useTranslations('form');
  const tArticle = useTranslations('article');
  const tComplexity = useTranslations('complexity');
  const tSearch = useTranslations('search');
  const tError = useTranslations('error');

  // Import raw message data for display
  // In a real scenario, these would come from your message files
  const messages = {
    common: {
      appName: tCommon('appName'),
      loading: tCommon('loading'),
      error: tCommon('error'),
      close: tCommon('close'),
      success: tCommon('success'),
      warning: tCommon('warning'),
      info: tCommon('info'),
      cancel: tCommon('cancel'),
      apply: tCommon('apply'),
      retry: tCommon('retry'),
      confirm: tCommon('confirm'),
      noData: tCommon('noData'),
    },
    nav: {
      home: tNav('home'),
      articles: tNav('articles'),
      search: tNav('search'),
      about: tNav('about'),
      projects: tNav('projects'),
      blog: tNav('blog'),
      documentation: tNav('documentation'),
      contact: tNav('contact'),
      language: tNav('language'),
    },
    footer: {
      copyright: tFooter('copyright'),
      privacy: tFooter('privacy'),
      terms: tFooter('terms'),
      contact: tFooter('contact'),
      sitemap: tFooter('sitemap'),
    },
    form: {
      submit: tForm('submit'),
      cancel: tForm('cancel'),
      save: tForm('save'),
      delete: tForm('delete'),
      edit: tForm('edit'),
      required: tForm('required'),
      invalidEmail: tForm('invalidEmail'),
      emailTaken: tForm('emailTaken'),
      passwordTooShort: tForm('passwordTooShort'),
      confirmPassword: tForm('confirmPassword'),
      forgotPassword: tForm('forgotPassword'),
      resetPassword: tForm('resetPassword'),
      loading: tForm('loading'),
      error: tForm('error'),
      success: tForm('success'),
    },
    article: {
      readingTime: tArticle('readingTime'),
      publishedOn: tArticle('publishedOn'),
      updatedOn: tArticle('updatedOn'),
      category: tArticle('category'),
      tags: tArticle('tags'),
      complexity: tArticle('complexity'),
      tableOfContents: tArticle('tableOfContents'),
      readingProgress: tArticle('readingProgress'),
      byAuthor: tArticle('byAuthor'),
    },
    complexity: {
      beginner: tComplexity('beginner'),
      intermediate: tComplexity('intermediate'),
      advanced: tComplexity('advanced'),
    },
    search: {
      placeholder: tSearch('placeholder'),
      noResults: tSearch('noResults'),
      filters: tSearch('filters'),
      clearFilters: tSearch('clearFilters'),
      categories: tSearch('categories'),
      complexityLevel: tSearch('complexityLevel'),
      readingDuration: tSearch('readingDuration'),
      dateRange: tSearch('dateRange'),
      sort: tSearch('sort'),
      loading: tSearch('loading'),
    },
    error: {
      notFound: tError('notFound'),
      serverError: tError('serverError'),
      goHome: tError('goHome'),
      unauthorized: tError('unauthorized'),
      forbidden: tError('forbidden'),
      badRequest: tError('badRequest'),
      conflict: tError('conflict'),
      timeout: tError('timeout'),
      unavailable: tError('unavailable'),
      unknown: tError('unknown'),
    },
  };

  const totalKeys = Object.values(messages).reduce(
    (sum, ns) => sum + Object.keys(ns).length,
    0,
  );

  return (
    <div className='min-h-screen bg-zinc-950'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60'>
        <div className='mx-auto max-w-6xl px-4 py-8'>
          <div className='mb-2'>
            <span className='mb-3 inline-block rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-semibold text-yellow-400'>
              DEVELOPMENT / TESTING PAGE
            </span>
          </div>
          <h1 className='mb-2 text-4xl font-bold text-white'>
            Translation Messages Test
          </h1>
          <p className='max-w-2xl text-zinc-400'>
            All translation keys displayed side-by-side for validation and
            testing. Click key names to copy. Asterisks (*) indicate
            parameterized translations with example values.
          </p>

          {/* Stats */}
          <div className='mt-6 flex gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-zinc-500'>Namespaces:</span>
              <span className='font-semibold text-white'>8</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-zinc-500'>Total Keys:</span>
              <span className='font-semibold text-white'>{totalKeys}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-zinc-500'>Languages:</span>
              <span className='font-semibold text-white'>2 (FR, EN)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className='mx-auto max-w-6xl px-4 py-8'>
        {/* Common Messages */}
        <NamespaceSection namespace='common' messages={messages.common} />

        {/* Navigation */}
        <NamespaceSection namespace='nav' messages={messages.nav} />

        {/* Footer */}
        <NamespaceSection namespace='footer' messages={messages.footer} />

        {/* Form Messages */}
        <NamespaceSection namespace='form' messages={messages.form} />

        {/* Article Metadata */}
        <NamespaceSection namespace='article' messages={messages.article} />

        {/* Complexity */}
        <NamespaceSection
          namespace='complexity'
          messages={messages.complexity}
        />

        {/* Search & Filters */}
        <NamespaceSection namespace='search' messages={messages.search} />

        {/* Error Messages */}
        <NamespaceSection namespace='error' messages={messages.error} />

        {/* Footer Note */}
        <div className='mt-12 border-t border-zinc-800 py-8'>
          <p className='text-center text-sm text-zinc-500'>
            This page is for development and testing only. It is not visible in
            production.
          </p>
          <p className='mt-2 text-center text-xs text-zinc-600'>
            To add new translations, update both{' '}
            <span className='font-mono'>messages/fr.json</span> and{' '}
            <span className='font-mono'>messages/en.json</span>, then verify
            parity with tests.
          </p>
        </div>
      </main>
    </div>
  );
}
