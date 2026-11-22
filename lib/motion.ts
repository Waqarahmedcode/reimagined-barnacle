/**
 * Pure motion helpers. Nothing in here touches the DOM, so the can path is a
 * deterministic function of (scrollY, layout) and can be unit-checked:
 * scrolling forward or backward to the same position always yields the same pose.
 */
import type { Pose, Scene } from './sceneConfig';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** power2.inOut, matching GSAP's curve so scrubbed tweens and the can path agree. */
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  s: lerp(a.s, b.s, t),
  r: lerp(a.r, b.r, t),
  lift: lerp(a.lift, b.lift, t),
  callouts: lerp(a.callouts, b.callouts, t),
});

/** Measured layout of the story, in document pixels. */
export type StoryLayout = {
  /** top of each scene section */
  tops: number[];
  /** height of each scene section */
  heights: number[];
  /** height of one pinned frame (100svh in px) */
  frame: number;
};

export type StoryState = {
  pose: Pose;
  /** extra vertical px applied after the last chapter so the can leaves with the finale page */
  exitShift: number;
  /** index of the chapter that currently owns the viewport */
  active: number;
  /** 0..1 progress through the whole story (opening top -> finale end) */
  progress: number;
};

/**
 * Resolve the can's pose for a scroll position.
 *
 * Timeline per chapter i (top T, height H, frame F):
 *   [T, T+H-F]           pinned: pose eases enter(i) -> exit(i)
 *   [T+H-F, T+H]         page turn: next chapter scrolls in, pose eases exit(i) -> enter(i+1)
 * After the last chapter the can is carried upward with the finale page.
 */
export function resolveStory(scrollY: number, scenes: Scene[], layout: StoryLayout, mode: 'wide' | 'compact', stepped = false): StoryState {
  const { tops, heights, frame } = layout;
  const n = scenes.length;
  const first = tops[0];
  const lastEnd = tops[n - 1] + heights[n - 1] - frame;
  const progress = clamp((scrollY - first) / Math.max(1, lastEnd - first), 0, 1);

  let active = 0;
  for (let i = 0; i < n; i++) if (scrollY >= tops[i] - frame * 0.5) active = i;

  if (stepped) {
    // Reduced motion: no travel. The can simply holds the active chapter's resting pose.
    return { pose: scenes[active].pose[mode].enter, exitShift: Math.max(0, scrollY - lastEnd), active, progress };
  }

  if (scrollY <= first) return { pose: scenes[0].pose[mode].enter, exitShift: 0, active: 0, progress: 0 };

  for (let i = 0; i < n; i++) {
    const pinEnd = tops[i] + heights[i] - frame;
    const { enter, exit } = scenes[i].pose[mode];
    if (scrollY <= pinEnd) {
      const t = clamp((scrollY - tops[i]) / Math.max(1, pinEnd - tops[i]), 0, 1);
      return { pose: mixPose(enter, exit, easeInOut(t)), exitShift: 0, active, progress };
    }
    if (i < n - 1 && scrollY <= tops[i + 1]) {
      const t = clamp((scrollY - pinEnd) / Math.max(1, tops[i + 1] - pinEnd), 0, 1);
      return { pose: mixPose(exit, scenes[i + 1].pose[mode].enter, easeInOut(t)), exitShift: 0, active, progress };
    }
  }
  // Past the finale: hold the final pose and ride up with the page.
  return { pose: scenes[n - 1].pose[mode].exit, exitShift: scrollY - lastEnd, active: n - 1, progress: 1 };
}

/** Format a pose as the transforms used by CanStage. */
export function poseTransforms(pose: Pose, vw: number, vh: number, exitShift: number) {
  const x = pose.x * vw;
  const y = pose.y * vh - exitShift;
  const rig = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${pose.s.toFixed(4)})`;
  const body = `rotate(${pose.r.toFixed(3)}deg)`;
  // Light comes from the upper left: the cast shadow falls down-right and
  // spreads as the can lifts off the page.
  const off = 2 + pose.lift * 5; // % of can width/height
  const shadow = `translate3d(${(off * 0.9).toFixed(2)}%, ${(off * 0.75).toFixed(2)}%, 0) rotate(${pose.r.toFixed(3)}deg) scale(${(1 + pose.lift * 0.04).toFixed(4)})`;
  const shadowOpacity = (0.62 - pose.lift * 0.22).toFixed(3);
  // Specular sweep shifts opposite to the roll so the highlight feels anchored to the light.
  const sheen = `${(50 - pose.r * 2.4 - pose.x * 40).toFixed(2)}%`;
  return { rig, body, shadow, shadowOpacity, sheen };
}
