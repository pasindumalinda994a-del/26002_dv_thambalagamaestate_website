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
  wind: "/audio/wind.mp3",
  birds: "/audio/birds.mp3",
  insects: "/audio/insects.wav",
  water: "/audio/water.mp3",
  waterfall: "/audio/waterfall.mp3",
  foliage: "/audio/foliage.mp3",
};

export const AMBIENT_MASTER = 0.3;
export const AMBIENT_LERP_TAU = 3.4;
export const FILTER_LERP_TAU = 2.8;
export const WEIGHT_LERP_TAU = 1.75;
export const VELOCITY_DECAY_TAU = 1.8;

/** Stream and waterfall arrive slowly; foliage still reacts a little faster. */
export const LAYER_LERP_TAU: Record<AmbientLayer, number> = {
  wind: 3.5,
  birds: 3.3,
  insects: 3.6,
  water: 4.5,
  waterfall: 6.0,
  foliage: 2.0,
};

export const LAYER_PAN: Record<AmbientLayer, number> = {
  wind: -0.14,
  birds: 0,
  insects: 0.1,
  water: 0.22,
  waterfall: -0.12,
  foliage: 0.18,
};

export const BIRD_PAN_LFO_HZ = 0.032;
export const BIRD_PAN_LFO_AMP = 0.34;

const EXPERIENCE_SCROLL_TO_CLOSE = 0.72;
const EXPERIENCE_HOVER_TO_CLOSE = 0.4;
const VILLA_WATER_START = 0.5;
const VILLA_WATER_RAMP = 0.22;
const VILLA_WATER_AMOUNT = 0.16;

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
    wind: 0.78,
    birds: 0.38,
    insects: 0.16,
    water: 0,
    waterfall: 0,
    foliage: 0.2,
  },
  about: {
    wind: 0.4,
    birds: 0.36,
    insects: 0.26,
    water: 0,
    waterfall: 0,
    foliage: 0.22,
  },
  villa: {
    wind: 0.32,
    birds: 0.28,
    insects: 0.22,
    water: 0,
    waterfall: 0,
    foliage: 0.16,
  },
  experience: {
    wind: 0.38,
    birds: 0.36,
    insects: 0.3,
    water: 0.28,
    waterfall: 0.22,
    foliage: 0.24,
  },
  locationCta: {
    wind: 0.28,
    birds: 0.18,
    insects: 0.14,
    water: 0.06,
    waterfall: 0,
    foliage: 0.12,
  },
  footer: ZERO_MIX,
};

const FOREST_MIX = {
  estate: {
    wind: 0.4,
    birds: 0.52,
    insects: 0.4,
    water: 0.52,
    waterfall: 0.04,
    foliage: 0.36,
  },
  waterfalls: {
    wind: 0.32,
    birds: 0.28,
    insects: 0.22,
    water: 0.24,
    waterfall: 0.72,
    foliage: 0.2,
  },
  trails: {
    wind: 0.46,
    birds: 0.5,
    insects: 0.44,
    water: 0.22,
    waterfall: 0.12,
    foliage: 0.4,
  },
} as const satisfies Record<string, LayerMix>;

const LOWPASS_HZ: Record<Exclude<AmbientZone, "forest">, number> = {
  hero: 8200,
  about: 7800,
  villa: 6200,
  experience: 10000,
  locationCta: 5200,
  footer: 1400,
};

const FOREST_LOWPASS = {
  estate: 12800,
  waterfalls: 11000,
  trails: 15500,
} as const;

const FOREST_HOLD = {
  estateEnd: 0.12,
  waterfallStart: 0.42,
  waterfallEnd: 0.58,
  trailsStart: 0.88,
} as const;

const EXPERIENCE_CLOSE: LayerMix = {
  wind: 0.3,
  birds: 0.26,
  insects: 0.2,
  water: 0.2,
  waterfall: 0.55,
  foliage: 0.18,
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

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

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

export function getToneTargets(): { lowpass: number } {
  const weights = normalizedWeights();
  let logSum = 0;
  for (const [zone, weight] of weights) {
    logSum += Math.log(Math.max(200, lowpassForZone(zone))) * weight;
  }
  return { lowpass: Math.exp(logSum) };
}

export function getAmbientZone() {
  return dominantZone(normalizedWeights());
}

export function setAmbientZone(zone: AmbientZone) {
  setZoneWeights({ [zone]: 1 });
}

export function setZoneWeights(weights: ZoneWeights) {
  const next = copyWeights(weights);
  if (weightsEqual(state.targetWeights, next) && state.weightsPrimed) return;

  state.targetWeights = next;

  if (!state.weightsPrimed) {
    state.weights = copyWeights(next);
    state.weightsPrimed = true;
    state.zone = dominantZone(normalizedWeights());
    notify();
    return;
  }

  notify();
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
  notify();
}

export function setForestSlideProgress(progress: number) {
  const next = clamp01(progress);
  if (state.forestProgress === next) return;
  state.forestProgress = next;
  if ((state.weights.forest ?? 0) > 0.001 || state.zone === "forest") {
    notify();
  }
}

export function setVillaProgress(progress: number) {
  const next = clamp01(progress);
  if (state.villaProgress === next) return;
  state.villaProgress = next;
  if ((state.weights.villa ?? 0) > 0.001 || state.zone === "villa") {
    notify();
  }
}

export function setExperienceWaterNudge(nudge: number) {
  const next = clamp01(nudge);
  if (state.experienceWaterNudge === next) return;
  state.experienceWaterNudge = next;
  if (
    (state.weights.experience ?? 0) > 0.001 ||
    state.zone === "experience"
  ) {
    notify();
  }
}

export function setExperienceScrollCloseness(closeness: number) {
  const next = clamp01(closeness);
  if (state.experienceScrollCloseness === next) return;
  state.experienceScrollCloseness = next;
  if (
    (state.weights.experience ?? 0) > 0.001 ||
    state.zone === "experience"
  ) {
    notify();
  }
}

export function setVelocityBump(bump: number) {
  const next = clamp01(bump);
  if (state.velocityBump === next) return;
  state.velocityBump = next;
  notify();
}

export function decayVelocityBump(dt: number) {
  if (state.velocityBump <= 0) return;
  state.velocityBump = Math.max(0, state.velocityBump - dt / VELOCITY_DECAY_TAU);
}

export function subscribeHomepageMix(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
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
  notify();
}
