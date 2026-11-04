import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import { getT } from '@/lib/i18n/server';
import { pickStrings } from '@/lib/i18n';
import { localize } from '@/lib/onboarding';
import OnboardingForm from '@/components/OnboardingForm';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('ob.title') };
}

// Birinchi kirish (email yoki Google): majburiy anketa. To'ldirilmaguncha kabinet ochilmaydi.
// Google bilan kirganlar rolni ham shu yerda tanlaydi; email bilan ro'yxatdan o'tganlar uni avval tanlagan.
export default async function OnboardingPage() {
  const t = await getT();
  const { user, profile } = await getSession();
  if (!user) redirect('/kirish');
  if (profile?.onboarded) redirect('/kabinet');

  const chooseRole = (user.app_metadata?.provider || 'email') !== 'email';
  const st = localize('startup', t.lang);
  const inv = localize('investor', t.lang);
  const questions = chooseRole ? { startup: st.questions, investor: inv.questions } : { fixed: (profile.role === 'startup' ? st : inv).questions };
  const raw = pickStrings(t, ['signup.who', 'signup.startup', 'signup.startup_sub', 'signup.investor', 'signup.investor_sub', 'ob.role_fixed', 'ob.region', 'ob.region_pick', 'ob.postal', 'ob.postal_hint', 'ob.postal_hint_abroad', 'ob.submit']);
  const s = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.split('.')[1], v]));

  return (
    <div className="auth">
      <h1>{t('ob.title')}</h1>
      <p className="muted">{t('ob.sub')}</p>
      <OnboardingForm
        s={s}
        regions={st.regions}
        questions={questions}
        chooseRole={chooseRole}
        roleLabel={profile.role === 'startup' ? t('signup.startup') : t('signup.investor')}
        agree={
          <>
            {t('signup.agree_pre')} <Link href="/shartlar" target="_blank">{t('legal.terms_title')}</Link>{' '}
            {t('signup.agree_mid')} <Link href="/maxfiylik" target="_blank">{t('legal.privacy_title')}</Link>
            {t('signup.agree_post')}
          </>
        }
      />
    </div>
  );
}
