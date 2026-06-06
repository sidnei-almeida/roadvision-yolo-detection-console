export const CLASS_COLORS = {
  speed_limit:   '#00d4ff',
  crosswalk:     '#00ff87',
  traffic_light: '#ffb800',
  stop:          '#ff4444',
  winding_road:  '#b57bee',
  road_work:     '#ffb800',
  no_overtaking: '#b57bee',
  give_way:      '#ff4444',
  default:       '#00ff87',
};

const CLASS_ALIASES = {
  speedlimit: 'speed_limit',
  giveway: 'give_way',
  crosswalk: 'crosswalk',
  trafficlight: 'traffic_light',
};

export function normalizeClassKey(className) {
  if (!className) return 'unknown';

  const key = className
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();

  return CLASS_ALIASES[key] || key;
}

export function getClassColor(className) {
  const key = normalizeClassKey(className);
  return CLASS_COLORS[key] || CLASS_COLORS.default;
}

export function formatClassLabel(className) {
  return normalizeClassKey(className);
}
