import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from '@/lib/sentry-options';

// Brauzerdagi xatolarni kuzatish
Sentry.init(sentryOptions);
