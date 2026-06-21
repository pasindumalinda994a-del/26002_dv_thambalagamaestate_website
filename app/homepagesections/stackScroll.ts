/** Viewport heights budgeted for the next section to rise over the current one (-mt-[100svh] stack). */
export const STACK_REVEAL_VH = 1;

export function getStackRevealDistance() {
  return window.innerHeight * STACK_REVEAL_VH;
}
