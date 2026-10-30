import { googleSignIn } from '@/app/auth-actions';

// Google sozlanmaguncha (NEXT_PUBLIC_GOOGLE_AUTH=1) tugma ko'rinmaydi
export default function GoogleButton({ label, orLabel }) {
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH !== '1') return null;
  return (
    <form action={googleSignIn} className="google-form">
      <button className="btn btn-ghost google-btn" type="submit">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.7 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.2-9.8 6.2-17.4z" />
          <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.3-5.6L32 36.7c-2.1 1.4-4.8 2.3-8 2.3-6.3 0-11.7-4.2-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {label}
      </button>
      <p className="muted small center google-or">{orLabel}</p>
    </form>
  );
}
