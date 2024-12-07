print("hi");
/*var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")

var image = sentinel2.filterBounds(ROI)
            .filterDate('2023-01-01','2023-07-16')
            .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',1)
            .median()
            .clip(ROI)
            

Map.addLayer(image, imageVisParam)

/*var sample = water.merge(Settlement).merge(Baren_land).merge(Agriculture)

bands = ['B2','B3','B4','B5','B6','B7','B8']


var training = image.select(bands).sampleRegions({
  collection: sample ,
  properties: ['Class'] ,
  scale: 10})


var dataset = training.randomColumn()

var trainset = dataset.filter(ee.Filter.lessThan('random',0.80))
var testset = dataset.filter(ee.Filter.greaterThanOrEquals('random',0.80))

var model = ee.Classifier.smileRandomForest(20).train({
  features: trainset, 
  classProperty: 'Class',
  inputProperties: bands })
  
// Classify the image based on the trained model
var LULC = image.select(bands).classify(model);

// Add the classified LULC layer to the map
Map.addLayer(LULC, {min: 0, max: 3, palette: ['blue', 'pink', 'yellow', 'green']}, 'LULC Map');

*/
