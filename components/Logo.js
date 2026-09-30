// Logotip: public/logo-dark.webp (engil fon uchun, 369×100)
export default function Logo({ height = 26 }) {
  return <img src="/logo-dark.webp" alt="Investage" height={height} width={Math.round(height * 3.69)} />;
}
