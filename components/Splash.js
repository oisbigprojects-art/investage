// Saytga birinchi kirganda ko'rinadigan kirish animatsiyasi (faqat CSS, kutubxonasiz).
// Logotip ochiladi, ostida o'sib borayotgan investitsiya ustunlari va o'sish chizig'i chiziladi, so'ng parda tepaga siljiydi.
// Bir sessiyada bir marta ko'rsatiladi; animatsiyani kamaytirishni tanlaganlarga ko'rsatilmaydi.
const SKIP = "try{if(sessionStorage.getItem('inv_splash')){document.getElementById('splash').style.display='none'}else{sessionStorage.setItem('inv_splash','1')}}catch(e){}";

export default function Splash() {
  return (
    <>
      <div id="splash" className="splash" aria-hidden="true" suppressHydrationWarning>
        <div className="splash-box">
          <img className="splash-logo" src="/logo-dark.webp" alt="" width="240" height="65" />
          <svg className="splash-chart" viewBox="0 0 160 70" fill="none" aria-hidden="true" focusable="false">
            <rect className="sb sb1" x="8" y="46" width="18" height="22" rx="6" />
            <rect className="sb sb2" x="34" y="36" width="18" height="32" rx="6" />
            <rect className="sb sb3" x="60" y="40" width="18" height="28" rx="6" />
            <rect className="sb sb4" x="86" y="24" width="18" height="44" rx="6" />
            <rect className="sb sb5" x="112" y="8" width="18" height="60" rx="6" />
            <path className="sline" d="M12 38 L43 26 L69 31 L95 14 L121 3" pathLength="1" />
            <circle className="sdot" cx="121" cy="3" r="4" />
          </svg>
        </div>
        <span className="splash-bar" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
    </>
  );
}
