import { BookmarkIcon } from './icons';
import { toggleSaved } from '@/app/cabinet-actions';

// Investor uchun "saqlash" tugmasi (JS talab qilinmaydi: oddiy forma)
export default function SaveButton({ startupId, saved, back, withLabel = false, t }) {
  return (
    <form action={toggleSaved} className={withLabel ? 'save-form' : 'save-form save-icon'}>
      <input type="hidden" name="startup_id" value={startupId} />
      <input type="hidden" name="op" value={saved ? 'unsave' : 'save'} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        className={withLabel ? `btn btn-sm ${saved ? 'btn-gold' : 'btn-ghost'}` : `save-btn ${saved ? 'is-saved' : ''}`}
        aria-pressed={saved}
        aria-label={saved ? t('save.remove') : t('save.add')}
        title={saved ? t('save.remove') : t('save.add')}
      >
        <BookmarkIcon size={withLabel ? 16 : 18} filled={saved} />
        {withLabel && (saved ? t('save.saved') : t('save.add'))}
      </button>
    </form>
  );
}
