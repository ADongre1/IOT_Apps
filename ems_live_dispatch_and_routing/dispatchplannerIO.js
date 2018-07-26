require(["esri/renderers/UniqueValueRenderer","esri/tasks/NATypes","esri/tasks/ServiceAreaTask","esri/tasks/ServiceAreaParameters",
		"esri/layers/LayerDrawingOptions","esri/tasks/NATypes","esri/tasks/locator",
         "esri/symbols/Font","esri/layers/FeatureLayer","esri/tasks/ClosestFacilityTask","esri/tasks/ClosestFacilityParameters",
         "esri/tasks/FeatureSet","https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.3/proj4-src.js", "esri/symbols/TextSymbol",
         "esri/symbols/PictureMarkerSymbol","dojo/ready","esri/geometry/Extent",
         "esri/IdentityManager","esri/layers/GraphicsLayer","dojox/timing","dojo/dom-style","dojox/widget/Standby",
         "dijit/form/Select","dgrid/Grid","dijit/Toolbar","dijit/registry",
         "esri/toolbars/navigation","dijit/layout/BorderContainer","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleMarkerSymbol","esri/Color",
         "dojo/json","dijit/form/Button","dijit/form/TextBox",
         "dojo/date","esri/geometry/Point","esri/graphic","esri/tasks/ProjectParameters",
         "esri/layers/ArcGISDynamicMapServiceLayer","esri/SpatialReference","esri/map","dijit/layout/ContentPane", "dojo/request","dojo/dom",
         "dojo/parser","dijit/form/ComboBox","dojo/store/Memory", "esri/tasks/query","esri/tasks/QueryTask","dijit/form/CheckBox",
         "dijit/layout/TabContainer","esri/tasks/RouteTask",
         "esri/tasks/RouteParameters","esri/geometry/Polyline","dojo/Deferred",
         "cbtree/store/Hierarchy","cbtree/model/TreeStoreModel","cbtree/Tree","dojo/_base/array",
         "esri/graphicsUtils","dijit/form/MultiSelect","dojo/window","dojo/on","dijit/Menu","dijit/MenuItem","dojo/mouse","dojo/dom-construct",
         "esri/symbols/SimpleFillSymbol","esri/tasks/PrintTask","esri/tasks/PrintTemplate","esri/tasks/PrintParameters",
         "socketio/socket.io","dojo/domReady!"],
		function(UVR,NATypes,SAT,SAP,LayerDrawingOptions,NATypes,Geolocator,Font,FeatureLayer,CFT,CFTParams,FeatureSet,Proj4,TextSymbol,
				PMS,ready,Extent,esriID,GraphicsLayer,Timing,domStyle,
				Standby,Select,Grid,Toolbar,registry,Navigation,BorderContainer,SimpleLineSymbol,SimpleMarkerSymbol,Color,
				JSON,Button,TextBox,dojoDate,Point,Graphic,ProjectParameters,ArcGISDynamicMapServiceLayer,
				SpatialReference,Map,ContentPane,dojoRequest,dom,parser,ComboBox,Memory,Query,QueryTask,CheckBox,TabContainer,RouteTask,RouteParameters,
				Polyline,Deferred,Hierarchy, TreeStoreModel, Tree1,dojoarray,graphicsUtils,MultiSelect,dWin,on,
				Menu,MenuItem,mouse,domConstruct,SimpleFillSymbol,PrintTask,PrintTemplate,PrintParameters,socketio){

	parser.parse();
	//on(dom.byId("carDispatchSelect"),mouse.Righ
	try{
		var time = new Date().getTime();

		if(localStorage.getItem("catcoEMS") && JSON.parse(localStorage.getItem("catcoEMS")).credentials[0].expires>time){
			esriID.initialize(JSON.parse(localStorage.getItem("catcoEMS")));
		}
		else{var timer = new dojox.timing.Timer(100);
		timer.onTick = function(){
			try{
				dijit.byId("dijit_form_ValidationTextBox_0").set("value","cocat\\")
				timer.stop();
				timer = null;
			}
			catch(e){}
		}
		timer.start();}
	}
	catch(e){
		console.log(e);
	}


	esriID.on("dialog-cancel",function(){
		alert("Access Denied.");
		setTimeout(function(){ window.location.href = "https://gis.catawbacountync.gov"; }, 0);
	});

	ready(function(){
		map.disableKeyboardNavigation();
		if(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/BlackBerry/i)||
				navigator.userAgent.match(/iPhone|iPad|iPod/i)||navigator.userAgent.match(/Opera Mini/i)||navigator.userAgent.match(/IEMobile/i)) {
			domStyle.set("mapDiv","height","99%");
			domStyle.set("rightPane","display","none");
			domStyle.set("leftPane","display","none");
			domStyle.set(dijit.byId("borderContainer").domNode,"height","100%");
			domStyle.set(dijit.byId("borderContainer").domNode,"width","100%");
			dijit.byId("borderContainer").resize();
			dijit.byId("zoomin").destroy();
			dijit.byId("zoomout").destroy();
			dijit.byId("zoomnext").destroy();
			dijit.byId("pan").destroy();
			dijit.byId("borderContainer").resize();
		
		}
	});
	//set cookies
	emsMap.on("load",function(){
		getDataButton.set("disabled",false);		
		esriID.getCredential("EMS service url").then(function(cred){
			
				var cred={
						"serverInfos": [{ "server":"https://arcgis2.catawbacountync.gov",
							"currentVersion":10.31,
							"fullVersion":"10.3.1",
							"soapUrl":"https://arcgis2.catawbacountync.gov/arcgis/services",
							"secureSoapUrl":null,
							"hasServer": true
						}
						],
						"authInfo":{
							"isTokenBasedSecurity":true,
							"tokenServicesUrl":"https://arcgis2.catawbacountync.gov/arcgis/tokens/",
							"longLivedTokenValidity":1
						},
						"credentials":[cred]
				}
				localStorage.setItem("catcoEMS", JSON.stringify(cred));
				createCarGLS();
			});
		
	});

	
	window.addEventListener("orientationchange", function(evt) {
	   domStyle.set(dijit.byId("borderContainer").domNode,"height","100%");
	   domStyle.set(dijit.byId("borderContainer").domNode,"width","100%");
		dijit.byId("borderContainer").resize();
	});

	var socket;
	var geolocator = new Geolocator("geocode server")
	//create digit variables and other globals
	Proj4.defs('NCSP','+proj=lcc +lat_1=34.33333333333334 +lat_2=36.16666666666666 +lat_0=33.75 +lon_0=-79 +x_0= 609601.22 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');
	var addQueryTask = new QueryTask("addresses endpoint");
	var getDataButton = new Button({id:"getDataButton",label:"Get GPS Points",style:"margin-left:2vh;"},"getDataButton");
	var startRouteButton = new Button({id:"startRouteButton",label:"Set Start Point",disabled:false,style:"margin-left:4vh;"},"startRouteButton");
	var stopRouteButton = new Button({id:"stopRouteButton",label:"Set End Point",disabled:false,style:"margin-left:4vh;"},"stopRouteButton");
	var getRouteButton = new Button({id:"getRouteButton",label:"Get Route!",disabled:false,style:"margin-left:4vh;"},"getRouteButton");
	var startPoint=new Point();
	var stopPoint = new Point();
	var routePtsGL = new GraphicsLayer();
	var moTB = new TextBox({id:"moTB",placeHolder:"mm",style:"width:50px;"},"moTB");
	var dayTB = new TextBox({id:"dayTB",placeHolder:"dd",style:"width:50px;"},"dayTB");
	var yearTB = new TextBox({id:"yearTB",placeHolder:"yyyy",style:"width:50px;"},"yearTB");
	var startMinTB = new TextBox({id:"startMinTB",placeHolder:"mm.",style:"width:50px;"},"startMinTB");
	var startHourTB = new TextBox({id:"startHourTB",placeHolder:"hh",style:"width:50px;"},"startHourTB");
	var endMinTB = new TextBox({id:"endMinTB",placeHolder:"mm",style:"width:50px;"},"endMinTB");
	var endHourTB = new TextBox({id:"endHourTB",placeHolder:"hh",style:"width:50px;"},"endHourTB");
	var basemap = new ArcGISDynamicMapServiceLayer("basemap endpoint",{id:"basemap"});
	basemap.setVisibleLayers([0,1,3,4,7,8]);
	var basemapDefQueries = []
	basemapDefQueries[1] ="COMMENT NOT LIKE 'ESN ONLY'";
	basemap.setLayerDefinitions(basemapDefQueries)
	var addressPts = new ArcGISDynamicMapServiceLayer("addresses mapservice",{id:"address_pts"});
	var addPtDef= [];
	addPtDef[0] = "ADDR_STATUS LIKE 'ACT'";
	addressPts.setLayerDefinitions(addPtDef);
	var utilService = new ArcGISDynamicMapServiceLayer("utility mapservice",
			{id:"utilService"});
	utilService.setVisibleLayers([6]);
	var emsMap = new ArcGISDynamicMapServiceLayer("EMS layer map service",{id:"emsMap"});
	emsMap.setVisibleLayers([3,4,6]);
	emsMap.show();
	var emsLDO = new LayerDrawingOptions();	
	var orthoService = new ArcGISDynamicMapServiceLayer("ortho map service",{
		id:"orthoService"});
	orthoService.setVisibleLayers([5]);
	orthoService.setVisibility(false);
	var pictoService = new ArcGISDynamicMapServiceLayer("pictometry map service",{
		id:"pictoService"});
	pictoService.setVisibility(false);
	// graphics layer for gps points
	var avlPTGL = new GraphicsLayer()
	//graphics layer for highlighting a gps point
	var avlHighlightGL = new GraphicsLayer();
	//route graphics layer
	var routeGL = new GraphicsLayer();
	//closest facility GL for routing to nearest car
	var cfGL = new GraphicsLayer();
	///for query street intersections data
	var streetIntsFL = new FeatureLayer("street intersections endpoint",
			{id:"streetIntsFL",
			mode: FeatureLayer.MODE_ONDEMAND,
			outFields: ["*"]});
	//for query centerline info
	var streetsCLFL = new FeatureLayer("centerline endpoint for display and query",
			{id:"streetCLFL",
			mode: FeatureLayer.MODE_ONDEMAND,
		    outFields: ["*"]});
	//for querying addresses
	var addQueryTask = new QueryTask("address endpoint");
	//incident location GL and symbol	
	var incidentLocGL = new GraphicsLayer();
	var incidentLocSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE,15,null,new Color("#ff0000"));
	//closest facility task
	var cft = new CFT("closest facility task");

	//predefined symbols for routing 
	var routeSLS = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("00ff00"),2.5);
	var blueColor = new Color("#0000ff");
	var redColor = new Color(Color.fromHex("#ff0000"));
	var greenColor= new Color(Color.fromHex("#00ff00"));
	
	//add gps point highlight graphic to GL
	avlHighlightGL.add(new Graphic(null,
			new SimpleMarkerSymbol(
			          SimpleMarkerSymbol.STYLE_CIRCLE, 
			          14, 
			          new SimpleLineSymbol(
			            SimpleLineSymbol.STYLE_NULL, 
			            new Color([255, 255, 102, 1]), 
			            1
			          ),
			          new Color([255, 255, 102, 1])
			        )));
	//create the map
	var map = new Map("mapDiv", {
		id:"map",
		zoom: 10,
		spatialReference: new SpatialReference(102719),
		showLabels:true
	});


	// build service area layers on the fly. I do not want to store on disk.
	var serviceAreaFTFL = new FeatureLayer({id:"serviceAreaFTFL",layerDefinition:{
		"geometryType":"esriGeometryPolygon",
		"objectIdField":"ObjectID",
		"fields":[{
			"name":"ObjectID",
			"alias":"ObjectID",
			"type":"esriFieldTypeOID"
		},
		{
			"name":"FacilityID",
			"alias":"FacilityID",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"FromBreak",
			"alias":"FromBreak",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"Name",
			"alias":"Name",
			"type":"esriFieldTypeString"
		},
		{
			"name":"ToBreak",
			"alias":"ToBreak",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"Shape_Length",
			"alias":"Shape_Length",
			"type":"esriFieldTypeSingle"
		}
		,
		{
			"name":"Shape_Area",
			"alias":"Shape_Area",
			"type":"esriFieldTypeSingle"
		}
		]
	}});
	var serviceAreaPTFL = new FeatureLayer({id:"serviceAreaPTFL",layerDefinition:{
		"geometryType":"esriGeometryPolygon",
		"objectIdField":"ObjectID",
		"fields":[{
			"name":"ObjectID",
			"alias":"ObjectID",
			"type":"esriFieldTypeOID"
		},
		{
			"name":"FacilityID",
			"alias":"FacilityID",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"FromBreak",
			"alias":"FromBreak",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"Name",
			"alias":"Name",
			"type":"esriFieldTypeString"
		},
		{
			"name":"ToBreak",
			"alias":"ToBreak",
			"type":"esriFieldTypeInteger"
		},
		{
			"name":"Shape_Length",
			"alias":"Shape_Length",
			"type":"esriFieldTypeSingle"
		}
		,
		{
			"name":"Shape_Area",
			"alias":"Shape_Area",
			"type":"esriFieldTypeSingle"
		}
		]
	}});

	
	
	var srProj = new SpatialReference(102719);
	
	//Create Service area Feature Layers. Not storing on HD any more, so this gets created client side now. need to grab the bases to feed into task
	var serviceareasCreated = false;
	baseQT = new QueryTask("ems bases");
	var twoMinSymbol= new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,102,0]),2),new Color([0,102,0,0.25]));
	var fourMinSymbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([0,255,0]),2),new Color([0,255,0,0.25]));
	var sixMinSymbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]),2),new Color([255, 255, 0,0.25]));
	var eightMinSymbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]),2),new Color([255, 0, 0,0.25]));
	var uvrSA = new UVR (null,"ToBreak");
	uvrSA.legendOptions={"title":"Service Area"}
	var sat = new SAT("service area task");

	uvrSA.addValue(2,twoMinSymbol);
	uvrSA.addValue(4,fourMinSymbol);
	uvrSA.addValue(6,sixMinSymbol);
	uvrSA.addValue(8,eightMinSymbol);
	serviceAreaPTFL.setRenderer(uvrSA);
	serviceAreaFTFL.setRenderer(uvrSA);
	
	function createFTServiceArea(){
		
		var baseFTQuery = new Query();	
		baseFTQuery.returnGeometry=true;
		baseFTQuery.outFields=['*'];
		baseFTQuery.where="TYPE LIKE 'FULL TIME'";
		baseQT.execute(baseFTQuery,function(results){
			var params = new SAP();
			params.defaultBreaks = [2,4,6,8];
			params.outSpatialReference = srProj;
			params.returnFacilities = false;
			params.overlapLines=false;
			params.returnPointBarriers=false;
			params.returnPolygonBarriers=false;
			params.returnPolylineBarriers=false;
			params.impedanceAttribute="EMS_DriveTime";
			params.outputLines = NATypes.OutputLine.NONE;
			params.overlapPolygons=false;
			params.outputPolygons =  NATypes.OutputPolygon.DETAILED;
			params.travelDirection = NATypes.TravelDirection.FROM_FACILITY;
			params.facilities=results;
			sat.solve(params,function(result){
				//console.log(result)
				var tempGraphics=[];
				var features = result.serviceAreaPolygons
				for(var i=0;i<features.length; i++){
					tempGraphics.push(new Graphic(features[i].geometry,null,features[i].attributes))
				}
				serviceAreaFTFL.applyEdits(tempGraphics);		

			},function(err){console.log(err)})
		});
	}

	function createPTServiceArea(){	

		var basePTQuery = new Query();	
		basePTQuery.returnGeometry=true;
		basePTQuery.outFields=['*'];
		basePTQuery.where="1=1";			

		baseQT.execute(basePTQuery,function(results){
			var params = new SAP();
			params.defaultBreaks = [2,4,6,8];
			params.outSpatialReference = srProj;
			params.returnFacilities = false;
			params.overlapLines=false;
			params.returnPointBarriers=false;
			params.returnPolygonBarriers=false;
			params.returnPolylineBarriers=false;
			params.impedanceAttribute="EMS_DriveTime";
			params.outputLines = NATypes.OutputLine.NONE;
			params.overlapPolygons=false;
			params.outputPolygons =  NATypes.OutputPolygon.DETAILED;
			params.travelDirection = NATypes.TravelDirection.FROM_FACILITY;
			params.facilities=results;
			sat.solve(params,function(result){
				//console.log(result)
				var tempGraphics=[];
				var features = result.serviceAreaPolygons;
				console.log(features)
				for(var i=0;i<features.length; i++){
					tempGraphics.push(new Graphic(features[i].geometry,null,features[i].attributes))
				}
				serviceAreaPTFL.applyEdits(tempGraphics);
			},function(err){console.log(err)})
		});

	}



	
	
	//handle map events and settings 
	map.disableKeyboardNavigation();

	map.on("load",function(){
		map.setExtent(new Extent(1238354,655956,1433787,770657,new SpatialReference({wkid:102719})));
		map.centerAt(new Point(1335630,712000,srProj));
	});

	map.on("extent-change",function(evt){
		var scale = map.getScale();
		if (scale<=12000){
			orthoService.setVisibleLayers([5]);
			if(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/iPhone|iPad|iPod/i)||navigator.userAgent.match(/Opera Mini/i)||navigator.userAgent.match(/IEMobile/i)) {
				emsLDO.showLabels = true;
				//emsLDO.scaleSymbols = true;		  
				var emsDOptions = [];
				emsDOptions[3] = emsLDO;
				emsDOptions[4] = emsLDO;
				emsDOptions[6] = emsLDO;				
				//emsMap.setLayerDrawingOptions(emsDOptions);
			}
		}
		else{
			orthoService.setVisibleLayers([]);
			if(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/iPhone|iPad|iPod/i)||navigator.userAgent.match(/Opera Mini/i)||navigator.userAgent.match(/IEMobile/i)) {
				emsLDO.showLabels = false;
				//emsLDO.scaleSymbols = true;		  
				var emsDOptions = [];
				emsDOptions[3] = emsLDO;
				emsDOptions[4] = emsLDO;
				emsDOptions[6] = emsLDO;				
				emsMap.setLayerDrawingOptions(emsDOptions);
			}
		}

	});


	//add layers to map
	map.addLayer(basemap);
	map.addLayer(orthoService);
	map.reorderLayer("orthoService",0);
	map.reorderLayer("basemap",1);
	map.addLayer(addressPts);
	map.addLayer(emsMap);
	map.addLayer(avlPTGL);
	map.addLayer(avlHighlightGL);
	map.addLayer(routePtsGL);
	map.addLayer(routeGL);
	map.addLayer(cfGL);
	map.addLayer(incidentLocGL);
	
	//create standby widget for use when getting data
	var standby = new Standby({target:"mapDiv"});
	document.body.appendChild(standby.domNode);
	standby.startup();
	//set navigation toolbar, from esri sample.
	var navToolbar = new Navigation(map);
	navToolbar.on("onExtentHistoryChange", extentHistoryChangeHandler);
	registry.byId("zoomin").on("click", function () {
		navToolbar.activate(Navigation.ZOOM_IN);});
	registry.byId("zoomout").on("click", function () {
		navToolbar.activate(Navigation.ZOOM_OUT);});
	registry.byId("zoomfullext").on("click", function () {
		zoomFullExtent();
	});
	registry.byId("zoomprev").on("click", function () {
		navToolbar.zoomToPrevExtent();});
	registry.byId("zoomnext").on("click", function () {
		navToolbar.zoomToNextExtent();});
	registry.byId("pan").on("click", function () {
		navToolbar.activate(Navigation.PAN);});
	function extentHistoryChangeHandler () {
			registry.byId("zoomprev").disabled = navToolbar.isFirstExtent();
			registry.byId("zoomnext").disabled = navToolbar.isLastExtent();
		}
	//zoom full extent function
	function zoomFullExtent(){
		map.setExtent(new Extent(1238354,655956,1433787,770657,new SpatialReference({wkid:102719})));
		map.centerAt(new Point(1335630,712000,srProj));
	}

	//Search and zooming to an address code.
	var addressSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 
			10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1), new dojo.Color([0,255,0]));
	var addressMemory = new Memory();
	var addressSearch = new ComboBox({
		id: "addressSearch",
		intermediateChanges: true,
		
		required: false,
		placeHolder: "Enter Address",
		autoComplete:false,
		scrollOnFocus:true,
		store:addressMemory,
		queryExpr:"*${0}*",
		searchAttr: "id",
		onKeyUp:function(evt){
			var searchObject={};
			if(evt.keyCode == 13){
				var addQuery = new Query();
				map.graphics.clear();
				var addressObject = addressMemory.get(dijit.byId("addressSearch").value)
				console.log(addressObject)
				map.setScale(2800);
				map.centerAt(addressObject.GEOMETRY);

			    var graphic = new esri.Graphic(addressObject.GEOMETRY, addressSymbol);
			    map.graphics.add(graphic);
			    dijit.byId("addressSearch").reset();
			    addressMemory.setData([]);
			}
			else{
			
				var addQuery = new Query();
				addQuery.returnGeometry = true;
				addQuery.where = "ADDRESS_FULL LIKE '%" + this.value + "%' AND ADDR_STATUS LIKE 'ACT'" ;
				addQuery.outFields = ["ADDRESS_FULL","UNIT", "PIN", "ZIP"];
				addQueryTask.execute(addQuery, function(results){
					var features = results.features;			
					console.log(features)
					for (var i = 0; i<features.length; i++){
						var tempCommunity = city_zip[features[i].attributes.ZIP];
						var id=features[i].attributes.ADDRESS_FULL
						if(features[i].attributes.UNIT && features[i].attributes.UNIT.length>0){
							id += "-"+ features[i].attributes.UNIT
						}
						id +=", "+tempCommunity
						addressMemory.put({name: features[i].attributes.PIN, id:id, 
							ADDRESS_FULL:features[i].attributes.ADDRESS_FULL,
							UNIT:features[i].attributes.UNIT,
							GEOMETRY:features[i].geometry,
							CITY:tempCommunity,
							ZIP:features[i].attributes.ZIP});
					}
				});
			}
		}
	}, "addressSearch").startup;
	


	//code to handle the dgrid for displaying GPS query info

	var dataGridHeader = new Grid({		
		columns:{
		Longitude: 'Northing (ft)',		
	    Latitude: 'Easting (ft)',
	    Speed: 'Speed (mi/h)',
	    Time: "Time"},
	    showHeader:false
		},"dataGridHeader");
	dataGridHeader.renderArray([{"Latitude":"Latitude","Longitude":"Longitude","Speed":"Speed","Time":"Time"}])			
	domStyle.set(dom.byId("dataGridHeader-row-0"),"background-color","#D3D3D3");
	domStyle.set(dom.byId("dataGridHeader-row-0"),"font-weight","bold");
	domStyle.set(dom.byId("dataGridHeader-row-0"),"font-size","9pt");
	var dataGrid = new Grid({
		columns:{
			Longitude: 'Northing (ft)',		
		    Latitude: 'Easting (ft)',
		    Speed: 'Speed (mi/h)',
		    TimeCreated: "Time"},
		    showHeader:false
			
	},"dataGrid");
	
	//for getting info for car call info
	var callInfoSelect=new Select({id:"callInfoSelect",options:[{value:"Select Call",label:"Select Call",selected:true}],style:"margin-left:20%;margin-top:10%;"},"callInfoSelect");
	//for getting historic AVL points
	var unitSelect=new Select({style:"margin-top:-4vh;",options:[{label:"3M1",value:"3M1",selected:!0},{label:"3M2",value:"3M2"},{label:"3M3",value:"3M3"},{label:"3M4",value:"3M4"},{label:"3M5",value:"3M5"},{label:"3M6",value:"3M6"},
	                                                {label:"3M7",value:"3M7"},{label:"3M8",value:"3M8"},{label:"3M9",value:"3M9"},{label:"3M10",value:"3M10"},{label:"3M11",value:"3M11"},{label:"3M12",value:"3M12"},
	                                                {label:"3M42",value:"3M42"},{label:"3M45",value:"3M45"},{label:"3M46",value:"3M46"},{label:"C300",value:"300"},{label:"C301",value:"301"},
	                                                {label:"C307",value:"307"},{label:"C308",value:"308"}]},"unitSelect");
	
	///getting and processing/displaying historic GPS data.
	getDataButton.on("click",function(){
		dom.byId("modelAVLDT").innerHTML= "<b>Emg. Rush Hour DT Est. (min.): </b>";
		dom.byId("routeDistance").innerHTML = "<b>Distance (mi.): </b>";
			dom.byId("driveTime").innerHTML= "<b>AVL Drive Time (min.): </b>";
		avlPTGL.clear();
		avlHighlightGL.graphics[0].setGeometry(null)
		var startDate = new Date(yearTB.value,moTB.value,dayTB.value,startHourTB.value,startMinTB.value);
		var endDate = new Date(yearTB.value,moTB.value,dayTB.value,endHourTB.value,endMinTB.value);
		var diff = dojoDate.difference(endDate,startDate,"minute");
		var startTime = startDate.toTimeString().substr(0,8);
		var endTime = endDate.toTimeString().substr(0,8);
		var date = yearTB.value.toString()+"-"+moTB.value.toString()+"-"+dayTB.value.toString();
		standby.show();

		dojoRequest.post("getData.php",{
			data: {"date":date,
				"startTime":startTime,
				"endTime":endTime,
				"unit":unitSelect.value,
				"creds":JSON.parse(localStorage.getItem("catcoEMS")).credentials[0].userId.toUpperCase()
				},
			timeout: 5000
		}).then(function(res){
			try{
				map.graphics.clear();
			}
			catch(e){}
		
			
			if(res.toString() == "No Connection!"){
				standby.hide();
				alert("No DB connection!");
			}
			else if(res.toString() == "Invalid time length."){
				standby.hide();
				alert("Time length must be 1 Hour or less.")
			}
			else if(res.toString() =="No Data"){
				standby.hide();
				alert("No Data.");
			}
			else{
				var result = '';
				try{
					result=JSON.parse(res);
				}
				catch(e){
					alert("Error parsing data.");
					standby.hide();
				}
				var dGridData = [];				
				//create symbol color for graphic for individual points and add data to the dgrid table
				for(var i=0;i<result.length;i++){
					var x = parseFloat(result[i][1]);
					var y = parseFloat(result[i][0]);
					var speed = result[i][2];
					var time = result[i][3].substr(0,8);
					var date = result[i][4]
					var projPt =  Proj4('NCSP',[x,y])
					
					var sms = '';
					if(i==0){
						sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(greenColor).setSize(13);
					}
					else if(i == (result.length - 1)){
						sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(redColor).setSize(13);
					}
					else{
						sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(Color.blendColors(greenColor, redColor, i/result.length)).setSize(8);
					}
					avlPTGL.add(new Graphic(new Point(projPt[0]*3.28084,projPt[1]*3.28084,srProj),sms,{speed:speed,time:time,date:date}));	
					dGridData.push({"Latitude":(projPt[1]*3.28084).toFixed(0),"Longitude":(projPt[0]*3.28084).toFixed(0),"Speed":speed,"TimeCreated":time});					
				}
				dataGrid.renderArray(dGridData);
	
				domStyle.set("dataGrid-row-0","background-color","#00ff00")
				domStyle.set("dataGrid-row-"+(result.length-1).toString(),"background-color","#ff0000")
				
				//zoom to extent of graphics
				var graphicExtent =graphicsUtils.graphicsExtent(avlPTGL.graphics)
				var xMin = graphicExtent.xmin-150;
				var xMax = graphicExtent.xmax+150;
				var yMin = graphicExtent.ymin-150;
				var yMax = graphicExtent.ymax+150;
				graphicExtent.update(xMin,yMin,xMax,yMax,srProj)
				map.setExtent(graphicExtent);	
				
				//calculate the total time between first and last ponts
				var avlTimeDiff =Date.parse(avlPTGL.graphics[avlPTGL.graphics.length-1].attributes.date+" "+avlPTGL.graphics[avlPTGL.graphics.length-1].attributes.time)-Date.parse(avlPTGL.graphics[0].attributes.date+" "+avlPTGL.graphics[0].attributes.time);

				dom.byId("driveTime").innerHTML= "<b>AVL Drive Time (min.): </b>"+((avlTimeDiff/60000).toFixed(2)).toString();
				//calculate what the route should have taken according to the drive time model
				getRouteQuery(avlPTGL.graphics).then(function(routeGraphic){
					console.log(routeGraphic)
					var dt = routeGraphic.attributes.Total_EMS_DriveTime.toFixed(2);
					var distance = (routeGraphic.attributes.Shape_Length/5280).toFixed(2);
					dom.byId("modelAVLDT").innerHTML= "<b>Emg. Rush Hour DT Est. (min.): </b>"+dt.toString();
					dom.byId("routeDistance").innerHTML= "<b>Distance (mi.): </b>"+distance.toString();
				});
				standby.hide();

			}
		},function(){alert("Database connection error.");standby.hide();});
	});
	//set first and last rows in table to green and red respectively.
	map.on("extent-change",function(evt){
		var scale = map.getScale();
		if(scale<100){
			map.setScale(135.36);
		}
		});
	//highlight the gps point on the map when click in the table
	on(dom.byId("dataGrid"),"click",function(evt){
		for(var i =0, len=avlPTGL.graphics.length;i<len;i++){
			if(evt.target.parentNode.parentNode.parentNode.id=="dataGrid-row-"+i.toString()){
				var x = parseInt(evt.target.parentNode.cells[0].innerHTML);
				var y = parseInt(evt.target.parentNode.cells[1].innerHTML)
				avlHighlightGL.graphics[0].setGeometry(new Point(x,y,srProj));
				domStyle.set(dom.byId("dataGrid-row-"+i),"font-weight","bold");
				domStyle.set(dom.byId("dataGrid-row-"+i),"color","blue");
			}
			else{
				domStyle.set(dom.byId("dataGrid-row-"+i),"font-weight","normal");
				domStyle.set(dom.byId("dataGrid-row-"+i),"color","black");
			}
		}

	});
	//when hovering over a point the joining record in the table is scrolled into view and the text is changed to red
	avlPTGL.on("mouse-over",function(pt){
		if(dijit.byId("dijit_layout_TabContainer_1").get("selectedChildWidget").id=="GPSData"){
			for(var b=0;b<avlPTGL.graphics.length;b++){
				if(dom.byId("dataGrid-row-"+b).childNodes[0].childNodes[0].childNodes[3].innerHTML==pt.graphic.attributes.time){
					dWin.scrollIntoView(dom.byId("dataGrid-row-"+b.toString()))
					//var offset = dataGrid.row(dom.byId("dataGrid-row-"+b.toString())).element.offsetTop;				
					//dom.byId("dataGrid").scrollTop = offset;
					domStyle.set(dom.byId("dataGrid-row-"+b),"font-weight","bold");
					domStyle.set(dom.byId("dataGrid-row-"+b),"color","blue");
				}
				else{
					domStyle.set(dom.byId("dataGrid-row-"+b),"font-weight","normal");
					domStyle.set(dom.byId("dataGrid-row-"+b),"color","black");
				}
			}
				
		}			
		avlHighlightGL.graphics[0].setGeometry(pt.graphic.geometry);
	});
	//tab rendering gets messed up when moving between tabs, so this cleans it up and makes sure everything is in view
	dijit.byId("dijit_layout_TabContainer_1_tablist_queryContentPane").on("click",function(){dom.byId('unitTitle').scrollIntoView();});
	dijit.byId("dijit_layout_TabContainer_1_tablist_routeContentPane").on("click",function(){dom.byId('title').scrollIntoView();})
	
	
	//This block of code is used for determing the optimal route and drive time between any two points selected by the user on the map
	startRouteButton.on("click",function(){
		var centerX = Math.trunc((map.extent.xmax+map.extent.xmin)/2);
		var centerY = Math.trunc((map.extent.ymax+map.extent.ymin)/2);
		var startPoint = new Point(centerX,centerY,srProj);
		var sms= new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(greenColor).setSize(12);
		try{
			routePtsGL.graphics[0].setGeometry(startPoint)
		}
		catch(e){
			routePtsGL.add(new Graphic(startPoint,sms))
		}

		dom.byId("startPtText").innerHTML = "X:"+startPoint.x.toString()+" Y:"+startPoint.y.toString();
	});

	stopRouteButton.on("click",function(){
		var centerX = Math.trunc((map.extent.xmax+map.extent.xmin)/2);
		var centerY = Math.trunc((map.extent.ymax+map.extent.ymin)/2);
		stopPoint = new Point(centerX,centerY,srProj);
		var sms= new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_SQUARE).setColor(redColor).setSize(12);
		try{
			routePtsGL.graphics[1].setGeometry(stopPoint,sms)
		}
		catch(e){
			routePtsGL.add(new Graphic(stopPoint,sms))
		}

		dom.byId("stopPtText").innerHTML = "X:"+stopPoint.x.toString()+" Y:"+stopPoint.y.toString();
	});

	//get optimized route
	getRouteButton.on("click",function(){
		routeGL.clear();
		if(routePtsGL.graphics.length==2){
			getRouteQuery(routePtsGL.graphics).then(function(routeGraphic){

				var dt = routeGraphic.attributes.Total_EMS_DriveTime.toFixed(2)
				var distance = (routeGraphic.attributes.Shape_Length/5280).toFixed(2)
				routeGraphic.setSymbol(routeSLS);
				routeGL.add(routeGraphic);
				var graphicExtent =graphicsUtils.graphicsExtent(routeGL.graphics)
				var xMin = graphicExtent.xmin-150;
				var xMax = graphicExtent.xmax+150;
				var yMin = graphicExtent.ymin-150;
				var yMax = graphicExtent.ymax+150;
				graphicExtent.update(xMin,yMin,xMax,yMax,srProj)
				map.setExtent(graphicExtent);
				dom.byId("routeQueryDT").innerHTML= "<b>Estimated Drive Time (min.): </b>"+dt.toString();
				dom.byId("routeQueryDistance").innerHTML= "<b>Approximate Distance(mi): </b>"+distance.toString();
			});

		}
		else{
			alert("Please select start/stop locations")
		}

	});


	function getRouteQuery(routeGraphics){
			var deferred = new Deferred();
			var routeGraphic = new Graphic();
			var rTask = new RouteTask("centerlines routing endpoint");
			var rParams = new RouteParameters();
			rParams.returnRoutes = true;
			rParams.returnDirections = false;
			rParams.impedanceAttribute="EMS_DriveTime";
			var fs = new FeatureSet();
			rParams.stops = fs;
			fs.features = routeGraphics;
			rTask.solve(rParams,function(result){
				
				var attributes = result.routeResults[0].route.attributes;
				var paths = result.routeResults[0].route.geometry.paths[0];
				var routePL = new Polyline(paths);
				routePL.setSpatialReference(srProj);
				routeGraphic = new Graphic(routePL,null,attributes);

			});
		    setTimeout(function(){
		        deferred.resolve(routeGraphic);
		      }, 1800);

		     return deferred.promise;
	}

	
	//this code allows user to select a street intersection and the application will automatically route the nearest available vehicle
	var streetMemory = new Memory();
	var stIntRouteSearch = new ComboBox({
		id:"stIntRouteSearch",
		streetQuery:new Query(),
		stIntQuery:new Query(),
		queryGeomPolyline : new Polyline(new SpatialReference({wkid:102719})),
		intermediateChanges: true,
		style:"width:12vw; margin-right:1vw; margin-top:3px;height:2.25vh;",
		required: false,
		placeHolder: "Enter Street (+ Enter)",
		autoComplete:false,
		scrollOnFocus:true,
		store:streetMemory,
		queryExpr:"*${0}*",
		searchAttr: "id",
		stIntWhere:'',
		notFirstQuery:false,
		onKeyUp:function(evt){
			var self = dijit.byId("stIntRouteSearch");
			if(evt.keyCode==13){				
				self.stIntQuery.returnGeometry=true;			
				self.streetQuery.returnGeometry=true;
				self.streetQuery.where = "STREET_COMP LIKE '" + streetMemory.get(self.value).name + "' AND COMMENT NOT LIKE 'ESN ONLY'" ;
				//console.log(self.streetQuery.where)
				streetsCLFL.queryFeatures(self.streetQuery,function(result){					
					var features = result.features;
					if(features){						
						for(var i in features){
							for(var x in features[i].geometry.paths){
								self.queryGeomPolyline.addPath(features[i].geometry.paths[x]);								
							}						
						}
						self.streetQuery.geometry = self.queryGeomPolyline;						
					}
					self.streetQuery.where="1=1 AND COMMENT NOT LIKE 'ESN ONLY'";
					streetMemory.setData([]);	
					streetsCLFL.queryFeatures(self.streetQuery, function(results){
											
						for(var i in results.features){
							var tempStreet = results.features[i].attributes.STREET_COMP;
							var tempCity = results.features[i].attributes.CITY_LIMITS;
							
							if(!streetMemory.get(tempStreet+", "+tempCity) && streetMemory.get(tempStreet+", "+tempCity)!= tempStreet){
								streetMemory.put({name: tempStreet, id:tempStreet+ ", "+tempCity});
							}							
						}						
						if(self.notFirstQuery){
							self.stIntWhere+=" and "
						}
						self.notFirstQuery=true
						var streetName =  streetMemory.get(self.value).name
						self.stIntWhere+= "(streets1 LIKE '"+ streetName+"' or streets2 LIKE '"+ streetName+ "' or streets3 LIKE '"+ streetName +
							"' or streets4  LIKE '"+ streetName + "' or streets5 LIKE '"+ streetName + "' or streets6 LIKE '"+ streetName+"')"					
						self.stIntQuery.where = self.stIntWhere;
						streetIntsFL.selectFeatures(self.stIntQuery,FeatureLayer.SELECTION_NEW,function(results){
							self.reset();
							if(results.length == 1){
								self.reset();	
								self.notFirstQuery=false;
								self.streetQuery = new Query();
								self.queryGeomPolyline=new Polyline(new SpatialReference({wkid:102719}));
								streetIntsFL.clear();
								self.stIntWhere = '';
								streetMemory.setData([]);
								map.setScale(1200);
								map.centerAt(results[0].geometry);
								self.set("placeHolder", "Enter Street (+ Enter)");		
								var attributes = results[0].attributes;
								dom.byId("intersectionCount").innerHTML='';
								var streetFields = ["streets1","streets2","streets3","streets4","streets5","streets6"]
								var intsString = ''
								for(var i in streetFields){									
									if(attributes[streetFields[i]] != null){
										intsString += attributes[streetFields[i]] + " // "
									}
								}
								intsString = intsString.substr(0,intsString.length-3)
								dom.byId('stIntsSelected').innerHTML = intsString;
								incidentLocGL.add(new Graphic(results[0].geometry,incidentLocSymbol))
								getNearestCar();
							}

							else if(results.length==2 && testTwoIntersections(results)){
								console.log("found")
								self.reset();	
								self.notFirstQuery=false;
								self.streetQuery = new Query();
								self.queryGeomPolyline=new Polyline(new SpatialReference({wkid:102719}));
								streetIntsFL.clear();
								self.stIntWhere = '';
								streetMemory.setData([]);
								self.set("placeHolder", "Enter Street (+ Enter)");
								var attributes = results[0].attributes;
								dom.byId("intersectionCount").innerHTML='';
								var streetFields = ["streets1","streets2","streets3","streets4","streets5","streets6"]
								var intsString = ''
								for(var i in streetFields){									
									if(attributes[streetFields[i]] != null){
										intsString += attributes[streetFields[i]] + " // "
									}
								}
								intsString = intsString.substr(0,intsString.length-3)
								dom.byId('stIntsSelected').innerHTML = intsString;
								incidentLocGL.add(new Graphic(results[0].geometry,incidentLocSymbol))
								getNearestCar();
							}

							else if(results.length==0){
								self.reset();	
								self.notFirstQuery=false;
								self.streetQuery = new Query();
								self.queryGeomPolyline=new Polyline(new SpatialReference({wkid:102719}));
								streetIntsFL.clear();
								self.stIntWhere = '';
								streetMemory.setData([]);
								alert("No intersections found!")
								self.set("placeHolder", "Enter Street (+ Enter)");	
							}
							else{
								self.set("placeHolder", results.length.toString() + " found. Select X-street.");
								self.loadDropDown();
								self.openDropDown();
							}
						});					
					});					
				});			
			}
			else{
				self.streetQuery.returnGeometry = false;
				self.streetQuery.where = "STREET_COMP LIKE '%" + self.value + "%' AND COMMENT NOT LIKE 'ESN ONLY'" ;
				self.streetQuery.outFields = ["*"];
				streetsCLFL.queryFeatures(self.streetQuery, function(results){
					var features = results.features;
					var i = 0;
					for (i; i<features.length; i++){						
						streetMemory.put({name: features[i].attributes.STREET_COMP, id:features[i].attributes.STREET_COMP + ", "+features[i].attributes.CITY_LIMITS});					
					}
				});
				
			}
		}
	},"stIntRouteSearch");
	function testTwoIntersections(results){
		var array1 = []
		var array2 = []
		for(var i=1; i<7;i++){
			array1.push(results[0].attributes["streets"+i.toString()])
			array2.push(results[1].attributes["streets"+i.toString()])
		}
		var test = dojoarray.every(array1,function(street){						
			return array2.indexOf(street)>-1;
		});
		return test
	};
	var nearestCarRouteButton = new Button({
		id:"nearestCarRouteButton",
		label:"Refresh",
		style:"margin-left:4vh; margin-top:2vh;"
	},"nearestCarRouteButton");
	nearestCarRouteButton.on("click",function(){
		getNearestCar();
	})
	
	
	//This code allows the user to select any address in the county and route the nearest available vehicle
	var addRouteMemory = new Memory();
	var addressRouteSearch = new ComboBox({
		id: "addressRouteSearch",
		intermediateChanges: true,
		style:"width:15vw; margin-right:1vw; margin-top:3px;height:2.25vh;",
		required: false,
		placeHolder: "Enter Address (+ Enter)",
		autoComplete:false,
		scrollOnFocus:true,
		store:addRouteMemory,
		queryExpr:"*${0}*",
		searchAttr: "id",
		onChange: function(evt){
			dijit.byId("stIntRouteSearch").set("disabled",true);
			var self = dijit.byId("addressRouteSearch")
			var value = self.value;
			var addQueryTask = new QueryTask("address point endpoint");
			var addQuery = new Query();
			addQuery.returnGeometry = true;
			addQuery.where = "ADDRESS_FULL LIKE '%" + value + "%'" ;
			addQuery.outFields = ["ADDRESS_FULL", "PIN", "ZIP"];
			addQueryTask.execute(addQuery, function(results){
				var features = results.features;
				var i = 0;
				for (i; i<features.length; i++){
					var tempCommunity = city_zip[features[i].attributes.ZIP];
					addRouteMemory.put({name: features[i].attributes.PIN, id:features[i].attributes.ADDRESS_FULL+", "+tempCommunity, geometry:features[i].geometry});
				}
			});
		},
		onKeyUp:function(evt){
			var searchObject={};
			if(evt.keyCode == 13){
				var incPoint = addRouteMemory.get(dijit.byId("addressRouteSearch").value).geometry;
				dom.byId("routeAddress").innerHTML = dijit.byId("addressRouteSearch").value;
				zoomFullExtent();
				incidentLocGL.add(new Graphic(incPoint,incidentLocSymbol));
				getNearestCar();
			}
		}
	}, "addressRouteSearch").startup;
	
	//function to route nearest available car
	function getNearestCar(){
		dijit.byId("addressRouteSearch").set("disabled",true);
		dijit.byId("stIntRouteSearch").set("disabled",true);
		var carFS = new FeatureSet();
		carFS.geometryType='esriGeometryPoint';
		carFS.spatialReference=srProj;
		var incidentFS = new FeatureSet();
		incidentFS.geometryType='esriGeometryPoint';
		incidentFS.spatialReference=srProj;
		var cftParams= new CFTParams();
		cftParams.returnRoutes=true;
		incidentFS.features = [incidentLocGL.graphics[0]];
		cftParams.incidents=incidentFS;
		cftParams.returnDirections = true;
		cftParams.travelDirection = NATypes.TravelDirection.FROM_FACILITY;
		cftParams.impedanceAttribute="EMS_DriveTime";
		//Select only available cars for routing
		for(var i in medics){
			if(map.getLayer(medics[i]).graphics[0].attributes.available=="yes" && map.getLayer(medics[i]).graphics[1].symbol.text.indexOf("Out")==-1){
				carFS.features.push(new Graphic(new Point(map.getLayer(medics[i]).graphics[0].geometry),null,{"Name":medics[i]}));
			}			
		}					

		cftParams.facilities=carFS;
		cft.solve(cftParams,function(result){
			var route = result.routes[0];
			var attributes = route.attributes
			cfGL.clear();
			var paths = route.geometry.paths[0];
			var routePL = new Polyline(paths);
			routePL.setSpatialReference(srProj);
			var routeGraphic = new Graphic(routePL,routeSLS,attributes);
			cfGL.add(routeGraphic);	
			var dt = attributes.Total_EMS_DriveTime.toFixed(2);
			var dtString = dt.toString().split(".");
			var minutes = dtString[0];
			var seconds = ((parseInt(dtString[1])*0.6).toFixed(0)).toString();
			var unit = attributes.Name.split(" - ")[0];
			dom.byId("nearestUnit").innerHTML = "Nearest Vehicle: " + unit +", "+minutes+" min. "+seconds+"sec.";

			//set picked car and text symbols red
			map.getLayer(unit).graphics[0].setSymbol(medicSymbolRed);
			var textLabelRed = new TextSymbol().setColor(redColor).setHaloColor(new Color('#ffffff')).setHaloSize(2.5);
			 if(['3M11','3M42','3M45','3M46'].indexOf(unit)!=-1){
				  textLabelRed.setOffset(0,-30)
			 }
			 else{
				  textLabelRed.setOffset(0,20)
			 }	  
			textLabelRed.font.setSize("10pt");         
			textLabelRed.font.setFamily("arial");
			textLabelRed.font.setWeight(Font.WEIGHT_BOLD);
			var labelText = map.getLayer(unit).graphics[1].symbol.text
			map.getLayer(unit).graphics[1].setSymbol(textLabelRed);
			map.getLayer(unit).graphics[1].symbol.setText(labelText)
			map.getLayer(unit).redraw();
			var graphicExtent =graphicsUtils.graphicsExtent(cfGL.graphics)
			var xMin = graphicExtent.xmin-1500;
			var xMax = graphicExtent.xmax+1500;
			var yMin = graphicExtent.ymin-1500;
			var yMax = graphicExtent.ymax+1500;
			graphicExtent.update(xMin,yMin,xMax,yMax,srProj)
			//zoom to route
			map.setExtent(graphicExtent);				
				
		},function(err){console.log(err);});
		
	}

	var city_zip = {
			"28601": "HICKORY",
			"28602":"HICKORY",
			"28603": "HICKORY",
			"28658": "NEWTON",
			"28613":"CONOVER",
			"28650":"MAIDEN",
			"28609":"CATAWBA",
			"28610":"CLAREMONT",
			"28090":"LAWNDALE",
			"28682": "LAWNDALE",
			"28682": "TERRELL",
			"28037": "DENVER",
			"28092": "LINCOLNTON",
			"28168": "VALE",
			"28612": "CONNELLY SPRINGS",
			"28637": "HILDEBRAN",
			"28673": "SHERRILLS FORD"
	}

	//This code handles the layer tree for toggling layers on the map
	var serviceLayerIDs = {

			"Structures":0,
			"Roads":1,
			"NC Exterior Roads":2,
			"Railroad":3,
			"Parcels":4,
			"Cities":5,
			"City ETJs":9,
			"Cities Outline":6,
			"Lakes":8,
			"County Boundary":7,
			"Address Points": 0,
			"Ortho 2014":5,
			"Rescue Bases":0,
			"Fire Stations":1,
			"Fire Hydrants":2,
			"Standby Locations":3,
			"Fire Districts":5,
			"FT Districts":6,
			"ESN Intrado":7,		
			"PT Districts":8,
			"Rescue Districts":9,			
			"Water Lines":6,			
	}

	//create the layer tree structure for TOC
	var layerTree= new Memory({
		data:[
		      { id: 'Layers', name:'Layers',type:"Layers", parent:null, hideLayers:[5]},
		      {name:"Address Points", id:"addressPtService", type:'service', parent: "Layers", layer:addressPts, checked:true},

		      {name:"Basemap",id:"Basemap", type:'service', parent: "Layers", isExpanded:true, layer:basemap},
		      {name:'Structures', type:'layer', parent: "Basemap", checked:true},
		      {name:'Parcels', type:'layer', parent: "Basemap", checked:true},
		      {name:'Roads', type:'layer', parent: "Basemap", checked:true},
		      {name:'NC Exterior Roads', type:'layer', parent: "Basemap", checked:false},
		      {name:'Railroad', type:'layer', parent: "Basemap", checked:true},
		      {name:'Cities', type:'layer', parent: "Basemap", checked:false},
		      {name:'City ETJs', type:'layer', parent: "Basemap", checked:false},
		      {name:'Cities Outline', type:'layer', parent: "Basemap", checked:false},
		      {name:'Lakes', type:'layer', parent: "Basemap", checked:true},
		      {name:'County Boundary', type:'layer', parent: "Basemap", checked:true},

		      {name:"EMS",id:"emsMap", type:'service', parent: "Layers", isExpanded:true, layer:emsMap},
		      
		      {name:'FT Bases', type:'layer', parent: "emsMap", checked:true},
		      {name:'PT Bases', type:'layer', parent: "emsMap", checked:true},
		      {name:'Standby Locations', type:'layer', parent: "emsMap", checked:true},
		      {name:'Fire Stations', type:'layer', parent:"emsMap", checked:false},
		      {name:'Fire Hydrants', type:'layer', parent: "emsMap", checked:false},
		      {name:'Rescue Bases', type:'layer', parent: "emsMap", checked:false},
		      {name:'FT Districts', type:'layer', parent: "emsMap", checked:true},
		      {name:'PT Districts', type:'layer', parent: "emsMap", checked:false},
		      {name:'Fire Districts', type:'layer', parent: "emsMap", checked:false},
		      {name:'Rescue Districts', type:'layer', parent: "emsMap", checked:false},	      
		      {name:'ESN Intrado', type:'layer', parent: "emsMap", checked:false},
		      
		      {name:'FT 8-min SA (2 Min Inc.)', type:'layer', parent: "Layers",layer:serviceAreaFTFL, checked:false},
		      {name:'PT 8-min SA (2 Min Inc.)', type:'layer', parent: "Layers",layer:serviceAreaPTFL, checked:false},		   	
		      {name:'Water Lines', id:"utilService", type:'service', parent: "Layers",layer:utilService},
		      {name:'Ortho 2014', id:"orthoService", type:'service', parent: "Layers", layer:orthoService, checked:false},
		      {name:'Pictometry 2017', id:"pictoService", type:'service', parent: "Layers", layer:pictoService, checked:false}
		      ]
	});

	//create the TOC tree
	var myStore = new Hierarchy( { data:layerTree.data} );

	var myModel = new TreeStoreModel({ store:myStore,
		query:{name:"Layers"},
		checkStrict:true,
		multiState:true, });

	var myTree  = new Tree1( { model:myModel,
		id:"layersTree",
		branchIcons:true,
		branchReadOnly:true,
		branchCheckBox:false,
		leafIcons:false,
		autoExpand:true,
		checkBoxes:true }, "myTree" );

	//Handle the click events for the TOC
	myTree.startup();
	myTree.on("CheckBoxClick", function(node){

		var layers = [];
		var idArray = [];
		var tempServiceNode = layerTree.get(node.parent);
		//USE STORE.GET - put "layer" back in parent node
		//check to see if layer is pzService

		if(["Address Points","Ortho 2014","Water Lines", "Pictometry 2017"].indexOf(node.name)>=0){

			if(node.checked==true){
				map.addLayer(node.layer)
				node.layer.setVisibility(true);
			}
			else{
				map.removeLayer(node.layer)
			}
			if(["Ortho 2014", "Pictometry 2017"].indexOf(node.name)>=0){
				map.reorderLayer(node.id,0);
			}
		}
		else if(node.name=='FT 8-min SA (2 Min Inc.)'){
			console.log(node.layer)
			if(node.layer.graphics.length==0 && node.checked==true){
				createFTServiceArea()
				map.addLayer(node.layer)
				node.layer.setVisibility(true);
			}
			else if (node.layer.graphics.length>0 && node.checked==true){
				map.addLayer(node.layer )
				node.layer.setVisibility(true);
			}
	
			else{
				map.removeLayer(node.layer)				
			}
			
		}
		else if(node.name=='PT 8-min SA (2 Min Inc.)'){
				if(node.layer.graphics.length==0 && node.checked==true){
					createPTServiceArea()
					map.addLayer(node.layer)
					node.layer.setVisibility(true);
				}
				else if (node.layer.graphics.length>0 && node.checked==true){
					map.addLayer(node.layer )
					node.layer.setVisibility(true);
				}
		
				else{
					map.removeLayer(node.layer)				
			}
				
		}

		else if(node.parent == "emsMap"){
			var query = {parent:node.parent, checked:true}
			var emsLayerDef =[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
			var result = myStore.query(query);
			var nameList = dojoarray.map(result,function(item){return item.name});
			var basesList = dojoarray.filter(nameList,function(item){if(["FT Bases","PT Bases"].indexOf(item)>=0){return item}});

			var otherEMSItemsList = dojoarray.filter(nameList,function(item){if(["FT Bases","PT Bases"].indexOf(item)==-1){return item}});

			//handle turning on bases
			if(basesList.indexOf("FT Bases")>=0 && basesList.indexOf("PT Bases")>=0){
				emsLayerDef[4] = "TYPE IN ('FULL TIME','PART TIME')"
				emsMap.setLayerDefinitions(emsLayerDef);
				idArray.push(4);
			}
			else if(basesList.indexOf("FT Bases")>=0 && basesList.indexOf("PT Bases")<0){
				emsLayerDef[4] = "TYPE IN ('FULL TIME')"
				emsMap.setLayerDefinitions(emsLayerDef);
				idArray.push(4);
			}
			else if(basesList.indexOf("FT Bases")<0 && basesList.indexOf("PT Bases")>=0){
				emsLayerDef[4] = "TYPE IN ('PART TIME')"
				emsMap.setLayerDefinitions(emsLayerDef);
				idArray.push(4);
			}
			else{
				//do nothing with bases
			}

			//handle turning on everything else
			if(otherEMSItemsList.length > 0){
				for(var i=0;i<otherEMSItemsList.length;i++){
					idArray.push(serviceLayerIDs[otherEMSItemsList[i]]);
				}
				//check to see if any of the map layers are EMS, if they are then we have to set the visible layers and add the layer
				if(dojoarray.some(map.layerIds, function(item){

					return (item != node.parent);
				})){

					tempServiceNode.layer.setVisibleLayers(idArray);
					map.addLayer(tempServiceNode.layer);
					tempServiceNode.layer.setVisibility(true);

				}
				//if the layer is already added, just set visible layers
				else{
					tempServiceNode.layer.setVisibleLayers(idArray);
					}

			}
			//if no layers in service are checked, remove layer
			else{

				tempServiceNode.layer.setVisibility(false);

			}


		}

		else{
			var query = {parent:node.parent, checked:true}
			var result = myStore.query(query);
			var layers=[];
			result.forEach(function(child){
				layers.push(child.name);
			});

			if(layers.length > 0){
				for(var i=0;i<layers.length;i++){
					idArray.push(serviceLayerIDs[layers[i]]);
				}

				if(dojoarray.some(map.layerIds, function(item){

					return (item != node.parent);
				})){

					tempServiceNode.layer.setVisibleLayers(idArray);
					map.addLayer(tempServiceNode.layer);
					tempServiceNode.layer.setVisibility(true);

				}
				//if already added, just set visible layers
				else{
					tempServiceNode.layer.setVisibleLayers(idArray);
					}

			}
			//if no layers in service are checked, remove layer
			else{

				tempServiceNode.layer.setVisibility(false);

			}
		}
	});

	//add TOC to layout

	registry.byId("layerTreeContentPane").addChild(myTree);




	//buttons to clear out various functions in application
	var clearAVLButton = new Button ({id:"clearAVLButton",label:"Clear Map",style:"margin-left:4vh;"},"clearAVLButton");
	var clearRouteButton = new Button ({id:"clearRouteButton",label:"Clear",style:"margin-left:4vh;"},"clearRouteButton");
	var resetNearestUnitButton = new Button({id:"resetNearestUnitButton", label:"Reset Search",style:"margin-left:4vh;margin-top:2vh;"},"resetNearestUnitButton");
	
	function resetNearestSearches(){
		dom.byId("nearestUnit").innerHTML='';
		dom.byId("intersectionCount").innerHTML='';
		dijit.byId("addressRouteSearch").reset();
		dijit.byId("stIntRouteSearch").reset();
		dijit.byId("addressRouteSearch").set("disabled",false);
		dijit.byId("stIntRouteSearch").set("disabled",false);
		dom.byId("routeAddress").innerHTML = '';
		dom.byId('stIntsSelected').innerHTML=''
		incidentLocGL.clear();
		streetIntsFL.clearSelection();
		dijit.byId("stIntRouteSearch").set("streetQuery",new Query());
		dijit.byId("stIntRouteSearch").set("stIntQuery",new Query());
		dijit.byId("stIntRouteSearch").set("stIntWhere", '');
		dijit.byId("stIntRouteSearch").set("notFirstQuery",false);
		dijit.byId("stIntRouteSearch").set("queryGeomPolyline", new Polyline(srProj));
		cfGL.clear();
		streetMemory.setData([]);
		addRouteMemory.setData([]);
		for(medic in medics){
			setCarSymbol(medics[medic]);
		}
		
	}
	
	resetNearestUnitButton.on("click",function(){
		resetNearestSearches();		
	});
	
	clearAVLButton.on("click",function(){
		avlPTGL.clear();
		dom.byId("modelAVLDT").innerHTML= "<b>Emg. Rush Hour DT Est. (min.): </b>";
		dom.byId("routeDistance").innerHTML= "<b>Distance (mi.): </b>";
		dom.byId("driveTime").innerHTML= "<b>AVL Drive Time (min.): </b>";
		dataGrid.refresh();
		avlHighlightGL.graphics[0].setGeometry(null);
		

	});
	clearRouteButton.on("click",function(){
		routePtsGL.clear();
		routeGL.clear();
		dom.byId("routeQueryDT").innerHTML= "<b>Estimated Drive Time (min.): </b>";
		dom.byId("routeQueryDistance").innerHTML= "<b>Approximate Distance(mi): </b>";
		dom.byId("startPtText").innerHTML ="";
		dom.byId("stopPtText").innerHTML ="";

	});


//This part of the code is where the live dispatch is handled
  var medics = ['3M1','3M2','3M3','3M4','3M5','3M6','3M7','3M8','3M9','3M10','3M11','3M12','3M42','3M45','3M46'];
  var medicSymbolBlue = new PMS ('https://arcgis2.catawbacountync.gov/images/medic_blue.png',25,25);
  var medicSymbolRed = new PMS ('https://arcgis2.catawbacountync.gov/images/medic_red.png',25,25);
  var medicSymbolGrey = new PMS ('https://arcgis2.catawbacountync.gov/images/medic_grey.png',25,25);
  var emsLoc = new PMS('https://arcgis2.catawbacountync.gov/images/ems_location.png',20,30);
  
  
 //the user can left click on the list of units that are being streamed and zoom to one
  var dispatchZoomMenu = new Menu({
	  targetNodeIds: [dijit.byId("carDispatchSelect").domNode]
  },"dispatchZoom");
  var zoomMenuItem = new MenuItem({id:"Zoom",label:"Zoom"});
  dispatchZoomMenu.addChild(zoomMenuItem);

  dispatchZoomMenu.startup();
  on(dom.byId("carDispatchSelect"),"mousedown",function(event){
	 if(mouse.isLeft){
		 var unit = event.target.innerHTML;
		 zoomMenuItem.on("click",function(zoomClick){
			 map.setScale(4000).then(function(){ map.centerAt(map.getLayer(unit).graphics[0].geometry)})
		  });
	 }
   }); 
 

  //INSTANTIATE ALL THE UNIT GRAPHIC LAYERS
  //I can't use a feature layer because when I am updating the status I cannot query using a where statement, because
  //the FL is instantiated from a feature collection, client side
  function createCarGLS(){
	  console.log("creating cars")
	  for (var i in medics){
		  var yCoord = 732000+(i*2500);
		  //var infoTemplate = new InfoTemplate("Unit","Unit: ${Unit}");
		  var carGraphic = new Graphic(new Point(1397894,yCoord,srProj),medicSymbolBlue,
				  {"Unit":medics[i],"available":"yes","ocanum":"","unitInfo":""});
		  var textLabelBlue = new TextSymbol().setColor(blueColor).setHaloColor(new Color('#ffffff')).setHaloSize(2.5) 
		  if(['3M11','3M42','3M45','3M46'].indexOf(medics[i])!=-1){
			  textLabelBlue.setOffset(0,-30)
		  }
		  else{
			  textLabelBlue.setOffset(0,20)
		  }	  
		  textLabelBlue.font.setSize("10pt");         
		  textLabelBlue.font.setFamily("Roboto");
		  textLabelBlue.font.setWeight(Font.WEIGHT_BOLD);
		  textLabelBlue.setText(medics[i]+"-Out")
		  var tempMedicLayer= new GraphicsLayer({id:medics[i]})	;  
		  tempMedicLayer.add(carGraphic);	 
		  tempMedicLayer.add( new Graphic(new Point(1397894,yCoord,srProj),textLabelBlue));
		  map.addLayer(tempMedicLayer);
		  tempMedicLayer.on("click",function(e){
			  dom.byId("dispatchInfoUnit").innerHTML = "<b>Unit: </b>"+e.graphic.attributes.Unit;
			  dom.byId("dispatchInfoOCANum").innerHTML = "<b>OCA: </b>"+e.graphic.attributes.ocanum;
		  //console.log(map.getLayer(tempMedicLayer).graphics[0].attributes);
		  });
	  }
	  setTimeout(function(){dijit.byId("dispatchCB").set("checked",true);},1500);	  
  }

  //function to set car symbol 
  function setCarSymbol(carName){
	  if(map.getLayer(carName).graphics[0].attributes["available"]=="yes")
	  {
		  map.getLayer(carName).graphics[0].setSymbol(medicSymbolBlue);
		  map.getLayer(carName).graphics[1].symbol.setColor(blueColor);
	  }
	  else{
		  map.getLayer(carName).graphics[0].setSymbol(medicSymbolGrey);
		  map.getLayer(carName).graphics[1].symbol.setColor(new Color("#525252"));

		  map.getLayer(carName).redraw();
		  map.reorderLayer(map.getLayer(carName),map.graphicsLayerIds.length-1)
	  }
  }
  //function to reset all car location and status
  function resetAllCars(){
	  resetNearestSearches();
	  for (var i in medics){
		  var yCoord = 737046+(i*2000);		  
		  map.getLayer(medics[i]).graphics[0].setSymbol(medicSymbolBlue);
		  map.getLayer(medics[i]).graphics[0].setGeometry(new Point(1397894,yCoord,srProj));
		  map.getLayer(medics[i]).graphics[1].setGeometry(new Point(1397894,yCoord,srProj));
		  map.getLayer(medics[i]).graphics[1].symbol.setText(medics[i]+"-Out");		  
		  map.getLayer(medics[i]).graphics[1].symbol.setColor(blueColor);		  
	  }	  
  }   
  //will reset just a subset of cars if car selectino set is altered
  function resetSubsetCars(selectedCarList){
	  for(var i in medics){
		  if(selectedCarList.indexOf(medics[i])==-1){
			  var yCoord = 737046+(i*2000);	
			  map.getLayer(medics[i]).graphics[0].setGeometry(new Point(1397894,yCoord,srProj));
			  map.getLayer(medics[i]).graphics[1].setGeometry(new Point(1397894,yCoord,srProj));
			  map.getLayer(medics[i]).graphics[1].symbol.setText(medics[i]+"-Out");
			  setCarSymbol(medics[i]);
		  }
	  }	  
  } 
  
  dijit.byId("carDispatchSelect").on("change",function(selectedList){  resetSubsetCars(selectedList);});
  
  //sends the list of cars to the websocket to get data for
  function getSelectedCarsStatement(){
	  var selectedCars = dijit.byId("carDispatchSelect").getSelected();
	  var carSelectStatement = "(''";
	  for (var i =0;i<selectedCars.length;i++){
		  	carSelectStatement += ",'"+selectedCars[i].value+"'";
	  	}	
	  carSelectStatement +=")";
	  carSelectStatement = "cars;split;"+JSON.parse(localStorage.getItem("catcoEMS")).credentials[0].userId.toUpperCase() + ";split;"+JSON.parse(localStorage.getItem("catcoEMS")).credentials[0].token + ";split;"+carSelectStatement;
	  return carSelectStatement	  
  }
  
  //timer to send message to websocket to get new info
  var dispatchTimer = new dojox.timing.Timer(3000);
 
  dispatchTimer.onTick = function(){
	socket.send(getSelectedCarsStatement());
 }


  
  //function to update car location
  function updateCarLocation(data){	 
	  //console.log(data)
	  var dataLen = data.length;
	  if(data.length>0){
		  for(var i = 0; i<data.length; i++){
			  var projLatLong=Proj4('NCSP',[data[i].Long,data[i].Lat]);
			  map.getLayer(data[i].MobileLogin).graphics[0].setGeometry(new Point( projLatLong[0]*3.28084,projLatLong[1]*3.28084,srProj));
			  map.getLayer(data[i].MobileLogin).graphics[1].setGeometry(new Point( projLatLong[0]*3.28084,projLatLong[1]*3.28084,srProj));
			  map.getLayer(data[i].MobileLogin).graphics[1].symbol.setText(data[i].MobileLogin+"-"+data[i].TimeCreated.substring(11,19)+" ("+data[i].Speed+")");	
			  map.getLayer(data[i].MobileLogin).redraw();
		  }			    
	  }	
  }
  //function to update car status
  function updateCarStatus(cars){
	  var def = new Deferred();
	  for (var car in cars){	
		  if (cars.hasOwnProperty(car)){
			  var available = cars[car]["available"];
			  var ocanum = cars[car]["ocanum"];
			  if(map.getLayer(car).graphics[0].attributes["ocanum"]!=ocanum && map.getLayer(car).graphics[0].attributes["ocanum"]!=available){
				  //console.log("updating car status: "+ car)
				  map.getLayer(car).graphics[0].attributes["available"]=available;
				  map.getLayer(car).graphics[0].attributes["ocanum"]=ocanum;
				  map.getLayer(car).graphics[0].attributes["unitInfo"]=cars[car]["unitInfo"];;
				  setCarSymbol(car);
			  }
			  else{
				  setCarSymbol(car);
			  }
		  }
	  }
	  setTimeout(function(){
		  def.resolve("done!")
	  },800)
	  return def.promise;
  }
//turn on and office geolocated incidents
  function toggleCADIncidents(boolean){
	  for(var i = 0;i<incidentListMaster.length;i++){
		  try{
			  if(boolean){
				  
				  map.getLayer(incidentListMaster[i]).show();  
			  }
			  else{
				  map.getLayer(incidentListMaster[i]).hide();  
			  }
		  }
		  catch(e){
			  console.log("gl doesn't exist")
		  }		
	  }	  
  }
  
  
  
  dijit.byId("cadIncidentsCB").on("change",function(evt){
	  navToolbar.activate(Navigation.PAN);
	  toggleCADIncidents(evt);	  
  });
  
 //function add incidents to map
  function addCADIncident(ocaNum,incidentObject){
	  //console.log(incidentObject)
	  //console.log("added incident "+ocaNum)
	  var tempGL = new GraphicsLayer({id:ocaNum});
	  var textLabel= new TextSymbol().setColor(new Color('#000000')).setHaloColor(new Color('#ffffff')).setHaloSize(2.5) 
	  textLabel.setOffset(0,20);
	  textLabel.font.setSize("8pt");         
	  textLabel.font.setFamily("Roboto");
	  textLabel.font.setWeight(Font.WEIGHT_BOLD);
	  textLabel.setText(ocaNum)
	  var city = incidentObject["city"];
	  var address = incidentObject["address"];
	  address = address.replace(" & "," AND ");
	  address = address.replace(" // "," & ");
	  var cars = incidentObject["cars"]
	  var locateOptions = {"Street": address,"City": city };
	  geolocator.addressToLocations({"address":locateOptions,"maxLocations":1}, function(result){
		if(result.length>0){ 
		  tempGL.add(new Graphic(result[0].location,emsLoc,{ocanum:ocaNum, address:address+", "+city,cars:cars}));
		  tempGL.add(new Graphic(result[0].location,textLabel));
		  map.addLayer(tempGL); 
		  if(dijit.byId("cadIncidentsCB").get("checked")){
			  tempGL.show();
		  }
		  else{
			  tempGL.hide();
		  }
		} 
		else{
			console.log("couldn't locate "+ ocaNum)
		}
		 
		  
	  });
	  tempGL.on("dbl-click",function(evt){
		  dijit.byId("addressRouteSearch").set("disabled",true);
		  dijit.byId("stIntRouteSearch").set("disabled",true);
		  incidentLocGL.clear();
		  if(incidentLocGL.graphics.length==1){
			  incidentLocGL.graphics[0].setGeometry(evt.graphic.geometry);
			  getNearestCar();
		  }
		  else{
			  incidentLocGL.add(new Graphic(evt.graphic.geometry,incidentLocSymbol))
			  getNearestCar();
		  }		  	  
	  });
	  
	  var addQuery = new Query();
	  addQuery.returnGeometry = true;
	  addQuery.where = "ADDRESS_FULL LIKE '" + address+ "' and "+"COMMUNITY LIKE '"+ city+"'" ;
	  addQuery.outFields = ["ADDRESS_FULL", "PIN", "ZIP"];
  }
  //array that stores all the incidents, which changes based on websocket updates
  var incidentListMaster = [];
  var clientStartup=true;
  
  //populates the call information when a incident is selected from drop down
  function populateCallInfo(incidentNumber){
	  map.centerAt(map.getLayer(incidentNumber).graphics[0].geometry).then(function(){map.setScale(12000)});
	  domConstruct.empty("unitCallInfo");
	  var types=["dis","enr","lef","ons","rem","arr"];
	  var cars = map.getLayer(incidentNumber).graphics[0].attributes.cars;
	  var address=map.getLayer(incidentNumber).graphics[0].attributes.address;
	  dojo.place("<div style='margin-top:3vh;' id='unitInfo"+address+"'</div>", "unitCallInfo");
		dom.byId("unitInfo"+address).innerHTML += "<b>ADDRESS</b>"+": "+address+"<br>"
	  for(var i=0; i<cars.length;i++){
		var unitInfo = map.getLayer(cars[i]).graphics[0].attributes.unitInfo;		
		dojo.place("<div style='margin-top:2vh;' id='unitInfo"+cars[i]+"'</div>", "unitCallInfo");
		dom.byId("unitInfo"+cars[i]).innerHTML += "<b>UNIT</b>"+": "+cars[i]+"<br>"
		for(infoType in unitInfo){
			if(types.indexOf(infoType)>-1){
				dom.byId("unitInfo"+cars[i]).innerHTML += "<b>"+infoType.toUpperCase()+"</b>: "+unitInfo[infoType]+"<br>";
			}
		}
	  }	  
  }
  dijit.byId("callInfoSelect").on("change",function(select){
	 populateCallInfo(select);
  });

  //updates the running master list of incidents
  function updateIncidentInfo(incidents){	  
	  if(clientStartup){
		  for(incident in incidents){
			  if (incidents.hasOwnProperty(incident)){
				  incidentListMaster.push(incident);
				  addCADIncident(incident,incidents[incident]);
				  dijit.byId("callInfoSelect").addOption({value:incident, label:incident});
			  }
		  }
		  clientStartup=false;				 
	  }
	  else{
		  var incidentListTest = []
		  //create test list
		  for (var incident in incidents){
			  if (incidents.hasOwnProperty(incident)){
				  incidentListTest.push(incident);	        
			  }
		  }
		  //delete completed incidents from master list
		  for(var i=0;i<incidentListMaster.length;i++){
			  if(incidentListTest.indexOf(incidentListMaster[i])==-1){
				  try{
					  console.log("removed incident "+incidentListMaster[i])
					  map.removeLayer(map.getLayer(incidentListMaster[i]));
					  dijit.byId("callInfoSelect").removeOption({value:incidentListMaster[i]});
				  }
				 
				  catch(e){
					  //incident was not mapped from geocoding
					  console.log(e)
				  }
				  incidentListMaster.splice(i,1);
				  console.log(incidentListMaster)
			  }			  	
		  }
		  //add new incidents to master lists
		  for(incident in incidentListTest){
			  if(incidentListMaster.indexOf(incidentListTest[incident])==-1){
				  incidentListMaster.push(incidentListTest[incident]);
				  addCADIncident(incidentListTest[incident],incidents[incidentListTest[incident]]);
				  dijit.byId("callInfoSelect").addOption({value:incidentListTest[incident], label:incidentListTest[incident]});
			  }			  	
		  }
	  }
  }
   //can turn on and off live stream via check box
   dijit.byId("dispatchCB").on("change",function(evt){
	navToolbar.activate(Navigation.PAN);
	if(dijit.byId("dispatchCB").checked){
		createSocket();
		dispatchTimer.start();
	}
	else{
		resetAllCars();
		dispatchTimer.stop()
		socket.close()
	}	  
});
  //handles opening the websocket connection, socket will automatically start only after a cookie has been created and the car GLS have been created
  var wsTimer = new dojox.timing.Timer(3000);
  wsTimer.onTick = function(){
	  createSocket();
  }
  function createSocket(){
	  socket = socketio("websocket url", {transports: ['websocket',"polling"]})
	  socket.on("connect",function(evt){
		  console.log("socket opened");
		  wsTimer.stop();
	  });
	  socket.on("message", function(result){
		  try{
			  //console.log(result)
			  var jsonResult =JSON.parse(result);
			  if(jsonResult.dataType=="avl"){	
				  updateCarLocation(jsonResult.data);
			  }
			  else if(jsonResult.dataType=="incidents"){
				  updateIncidentInfo(jsonResult.data);
			  }
			  else if(jsonResult.dataType=="carStatus"){
				  updateCarStatus(jsonResult.data);
			  }
		  }
		  catch(e){
			  console.log(e);
		  }	
	  });

	  socket.on("error",function(){
		  if(dijit.byId("dispatchCB").set("checked",true)){
			  wsTimer.start();
			  alert("AVL/CAD Stream has been reset, attempting to reconnect.");
		  }	;

	  });
  }

  
  ///Print Stuff Starts here

	var print = new Button({
		id:"print",
		label:"Print PDF"
	},"print").startup();


	var templateSelect = new Select({
		id:"templateSelect",
		options:[
		         {value:"Layout_Portrait_sizeA_103_EMS",label:"8.5x11 Portrait"},
		         {value:"Layout_Landscape_sizeA_103_EMS",label:"8.5x11 Landscape"}]
	},"templateSelect");
	
	var pdfTitleTB = new TextBox({id:"pdfTitleTB"},"pdfTitleTB");
	var pTask = new PrintTask("print task endpoint",{async:true});
	dijit.byId("print").on("click",function(){
		
		dijit.byId("print").set("label","Printing...");
		dijit.byId("print").disabled=true;

		//for some reason setting the parameters below for both print parameters and print template does not work if setting 
		//in the constructor. It works if I parse it out after initializing the variables.
		var template = new PrintTemplate();
		template.layout=templateSelect.value;
		var scaleText='';
		if(map.getScale()<15840){
			scaleText="1 inch = "+(map.getScale()/12).toFixed(0).toString()+" feet"
		}
		else{
			scaleText="1 inch = "+(map.getScale()/63360).toFixed(2).toString()+" miles"
		}
		template.preserveScale = true;
		template.exportOptions = {
				dpi: 275
		};
		template.layoutOptions={
				customTextElements:[
				{"scaletext":scaleText},
				{"mapTitle":dijit.byId("pdfTitleTB").value}]}; 
		template.format = "PDF";
		template.outScale = map.getScale();
		var params = new PrintParameters();
		params.map=map;
		params.template=template;

		pTask.execute(params);
		pTask.on("complete", function(result){
			var url = result.result.url;
			window.open(url.toString(), "_blank");
			dijit.byId("print").disabled=false;
			dijit.byId("print").set("label","Print PDF");
		});
		pTask.on("error", function(result){
			dijit.byId("print").disabled=false;
			dijit.byId("print").set("label","Print PDF");
			console.log(result)
			alert("Printing Error!")
		});
	    
	});
	
	var screenshotButton = new Button({id:"screenshotButton",label:"Screenshot (JPG, Map Only)",style:"margin-top:1vh;"},"screenshotButton");
	screenshotButton.on("click",function(){
		var template = new PrintTemplate();
		template.preserveScale = true;
		;
		template.exportOptions = {
				width:1200,
				height:650,
				dpi:100
		};
		//template.outScale=map.getScale();
		template.format = "jpg";
		template.layout = "MAP_ONLY";;
		var params = new PrintParameters();
		params.map=map;
		params.template=template;
		params.outSpatialReference = srProj;
		console.log(params)
		pTask.execute(params);
		pTask.on("complete", function(result){
			var url = result.result.url;
			window.open(url.toString(), "_blank");
		});
		pTask.on("error", function(result){
			console.log(result)
			alert("Printing Error!")
		});
	});
  
  
  
  
  function parseDateString(dateString){
	  var temp = dateString.replace("/",",");
	  temp = temp.replace("/",",");
	  temp = temp.replace(" ",",")
	  temp = temp.replace(":",",");
	  temp = temp.replace(":",",");
	  temp = temp.split(",")
	  var ms = 0;
	  var date = new Date(parseInt(temp[2]),parseInt(temp[0]),parseInt(temp[1]),parseInt(temp[3]),parseInt(temp[4]),parseInt(temp[5]),ms)
	  var date = dojoDate.add(date,"hour",-4)
	  console.log(date)
	  return date
  }
});
