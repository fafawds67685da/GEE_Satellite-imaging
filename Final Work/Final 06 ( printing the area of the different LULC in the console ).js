var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");

var image = sentinel2.filterBounds(ROI)
    .filterDate('2018-01-01', '2018-6-1')
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 1)
    .median()
    .clip(ROI);
Map.addLayer(image,imageVisParam,"Real image")//     4-3-2
Map.addLayer(image,imageVisParam4, "Every layer")// 11-8-2
Map.addLayer(image,imageVisParam3, "URBAN")//       11-4-8



var bands = ['B2', 'B3', 'B4', 'B8', 'B11'];


var sample = Water.merge(Vegetation).merge(Baren).merge(Forest).merge(Urban)


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
Map.addLayer(LULC_train, {min: 0, max: 4, palette: ['blue', 'yellow', 'grey', 'green','red']}, 'LULC_train Map');



/*var LULC_test = image.select(bands).classify(model_train);

Map.addLayer(LULC_test, {min: 0, max: 4, palette: ['blue', 'yellow', 'grey', 'green','red']}, 'LULC_test Map');*/


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

// Calculate the area for each LULC class
var pixelArea = ee.Image.pixelArea(); // Each pixel's area in square meters

var classArea = ee.List.sequence(0, 4).map(function(classValue) {
  // Create a constant image from the class value
  var classImage = ee.Image.constant(classValue);
  
  // Mask the pixels corresponding to the current class
  var maskedArea = pixelArea.updateMask(LULC_train.eq(classImage));
  
  // Reduce the masked area to calculate the total area for the class
  var area = maskedArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: ROI,
    scale: 10,
    maxPixels: 1e13
  });
  
  // Return a dictionary containing class and area
  return {
    Class: classValue,
    Area_m2: area.get('area')
  };
});

// Convert the results to a list of dictionaries
var areaList = ee.List(classArea);

// Print areas for each class in the console
areaList.evaluate(function(list) {
  print('Class-wise Area (m²):', list);
});

