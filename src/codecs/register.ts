import { registry } from '@zarrita/core';
registry.set('jpeg2k', () => import('./jpeg2k').then((m) => m.default));
