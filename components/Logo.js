// Logotip: public/logo.webp (369×100)
export default function Logo({ height = 26 }) {
  return <img src="/logo.webp" alt="Investage" height={height} width={Math.round(height * 3.69)} />;
}
