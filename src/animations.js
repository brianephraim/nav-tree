export const animations = {};
export function registerAnimations(animationType, animation) {
  animations[animationType] = animation;
}
registerAnimations('noop', () => {});
