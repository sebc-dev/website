'use client';

import { useState } from 'react';

import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';

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
            type='button'
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
  frMessages: fr,
  enMessages: en,
}: {
  namespace: Namespace;
  frMessages: Record<string, string>;
  enMessages: Record<string, string>;
}) {
  const info = NAMESPACE_INFO[namespace];
  const keyCount = Object.keys(fr).length;

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
        {Object.entries(fr).map(([key, frValue]) => {
          const enValue = en[key] || '';
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
  // Calculate total keys from FR messages (both have same structure)
  const totalKeys = Object.values(frMessages).reduce(
    (sum, ns) => sum + Object.keys(ns as Record<string, string>).length,
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
        <NamespaceSection
          namespace='common'
          frMessages={frMessages.common as Record<string, string>}
          enMessages={enMessages.common as Record<string, string>}
        />

        {/* Navigation */}
        <NamespaceSection
          namespace='nav'
          frMessages={frMessages.nav as Record<string, string>}
          enMessages={enMessages.nav as Record<string, string>}
        />

        {/* Footer */}
        <NamespaceSection
          namespace='footer'
          frMessages={frMessages.footer as Record<string, string>}
          enMessages={enMessages.footer as Record<string, string>}
        />

        {/* Form Messages */}
        <NamespaceSection
          namespace='form'
          frMessages={frMessages.form as Record<string, string>}
          enMessages={enMessages.form as Record<string, string>}
        />

        {/* Article Metadata */}
        <NamespaceSection
          namespace='article'
          frMessages={frMessages.article as Record<string, string>}
          enMessages={enMessages.article as Record<string, string>}
        />

        {/* Complexity */}
        <NamespaceSection
          namespace='complexity'
          frMessages={frMessages.complexity as Record<string, string>}
          enMessages={enMessages.complexity as Record<string, string>}
        />

        {/* Search & Filters */}
        <NamespaceSection
          namespace='search'
          frMessages={frMessages.search as Record<string, string>}
          enMessages={enMessages.search as Record<string, string>}
        />

        {/* Error Messages */}
        <NamespaceSection
          namespace='error'
          frMessages={frMessages.error as Record<string, string>}
          enMessages={enMessages.error as Record<string, string>}
        />

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
