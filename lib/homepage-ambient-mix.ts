export const AMBIENT_LAYERS = [
  "wind",
  "birds",
  "insects",
  "water",
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

export const AMBIENT_LAYER_SRCS: Record<AmbientLayer, string> = {
  wind: "/audio/wind.mp3",
  birds: "/audio/birds.mp3",
  insects: "/audio/insects.wav",
  water: "/audio/water.mp3",
  foliage: "/audio/foliage.mp3",
};

export const AMBIENT_MASTER = 0.3;
export const AMBIENT_LERP_TAU = 1.2;
export const FILTER_LERP_TAU = 0.85;

/** Water arrives slowly; foliage reacts to movement. */
export const LAYER_LERP_TAU: Record<AmbientLayer, number> = {
  wind: 1.45,
  birds: 1.25,
  insects: 1.35,
  water: 2.15,
  foliage: 0.5,
};

export const LAYER_PAN: Record<AmbientLayer, number> = {
  wind: -0.14,
  birds: 0,
  insects: 0.1,
  water: 0.03,
  foliage: 0.18,
};

export const BIRD_PAN_LFO_HZ = 0.032;
export const BIRD_PAN_LFO_AMP = 0.34;

const EXPERIENCE_WATER_REST = 0.28;
const EXPERIENCE_WATER_NUDGE = 0.78;

const ZERO_MIX: LayerMix = {
  wind: 0,
  birds: 0,
  insects: 0,
  water: 0,
  foliage: 0,
};

const MIX: Record<Exclude<AmbientZone, "forest">, LayerMix> = {
  hero: { wind: 0.52, birds: 0.42, insects: 0.1, water: 0, foliage: 0.18 },
  about: { wind: 0.32, birds: 0.22, insects: 0.18, water: 0, foliage: 0.12 },
  villa: { wind: 0.2, birds: 0.14, insects: 0.14, water: 0, foliage: 0.03 },
  experience: {
    wind: 0.35,
    birds: 0.3,
    insects: 0.25,
    water: EXPERIENCE_WATER_REST,
    foliage: 0.2,
  },
  locationCta: {
    wind: 0.18,
    birds: 0.08,
    insects: 0.07,
    water: 0,
    foliage: 0.06,
  },
  footer: ZERO_MIX,
};

const FOREST_MIX = {
  estate: {
    wind: 0.45,
    birds: 0.52,
    insects: 0.36,
    water: 0.14,
    foliage: 0.32,
  },
  waterfalls: {
    wind: 0.28,
    birds: 0.2,
    insects: 0.12,
    water: 0.88,
    foliage: 0.18,
  },
  trails: {
    wind: 0.52,
    birds: 0.46,
    insects: 0.42,
    water: 0.18,
    foliage: 0.38,
  },
} as const satisfies Record<string, LayerMix>;

const LOWPASS_HZ: Record<Exclude<AmbientZone, "forest">, number> = {
  hero: 8200,
  about: 6200,
  villa: 1450,
  experience: 9000,
  locationCta: 4000,
  footer: 900,
};

const FOREST_LOWPASS = {
  estate: 12800,
  waterfalls: 10200,
  trails: 16500,
} as const;

const EXPERIENCE_CLOSE: LayerMix = {
  wind: 0.24,
  birds: 0.12,
  insects: 0.08,
  water: EXPERIENCE_WATER_NUDGE,
  foliage: 0.1,
};

type MixState = {
  zone: AmbientZone;
  weights: ZoneWeights;
  forestProgress: number;
  experienceWaterNudge: number;
  velocityBump: number;
};

const state: MixState = {
  zone: "hero",
  weights: { hero: 1 },
  forestProgress: 0,
  experienceWaterNudge: 0,
  velocityBump: 0,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerpMix(a: LayerMix, b: LayerMix, t: number): LayerMix {
  const k = clamp01(t);
  return {
    wind: a.wind + (b.wind - a.wind) * k,
    birds: a.birds + (b.birds - a.birds) * k,
    insects: a.insects + (b.insects - a.insects) * k,
    water: a.water + (b.water - a.water) * k,
    foliage: a.foliage + (b.foliage - a.foliage) * k,
  };
}

function forestMix(progress: number): LayerMix {
  const t = clamp01(progress);
  if (t <= 0.5) return lerpMix(FOREST_MIX.estate, FOREST_MIX.waterfalls, t * 2);
  return lerpMix(FOREST_MIX.waterfalls, FOREST_MIX.trails, (t - 0.5) * 2);
}

function forestLowpass(progress: number) {
  const t = clamp01(progress);
  if (t <= 0.5) {
    return (
      FOREST_LOWPASS.estate +
      (FOREST_LOWPASS.waterfalls - FOREST_LOWPASS.estate) * t * 2
    );
  }
  return (
    FOREST_LOWPASS.waterfalls +
    (FOREST_LOWPASS.trails - FOREST_LOWPASS.waterfalls) * (t - 0.5) * 2
  );
}

function experienceMix(nudge: number): LayerMix {
  return lerpMix(MIX.experience, EXPERIENCE_CLOSE, clamp01(nudge));
}

function mixForZone(zone: AmbientZone): LayerMix {
  if (zone === "forest") return forestMix(state.forestProgress);
  if (zone === "experience") return experienceMix(state.experienceWaterNudge);
  return { ...MIX[zone] };
}

function lowpassForZone(zone: AmbientZone) {
  if (zone === "forest") return forestLowpass(state.forestProgress);
  return LOWPASS_HZ[zone];
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

  const forestW =
    weights.find(([zone]) => zone === "forest")?.[1] ?? 0;
  const villaW = weights.find(([zone]) => zone === "villa")?.[1] ?? 0;
  const bump = clamp01(state.velocityBump);
  if (bump > 0) {
    const foliageAdd = 0.08 + forestW * 0.14 - villaW * 0.06;
    const windAdd = 0.05 + forestW * 0.05 - villaW * 0.04;
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
  const next: ZoneWeights = {};
  let changed = false;
  let nextCount = 0;
  let prevCount = 0;

  for (const zone of Object.keys(weights) as AmbientZone[]) {
    const value = weights[zone] ?? 0;
    if (value <= 0.001) continue;
    next[zone] = value;
    nextCount += 1;
    if (state.weights[zone] !== value) changed = true;
  }

  for (const zone of Object.keys(state.weights) as AmbientZone[]) {
    if ((state.weights[zone] ?? 0) > 0.001) prevCount += 1;
  }
  if (nextCount !== prevCount) changed = true;

  if (!changed) {
    for (const zone of Object.keys(state.weights) as AmbientZone[]) {
      if ((state.weights[zone] ?? 0) > 0.001 && next[zone] == null) {
        changed = true;
        break;
      }
    }
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

export function setVelocityBump(bump: number) {
  const next = clamp01(bump);
  if (state.velocityBump === next) return;
  state.velocityBump = next;
  notify();
}

export function decayVelocityBump(dt: number) {
  if (state.velocityBump <= 0) return;
  state.velocityBump = Math.max(0, state.velocityBump - dt / 0.55);
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
  state.forestProgress = 0;
  state.experienceWaterNudge = 0;
  state.velocityBump = 0;
  notify();
}
