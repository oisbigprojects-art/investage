import { cookies } from 'next/headers';
import { cache } from 'react';
import { makeT } from './index';
import { normLang } from './format';

// Til cookie'dan olinadi (standart: o'zbekcha)
export const getLang = cache(async () => normLang((await cookies()).get('lang')?.value));

export const getT = cache(async () => makeT(await getLang()));
