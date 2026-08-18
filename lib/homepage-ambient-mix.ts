export const AMBIENT_LAYERS = [
  "wind",
  "birds",
  "insects",
  "water",
  "waterfall",
  "foliage",
] as const;

export type AmbientLayer = (typeof AMBIENT_LAYERS)[number];

export type AmbientZone =
  | "hero"
  | "about"
  | "villa"
  | "forest"
  | "experience"
  | "locationCta"
  | "footer";

export type LayerMix = Record<AmbientLayer, number>;

export type ZoneWeights = Partial<Record<AmbientZone, number>>;

export const AMBIENT_ZONES: AmbientZone[] = [
  "hero",
  "about",
  "villa",
  "forest",
  "experience",
  "locationCta",
  "footer",
];

export const AMBIENT_LAYER_SRCS: Record<AmbientLayer, string> = {
  wind: "/audio/optimized/wind.mp3",
  birds: "/audio/optimized/birds.mp3",
  insects: "/audio/optimized/insects.mp3",
  water: "/audio/optimized/water.mp3",
  waterfall: "/audio/optimized/waterfall.mp3",
  foliage: "/audio/optimized/foliage.mp3",
};

export const AMBIENT_MASTER = 0.38;
export const AMBIENT_LERP_TAU = 3.4;
export const FILTER_LERP_TAU = 1.8;
export const WEIGHT_LERP_TAU = 1.05;
export const VELOCITY_DECAY_TAU = 1.8;

/** Stream and waterfall arrive a beat after birds; foliage tracks scroll. */
export const LAYER_LERP_TAU: Record<AmbientLayer, number> = {
  wind: 2.2,
  birds: 1.8,
  insects: 2.4,
  water: 2.8,
  waterfall: 3.2,
  foliage: 1.4,
};

export const LAYER_TRIM: Record<AmbientLayer, number> = {
  wind: 0.55,
  birds: 1.15,
  insects: 0.7,
  water: 0.9,
  waterfall: 1.05,
  foliage: 0.85,
};

export const LAYER_PAN: Record<AmbientLayer, number> = {
  wind: -0.22,
  birds: 0,
  insects: 0.1,
  water: 0.32,
  waterfall: -0.22,
  foliage: 0.28,
};

export const LAYER_HIGHPASS_HZ: Record<AmbientLayer, number> = {
  wind: 100,
  birds: 400,
  insects: 2000,
  water: 150,
  waterfall: 80,
  foliage: 200,
};

export const LAYER_LOWPASS_FLOOR_HZ: Record<AmbientLayer, number> = {
  wind: 4000,
  birds: 9000,
  insects: 7000,
  water: 3000,
  waterfall: 2500,
  foliage: 5000,
};

export const BIRD_PAN_LFO_HZ = 0.018;
export const BIRD_PAN_LFO_AMP = 0.14;
export const INSECT_PAN_LFO_HZ = 0.021;
export const INSECT_PAN_LFO_AMP = 0.08;
export const INSECT_PAN_LFO_PHASE = 1.7;

const EXPERIENCE_SCROLL_TO_CLOSE = 0.72;
const EXPERIENCE_HOVER_TO_CLOSE = 0.4;
const VILLA_WATER_START = 0.5;
const VILLA_WATER_RAMP = 0.22;
const VILLA_WATER_AMOUNT = 0.22;

const ZERO_MIX: LayerMix = {
  wind: 0,
  birds: 0,
  insects: 0,
  water: 0,
  waterfall: 0,
  foliage: 0,
};

const MIX: Record<Exclude<AmbientZone, "forest">, LayerMix> = {
  hero: {
    wind: 0.4,
    birds: 0.62,
    insects: 0.12,
    water: 0,
    waterfall: 0,
    foliage: 0.28,
  },
  about: {
    wind: 0.28,
    birds: 0.7,
    insects: 0.32,
    water: 0,
    waterfall: 0,
    foliage: 0.38,
  },
  villa: {
    wind: 0.18,
    birds: 0.4,
    insects: 0.16,
    water: 0,
    waterfall: 0,
    foliage: 0.14,
  },
  experience: {
    wind: 0.22,
    birds: 0.45,
    insects: 0.28,
    water: 0.32,
    waterfall: 0.38,
    foliage: 0.28,
  },
  locationCta: {
    wind: 0.2,
    birds: 0.22,
    insects: 0.1,
    water: 0.04,
    waterfall: 0,
    foliage: 0.08,
  },
  footer: {
    wind: 0.08,
    birds: 0.04,
    insects: 0.05,
    water: 0,
    waterfall: 0,
    foliage: 0,
  },
};

const FOREST_MIX = {
  estate: {
    wind: 0.22,
    birds: 0.72,
    insects: 0.48,
    water: 0.38,
    waterfall: 0.08,
    foliage: 0.52,
  },
  waterfalls: {
    wind: 0.14,
    birds: 0.22,
    insects: 0.12,
    water: 0.28,
    waterfall: 0.88,
    foliage: 0.18,
  },
  trails: {
    wind: 0.32,
    birds: 0.68,
    insects: 0.5,
    water: 0.16,
    waterfall: 0.1,
    foliage: 0.48,
  },
} as const satisfies Record<string, LayerMix>;

const LOWPASS_HZ: Record<Exclude<AmbientZone, "forest">, number> = {
  hero: 12000,
  about: 10000,
  villa: 5500,
  experience: 11000,
  locationCta: 4500,
  footer: 1800,
};

const FOREST_LOWPASS = {
  estate: 12800,
  waterfalls: 11000,
  trails: 15500,
} as const;

const FOREST_HOLD = {
  estateEnd: 0.12,
  waterfallStart: 0.38,
  waterfallEnd: 0.64,
  trailsStart: 0.88,
} as const;

const EXPERIENCE_CLOSE: LayerMix = {
  wind: 0.18,
  birds: 0.28,
  insects: 0.2,
  water: 0.4,
  waterfall: 0.7,
  foliage: 0.22,
};

type MixState = {
  zone: AmbientZone;
  weights: ZoneWeights;
  targetWeights: ZoneWeights;
  weightsPrimed: boolean;
  forestProgress: number;
  villaProgress: number;
  experienceWaterNudge: number;
  experienceScrollCloseness: number;
  velocityBump: number;
};

const state: MixState = {
  zone: "hero",
  weights: { hero: 1 },
  targetWeights: { hero: 1 },
  weightsPrimed: false,
  forestProgress: 0,
  villaProgress: 0,
  experienceWaterNudge: 0,
  experienceScrollCloseness: 0,
  velocityBump: 0,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function smoothstep01(value: number) {
  const k = clamp01(value);
  return k * k * (3 - 2 * k);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

function lerpMix(a: LayerMix, b: LayerMix, t: number): LayerMix {
  const k = clamp01(t);
  const mix = { ...ZERO_MIX };
  for (const layer of AMBIENT_LAYERS) {
    mix[layer] = a[layer] + (b[layer] - a[layer]) * k;
  }
  return mix;
}

function forestTravel(progress: number): { mix: LayerMix; lowpass: number } {
  const t = clamp01(progress);

  if (t <= FOREST_HOLD.estateEnd) {
    return { mix: { ...FOREST_MIX.estate }, lowpass: FOREST_LOWPASS.estate };
  }

  if (t < FOREST_HOLD.waterfallStart) {
    const u = smoothstep01(
      (t - FOREST_HOLD.estateEnd) /
        (FOREST_HOLD.waterfallStart - FOREST_HOLD.estateEnd),
    );
    return {
      mix: lerpMix(FOREST_MIX.estate, FOREST_MIX.waterfalls, u),
      lowpass: lerp(FOREST_LOWPASS.estate, FOREST_LOWPASS.waterfalls, u),
    };
  }

  if (t <= FOREST_HOLD.waterfallEnd) {
    return {
      mix: { ...FOREST_MIX.waterfalls },
      lowpass: FOREST_LOWPASS.waterfalls,
    };
  }

  if (t < FOREST_HOLD.trailsStart) {
    const u = smoothstep01(
      (t - FOREST_HOLD.waterfallEnd) /
        (FOREST_HOLD.trailsStart - FOREST_HOLD.waterfallEnd),
    );
    return {
      mix: lerpMix(FOREST_MIX.waterfalls, FOREST_MIX.trails, u),
      lowpass: lerp(FOREST_LOWPASS.waterfalls, FOREST_LOWPASS.trails, u),
    };
  }

  return { mix: { ...FOREST_MIX.trails }, lowpass: FOREST_LOWPASS.trails };
}

function forestMix(progress: number): LayerMix {
  return forestTravel(progress).mix;
}

function forestLowpass(progress: number) {
  return forestTravel(progress).lowpass;
}

function experienceCloseness() {
  return clamp01(
    state.experienceScrollCloseness * EXPERIENCE_SCROLL_TO_CLOSE +
      state.experienceWaterNudge * EXPERIENCE_HOVER_TO_CLOSE,
  );
}

function experienceMix(): LayerMix {
  return lerpMix(MIX.experience, EXPERIENCE_CLOSE, experienceCloseness());
}

function villaMix(progress: number): LayerMix {
  const mix = { ...MIX.villa };
  mix.water =
    smoothstep01((progress - VILLA_WATER_START) / VILLA_WATER_RAMP) *
    VILLA_WATER_AMOUNT;
  return mix;
}

function mixForZone(zone: AmbientZone): LayerMix {
  if (zone === "forest") return forestMix(state.forestProgress);
  if (zone === "villa") return villaMix(state.villaProgress);
  if (zone === "experience") return experienceMix();
  return { ...MIX[zone] };
}

function lowpassForZone(zone: AmbientZone) {
  if (zone === "forest") return forestLowpass(state.forestProgress);
  return LOWPASS_HZ[zone];
}

function copyWeights(weights: ZoneWeights): ZoneWeights {
  const next: ZoneWeights = {};
  for (const zone of AMBIENT_ZONES) {
    const value = weights[zone] ?? 0;
    if (value > 0.001) next[zone] = value;
  }
  return next;
}

function weightsEqual(a: ZoneWeights, b: ZoneWeights) {
  for (const zone of AMBIENT_ZONES) {
    const left = a[zone] ?? 0;
    const right = b[zone] ?? 0;
    if (Math.abs(left - right) > 0.0001) return false;
  }
  return true;
}

function normalizedWeights(): Array<[AmbientZone, number]> {
  const entries = (
    Object.entries(state.weights) as Array<[AmbientZone, number]>
  ).filter(([, weight]) => weight > 0.001);

  if (entries.length === 0) return [[state.zone, 1]];

  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return [[state.zone, 1]];
  return entries.map(([zone, weight]) => [zone, weight / total]);
}

function dominantZone(weights: Array<[AmbientZone, number]>): AmbientZone {
  let best: AmbientZone = state.zone;
  let bestWeight = -1;
  for (const [zone, weight] of weights) {
    if (weight > bestWeight) {
      best = zone;
      bestWeight = weight;
    }
  }
  return best;
}

export function lerpToward(
  current: number,
  target: number,
  dt: number,
  tau = AMBIENT_LERP_TAU,
) {
  if (tau <= 0) return target;
  const k = 1 - Math.exp(-dt / tau);
  return current + (target - current) * k;
}

export function getLayerTargets(): LayerMix {
  const weights = normalizedWeights();
  const mix = { ...ZERO_MIX };

  for (const [zone, weight] of weights) {
    const zoneMix = mixForZone(zone);
    for (const layer of AMBIENT_LAYERS) {
      mix[layer] += zoneMix[layer] * weight;
    }
  }

  const forestW = weights.find(([zone]) => zone === "forest")?.[1] ?? 0;
  const villaW = weights.find(([zone]) => zone === "villa")?.[1] ?? 0;
  const bump = clamp01(state.velocityBump);
  if (bump > 0) {
    const foliageAdd = 0.08 + forestW * 0.14 - villaW * 0.02;
    const windAdd = 0.05 + forestW * 0.05 - villaW * 0.015;
    mix.foliage = Math.min(1, mix.foliage + bump * Math.max(0, foliageAdd));
    mix.wind = Math.min(1, mix.wind + bump * Math.max(0, windAdd));
  }

  return mix;
}

export function getToneTargets(): {
  lowpass: number;
  layerLowpass: Record<AmbientLayer, number>;
} {
  const weights = normalizedWeights();
  let logSum = 0;
  for (const [zone, weight] of weights) {
    logSum += Math.log(Math.max(200, lowpassForZone(zone))) * weight;
  }
  const lowpass = Math.exp(logSum);
  const layerLowpass = {} as Record<AmbientLayer, number>;
  for (const layer of AMBIENT_LAYERS) {
    layerLowpass[layer] = Math.max(LAYER_LOWPASS_FLOOR_HZ[layer], lowpass);
  }
  return { lowpass, layerLowpass };
}

export function setZoneWeights(weights: ZoneWeights) {
  const next = copyWeights(weights);
  if (weightsEqual(state.targetWeights, next) && state.weightsPrimed) return;

  state.targetWeights = next;

  if (!state.weightsPrimed) {
    state.weights = copyWeights(next);
    state.weightsPrimed = true;
    state.zone = dominantZone(normalizedWeights());
  }
}

export function smoothZoneWeights(dt: number) {
  const next: ZoneWeights = {};
  let changed = false;

  for (const zone of AMBIENT_ZONES) {
    const current = state.weights[zone] ?? 0;
    const target = state.targetWeights[zone] ?? 0;
    const smoothed = lerpToward(current, target, dt, WEIGHT_LERP_TAU);
    if (smoothed > 0.001) next[zone] = smoothed;
    if (Math.abs(smoothed - current) > 0.00008) changed = true;
  }

  if (!changed) return;

  state.weights = next;
  state.zone = dominantZone(normalizedWeights());
}

export function setForestSlideProgress(progress: number) {
  const next = clamp01(progress);
  if (state.forestProgress === next) return;
  state.forestProgress = next;
}

export function setVillaProgress(progress: number) {
  const next = clamp01(progress);
  if (state.villaProgress === next) return;
  state.villaProgress = next;
}

export function setExperienceWaterNudge(nudge: number) {
  const next = clamp01(nudge);
  if (state.experienceWaterNudge === next) return;
  state.experienceWaterNudge = next;
}

export function setExperienceScrollCloseness(closeness: number) {
  const next = clamp01(closeness);
  if (state.experienceScrollCloseness === next) return;
  state.experienceScrollCloseness = next;
}

export function setVelocityBump(bump: number) {
  const next = clamp01(bump);
  if (state.velocityBump === next) return;
  state.velocityBump = next;
}

export function decayVelocityBump(dt: number) {
  if (state.velocityBump <= 0) return;
  state.velocityBump = Math.max(0, state.velocityBump - dt / VELOCITY_DECAY_TAU);
}

export function resetHomepageMix() {
  state.zone = "hero";
  state.weights = { hero: 1 };
  state.targetWeights = { hero: 1 };
  state.weightsPrimed = false;
  state.forestProgress = 0;
  state.villaProgress = 0;
  state.experienceWaterNudge = 0;
  state.experienceScrollCloseness = 0;
  state.velocityBump = 0;
}
