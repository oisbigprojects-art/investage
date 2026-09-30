import { BookmarkIcon } from './icons';
import { toggleSaved } from '@/app/kabinet/actions';

// Investor uchun "saqlash" tugmasi (JS talab qilinmaydi: oddiy forma)
export default function SaveButton({ startupId, saved, back, withLabel = false }) {
  return (
    <form action={toggleSaved} className={withLabel ? 'save-form' : 'save-form save-icon'}>
      <input type="hidden" name="startup_id" value={startupId} />
      <input type="hidden" name="op" value={saved ? 'unsave' : 'save'} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        className={withLabel ? `btn btn-sm ${saved ? 'btn-gold' : 'btn-ghost'}` : `save-btn ${saved ? 'is-saved' : ''}`}
        aria-pressed={saved}
        aria-label={saved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
        title={saved ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
      >
        <BookmarkIcon size={withLabel ? 16 : 18} filled={saved} />
        {withLabel && (saved ? 'Saqlangan' : 'Saqlash')}
      </button>
    </form>
  );
}
