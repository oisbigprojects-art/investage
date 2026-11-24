import React from 'react';
import { Composition, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { Uzum, UZUM_SECONDS } from './Uzum';
import { UzumV3, UZUM_V3_SECONDS } from './UzumV3';
import { UzumV4, UZUM_V4_SECONDS } from './UzumV4';

// Manrope (OFL) — yangi alifbo harflari (Ö, Ğ, Ş, Ç) bor
loadFont({ family: 'Manrope', url: staticFile('fonts/Manrope.ttf'), weight: '200 800' });

const FPS = 60;

export const Root = () => (
  <>
    <Composition id="Uzum" component={Uzum} durationInFrames={Math.round(UZUM_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UzumV3" component={UzumV3} durationInFrames={Math.round(UZUM_V3_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="UzumV4" component={UzumV4} durationInFrames={Math.round(UZUM_V4_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
