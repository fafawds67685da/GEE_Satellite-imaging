var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

var image = sentinel2.filterBounds(ROI)
    .filterDate('2018-01-01', '2018-12-1')
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 1)
    .median()
    .clip(ROI);
Map.addLayer(image,imageVisParam)


var bands = ['B2', 'B3', 'B4', 'B8', 'B11'];


var sample = Water.merge(Vegetation).merge(Baren).merge(Forest)


var training = image.select(bands).sampleRegions({
  collection: sample,
  properties: ['Class'], // Class property for ground truth
  scale: 10
});

//print(sample);

var dataset = training.randomColumn(); // Add a random column for splitting

var trainset = dataset.filter(ee.Filter.lessThan('random', 0.80));
var testset = dataset.filter(ee.Filter.greaterThanOrEquals('random', 0.80));

// Train a Random Forest classifier
var model_train = ee.Classifier.smileRandomForest(20).train({
  features: trainset, // Training set
  classProperty: 'Class', // Ground truth property
  inputProperties: bands // Features used for training
});

// Classify the entire image using the trained model
var LULC_train = image.select(bands).classify(model_train);

// Add the classified map to the viewer
Map.addLayer(LULC_train, {min: 0, max: 3, palette: ['blue', 'lightgreen', 'brown', 'green']}, 'LULC_train Map');



var LULC_test = image.select(bands).classify(model_train);

Map.addLayer(LULC_test, {min: 0, max: 3, palette: ['blue', 'lightgreen', 'brown', 'green']}, 'LULC_test Map');


// Classify the testset using the trained model
var testClassification = testset.classify(model_train);

// Generate a confusion matrix
var confusionMatrix = testClassification.errorMatrix('Class', 'classification');
print('Confusion Matrix:', confusionMatrix);

// Overall accuracy
var accuracy = confusionMatrix.accuracy();
print('Overall Accuracy:', accuracy);

// Kappa coefficient
var kappa = confusionMatrix.kappa();
print('Kappa Coefficient:', kappa);
