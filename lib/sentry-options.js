// Sentry umumiy sozlamalari. DSN bo'lmasa, hech narsa yuborilmaydi.
// Shaxsiy ma'lumot yuborilmaydi: foydalanuvchi, IP, cookie, sarlavha va so'rov tanasi olib tashlanadi,
// manzildan esa ? dan keyingi qism kesiladi. Sessiya yozuvi (Replay) ishlatilmaydi.
const noQuery = (url) => (typeof url === 'string' ? url.split('?')[0] : url);

export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend(event) {
    delete event.user;
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
      delete event.request.data;
      delete event.request.query_string;
      event.request.url = noQuery(event.request.url);
    }
    return event;
  },
  beforeBreadcrumb(crumb) {
    if (crumb.category === 'ui.input' || crumb.category === 'console') return null;
    if (crumb.data?.url) crumb.data.url = noQuery(crumb.data.url);
    if (crumb.data?.to) crumb.data.to = noQuery(crumb.data.to);
    if (crumb.data?.from) crumb.data.from = noQuery(crumb.data.from);
    return crumb;
  },
};
