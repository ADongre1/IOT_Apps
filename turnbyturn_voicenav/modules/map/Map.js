define(["esri/geometry/Polygon","dojo/_base/declare",'esri/map',"esri/SpatialReference","esri/geometry/Point","esri/graphicsUtils",
         "esri/layers/ArcGISDynamicMapServiceLayer", "esri/Color", "esri/symbols/SimpleLineSymbol",
         "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/TextSymbol",
        "esri/layers/GraphicsLayer","esri/layers/FeatureLayer","esri/graphic","esri/symbols/PictureMarkerSymbol","esri/tasks/query",
        "esri/tasks/QueryTask","esri/symbols/Font","esri/geometry/scaleUtils","dojo/domReady!"], 
         function(Polygon,declare,Map,SpatialReference,Point,graphicsUtils,ArcGISDynamicMapServiceLayer,
        		Color,SimpleLineSymbol,
        		 SimpleMarkerSymbol,SimpleFillSymbol,TextSymbol,GraphicsLayer,FeatureLayer, Graphic,PMS,Query,QueryTask,Font,scaleUtils) {	

	return declare(null,{
		map:new Map("mapDiv", {
			id:"map",
			zoom: 12,
			spatialReference:this._esriNCSP,
		}),
		routeParcelQueryTask: new QueryTask("https://arcgis2.catawbacountync.gov/arcgis/rest/services/catawba/Centerlines_Network/MapServer/18"),
		addQueryTask:new QueryTask("https://arcgis2.catawbacountync.gov/arcgis/rest/services/catawba/address_pts/MapServer/0"),
		parcelQueryTask: new QueryTask('https://arcgis2.catawbacountync.gov/arcgis/rest/services/public_access/Basemap_pa/MapServer/4'),
		clQueryTask: new QueryTask('https://arcgis2.catawbacountync.gov/arcgis/rest/services/catawba/Centerlines_Network/MapServer/8'),
		Query:function(){return new Query()},
		//acccess these variables through map
		_turnSymbol:new SimpleMarkerSymbol(
	            SimpleMarkerSymbol.STYLE_CIRCLE, 13,
	            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([178,34,34]), 1),new Color([0,255,0])),
	    _destSymbol:new PMS ('https://arcgis2.catawbacountync.gov/dss/mow/mobile/house.jpg',25,25),
	    _destTextSymbol: new TextSymbol(null,new Font("9pt", Font.STYLE_NORMAL,Font.VARIANT_NORMAL, Font.WEIGHT_BOLD,"Serif"),
	    			null).setHaloSize(2.5).setHaloColor(new Color([255,255,255])).setColor(new Color([0,0,255])),
		_carSymbol:new PMS ('https://arcgis2.catawbacountync.gov/dss/mow/mobile/car.png',45,30),
	       	    
	    _esriNCSP:new SpatialReference(102719),
	    getBlankPoint:function(){
	    	var tempPoint = new Point(0,0,this._esriNCSP);
	    	return tempPoint;
	    },
	    constructor: function(){
	    	this.map.addLayer(new ArcGISDynamicMapServiceLayer('https://arcgis2.catawbacountync.gov/arcgis/rest/services/catawba/Basemap/MapServer',{id:'Basemap'}));
	    	this.map.addLayer(new ArcGISDynamicMapServiceLayer('https://arcgis2.catawbacountync.gov/arcgis/rest/services/DSS/MOW/MapServer',{id:'Depots'}));
	    	this.map.getLayer("Depots").setVisibleLayers([1]);
	    	this.map.addLayer(new GraphicsLayer({id:'destGL'}));	    	
	    	this.map.addLayer(new FeatureLayer({layerDefinition:{"geometryType": "esriGeometryPolyline","objectIdField": "ObjectID","fields": [{
	            "name": "ObjectID",
	            "alias": "ObjectID",
	            "type": "esriFieldTypeOID"
	          }]},featureSet:null},{id:'routeFL'}));
	    	//this.map.addLayer(new GraphicsLayer({id:'routeGL'}));
	    	this.map.addLayer(new GraphicsLayer({id:"turnsGL"}));
//	    	var tempFenceFL = new FeatureLayer("https://arcgis2.catawbacountync.gov/arcgis/rest/services/DSS/MOW/MapServer/30",{mode: FeatureLayer.MODE_ONDEMAND,
//	    		mode: FeatureLayer.MODE_ONDEMAND,
//	    	outFields: ["*"]})
//	    	console.log(tempFenceFL)
	    	this.map.addLayer(new FeatureLayer({layerDefinition:{
    			"geometryType":"esriGeometryPolygon",
    			"objectIdField":"ObjectID",
    			"fields":[{
    				"name":"ObjectID",
    				"alias":"ObjectID",
    				"type":"esriFieldTypeOID"
    			},
    			{
    				"name":"turnPt",
    				"alias":"turnPt",
    				"type":"esriFieldTypeGeometry"
    			},
    			{
    				"name":"directionType",
    				"alias":"directionType",
    				"type":"esriFieldTypeString"
    			},
    			{
    				"name":"distanceText",
    				"alias":"distanceText",
    				"type":"esriFieldTypeString"
    			},
    			{
    				"name":"directions",
    				"alias":"directions",
    				"type":"esriFieldTypeString"
    			}]
    	}},{id:'fenceFL'}));
			this.map.getLayer('fenceFL').setEditable(true)
			var map = this.map;
			this.map.getLayer('fenceFL').on("click",function(feature){
				console.log(feature.graphic.attributes)
				map.getLayer('fenceFL').applyEdits(null,null,[feature.graphic]);				
				if (feature.graphic.attributes.directions.indexOf("have arrived") > 0) {
					mobileMap.map.getLayer('fenceFL').clear();
					mobileMap.map.getLayer('turnsGL').clear();
				}
		
			})
			this.map.on("dbl-click", function () {
				map.setExtent(graphicsUtils.graphicsExtent(mobileMap.map.getLayer('routeFL').graphics).expand(1.25), true);
			});
			this.map.on("click", function () {
			 	map.setScale(2400);
			 	map.centerAt(mobileMap.map.getLayer('carsGL').graphics[0].geometry);
			 });
	    	//this.map.addLayer(new GraphicsLayer({id:"bufferGL"}));
	    	this.map.addLayer(new GraphicsLayer({id:'carsGL'}));
	    	this.map.getLayer("turnsGL").add(new Graphic(new Point(0,0,this._esriNCSP),this._turnSymbol,null));
	    	this.map.getLayer("carsGL").add(new Graphic(new Point(0,0,this._esriNCSP),this._carSymbol,null));
	    	this.map.getLayer("destGL").add(new Graphic(new Point(0,0,this._esriNCSP),this._destSymbol,null));
	    	this.map.getLayer("destGL").add(new Graphic(new Point(0,0,this._esriNCSP),this._destTextSymbol,null));
	    	this.map.on("extent-change",function(evt){	    	
	    		if(scaleUtils.getScale(evt.target)>12000){
	    			evt.target.getLayer("Basemap").setVisibleLayers([0,1,2,3,4,5,6,8,9]);
	    		}
	    		else{
	    			evt.target.getLayer("Basemap").setVisibleLayers([0,1,2,3,4,7,8,9]);
	    		}		
	    	});	
	      	
	    },			
	});	
});
	
