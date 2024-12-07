// Define Region of Interest (ROI) (e.g., a polygon)
var ROI = ee.Geometry.Polygon([
  [[78.0, 30.0], [78.5, 30.0], [78.5, 30.5], [78.0, 30.5]]
]);

// Set map view to the center of your ROI
Map.setCenter(78.28, 30.11, 11);

// Import Landsat 8 image collection
var L8 = ee.ImageCollection('LANDSAT/LC08/C01/T2_TOA');

// Filter the collection based on region of interest (ROI) and cloud cover
var selection = L8.filterBounds(ROI)
  .filterDate("2020-04-01", "2020-04-30")
  .filterMetadata("CLOUD_COVER", "less_than", 1)
  .mean()  // Take the mean of the images to reduce cloudiness
  .clip(ROI);  // Clip to the ROI area

// Add the selection to the map with visualization parameters (RGB bands)
Map.addLayer(selection, {
  bands: ["B4", "B3", "B2"],  // RGB bands for Landsat
  min: 0, 
  max: 0.3, 
  gamma: 1.4
}, "Landsat Image (April 2020)");



