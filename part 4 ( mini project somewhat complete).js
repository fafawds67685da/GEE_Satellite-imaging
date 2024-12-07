// Define the spectral bands to use
var bands = ['B2', 'B3', 'B4', 'B8', 'B11'];

// Load the Sentinel-2 dataset
var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

var image = sentinel2.filterBounds(ROI)
    .filterDate('2023-01-01', '2023-07-16')
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 1)
    .median()
    .clip(ROI);

// Add the original image to the map
Map.addLayer(image, imageVisParam, 'Original Image');

// Merge the samples for the different land cover classes
var sample = water.merge(urban).merge(Agriculture).merge(baren_rocky).merge(Forest);

// Sample training points from the image using these merged samples
var training = image.select(bands).sampleRegions({
  collection: sample,
  properties: ['Class'], // Class property for ground truth
  scale: 10
});

// Split the data into training and testing datasets
var dataset = training.randomColumn(); // Add a random column for splitting

var trainset = dataset.filter(ee.Filter.lessThan('random', 0.80));
var testset = dataset.filter(ee.Filter.greaterThanOrEquals('random', 0.80));

// Train a Random Forest classifier
var model = ee.Classifier.smileRandomForest(20).train({
  features: trainset, // Training set
  classProperty: 'Class', // Ground truth property
  inputProperties: bands // Features used for training
});

// Classify the entire image using the trained model
var LULC = image.select(bands).classify(model);

// Add the classified map to the viewer
Map.addLayer(LULC, {min: 0, max: 6, palette: ['blue', 'red', 'lightgreen', 'grey', 'green','grey','lightgreen']}, 'LULC Map');

var image2020 = sentinel2.filterBounds(ROI)
    .filterDate('2020-01-01', '2020-12-31')
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 1)
    .median()
    .clip(ROI);

var LULC_2020 = image2020.select(bands).classify(model);

// Add the classified 2020 map to the viewer
Map.addLayer(LULC_2020, {min: 0, max: 6, palette: ['blue', 'red', 'lightgreen', 'grey', 'green','grey','lightgreen']}, 'LULC 2020 Map');


// ---- Confusion Matrix, Kappa Coefficient, and Accuracy ----

// Classify the test set by applying the trained model to the test set samples
var classifiedTestSet = testset.map(function (feature) {
  var predicted = model.classify(feature); // Apply the classifier to each feature
  return feature.set('classification', predicted); // Add predicted class as a new property
});

// Calculate the confusion matrix
var confusionMatrix = classifiedTestSet.errorMatrix('Class', 'classification');

// Print the confusion matrix
print('Confusion Matrix:', confusionMatrix);

// Compute the Kappa coefficient
var kappa = confusionMatrix.kappa();
print('Kappa Coefficient:', kappa);

// Calculate accuracy
var accuracy = confusionMatrix.accuracy();
print('Accuracy:', accuracy);
