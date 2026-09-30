import { investorContext } from '@/lib/cabinet';
import { Flash } from '@/components/ui';
import { saveInvestorProfile } from '../../actions';

export const metadata = { title: 'Profil — Investor kabineti — Investage' };

export default async function InvestorProfile({ searchParams }) {
  const sp = await searchParams;
  const { profile } = await investorContext();

  return (
    <>
      <div className="page-head">
        <span className="role-tag">Investor kabineti</span>
        <h1>Profil</h1>
        <p className="muted">
          Kirish so&apos;rovi yuborganingizda startap shu ma&apos;lumotlarni ko&apos;radi. Boshqa hech kimga ko&apos;rinmaydi.
        </p>
      </div>
      <Flash searchParams={sp} />

      <form action={saveInvestorProfile} className="card form">
        <div className="two">
          <label>
            Ism va familiya
            <input name="full_name" defaultValue={profile.full_name || ''} required maxLength={120} />
          </label>
          <label>
            Kompaniya yoki fond
            <input name="company" defaultValue={profile.company || ''} maxLength={120} placeholder="Ixtiyoriy" />
          </label>
        </div>
        <label>
          Qiziqish sohalari
          <input name="interests" defaultValue={profile.interests || ''} maxLength={200} placeholder="Masalan: FinTech, EdTech, AgroTech" />
        </label>
        <label>
          O&apos;zingiz haqingizda
          <textarea
            name="bio"
            rows={5}
            maxLength={600}
            defaultValue={profile.bio || ''}
            placeholder="Tajribangiz, qanday startaplarga qiziqasiz, qanday yordam bera olasiz"
          />
        </label>
        <p className="muted small">Email: {profile.email} (o&apos;zgartirib bo&apos;lmaydi).</p>
        <button className="btn btn-gold" type="submit">
          Saqlash
        </button>
      </form>
    </>
  );
}
