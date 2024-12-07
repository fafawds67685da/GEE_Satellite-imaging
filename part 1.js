Map.setCenter(78.28,30.11,11);
var selection = L8.filterBounds(ROI)
.filterDate("2017-05-01","2018-01-01")
.filterMetadata("CLOUD_COVER","less_than",1)
.mean()
.clip(ROI);
Map.addLayer(selection, {bands:["B4","B3","B2"]});
