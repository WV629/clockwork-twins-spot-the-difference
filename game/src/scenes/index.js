// Clockwork Twins: the scene registry.
// One job: the list of levels, in order, and a lookup by id.
import { attic } from './attic.js';
import { bakery } from './bakery.js';
import { greenhouse } from './greenhouse.js';

export const SCENES = [attic, bakery, greenhouse];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) || SCENES[0];
}
