export const MAP_CONSTANTS = {
  // Viewport
  INITIAL_CENTER: [50.8, 4.6] as [number, number],
  INITIAL_ZOOM: 7,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  
  // Bounds (FR, BE, NL area approximate)
  FR_BE_NL_BOUNDS: [
    [41.0, -5.0], // Southwest
    [53.5, 10.0]  // Northeast
  ] as [[number, number], [number, number]],

  // Visibility Thresholds (Zooms)
  ZOOM_TOLLS_MIN: 9,
  ZOOM_HGV_PARKING_MIN: 10,
  ZOOM_ALL_MOTORWAYS_MIN: 9,
  ZOOM_AXES_MIN: 7,
  ZOOM_TOOLTIP_MIN: 9,

  // Display Caps (Max elements rendered in viewport)
  CAP_MOTORWAYS_PRIMARY: 300,
  CAP_MOTORWAYS_ALL: 100,
  CAP_TOLLS: 150,
  CAP_HGV_PARKING: 150,
  CAP_AXES_ANALYTICAL: 15,
  CAP_AXES_ALL: 200,
  
  // Colors
  COLOR_MOTORWAY: '#2563EB',
  COLOR_AXIS: '#0F766E',
  COLOR_TOLL: '#F97316',
  COLOR_HGV_PARKING: '#14B8A6',
};
