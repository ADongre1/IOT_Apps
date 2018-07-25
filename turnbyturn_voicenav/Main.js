mobileMap= ''
	require(["nav/NoSleep.min","dojox/mobile/Button","dijit/Dialog","dojo/Deferred","esri/SpatialReference","esri/IdentityManager","dojo/on","dojo/dom-construct",
	         "dojo/dom-style","dojox/mobile/ScrollablePane",
	         "dojo/store/Memory","map/map","nav/mobile_nav","esri/tasks/query","esri/tasks/QueryTask","dojo/dom",
	         'dojox/mobile/Heading','dojox/mobile/ToolBarButton', "esri/layers/ArcGISDynamicMapServiceLayer","esri/geometry/Polyline","esri/geometry/Point",
	         'dojox/mobile/RoundRectList','dojox/mobile/ListItem',"dojo/parser",'dojox/mobile/ContentPane',"esri/geometry/geometryEngine","dojo/domReady!"],
	         function(NoSleep,Button,Dialog,Deferred,SpatialReference,esriID,on,domConstruct,domStyle,ScrollablePane,Memory,Map,Nav,Query,QueryTask,dom,Heading,ToolBarButton,
	        		 ArcGISDynamicMapServiceLayer,Polyline,Point,RoundRectList,ListItem,parser,ContentPane,gEngine){
		var depotInfo = {
				"CAT":{	name:"Hopewell Methodist Church",	geometry:new Point([1396745,690930],srProj),"abbr":"'HMC'",	streetName:"HOPEWELL CHURCH RD",address:"2211 HOPEWELL CHURCH RD"},
				"CATSF":{name:"Mt Pleasant United Methodist Church",geometry:new Point([1396961,672079],srProj),"abbr":"'MtPUMC'",streetName:"MT PLEASANT RD",address:"4136 MT PLEASANT RD"},				
				"CLCAT":{name:"Hopewell Methodist Church",geometry:new Point([1396745,690930],srProj),streetName:"HOPEWELL CHURCH RD","abbr":"'HMC'",address:"2211 HOPEWELL CHURCH RD"},
				"COOKV":{name:"Ebenezer United Methodist Church",	geometry:new Point([1263221,680323],srProj),"abbr":"'EUMC'",streetName:"COOKSVILLE RD", address: "8840 COOKSVILLE RD"},
				"EH1":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
				"EH2":{name:"Huntington Hills Church of God",	geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
				"EH3":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "EH4":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "EH5":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "EH6":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "EH7":{	name:"Huntington Hills Church of God",geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "EHV":{name:"Huntington Hills Church of God",	geometry:new Point([1310901,738798],srProj),"abbr":"'HHCG'",streetName:"5TH ST NE",address:"2123 5TH ST NE"},
	            "HWY16S":{name:"Mtn View Baptist Church",geometry:new Point([1380313,664700],srProj),"abbr":"'MtnVBC'",streetName:"RIVER RD",address:"4266 RIVER RD"},
	            "MA1":{	name:"Maiden Community Center",geometry:new Point([1343417,672417],srProj),"abbr":"'MCC'",streetName:"E KLUTZ ST", address:"207 E KLUTZ ST"	},
	            "MA3":{	name:"Maiden Community Center",geometry:new Point([1343417,672417],srProj),"abbr":"'MCC'",streetName:"E KLUTZ ST", address:"207 E KLUTZ ST"	},
	            "NEW1":{name:"Newton First Presbyterian Church",geometry:new Point([1340400,705831],srProj),"abbr":"'NFPC'",streetName:"N MAIN AVE",address:"701 N MAIN AVE"},
	            "NEW2":{name:"Newton First Presbyterian Church",geometry:new Point([1340400,705831],srProj),"abbr":"'NFPC'",streetName:"N MAIN AVE",address:"701 N MAIN AVE"},
	            "NEW3":{name:"Newton First Presbyterian Church",geometry:new Point([1340400,705831],srProj),"abbr":"'NFPC'",streetName:"N MAIN AVE",address:"701 N MAIN AVE"},
	            "NEW4":{name:"Newton First Presbyterian Church",geometry:new Point([1340400,705831],srProj),"abbr":"'NFPC'",streetName:"N MAIN AVE",address:"701 N MAIN AVE"},
	            "NEW5":{name:"Senior Nutrition Services",	geometry:new Point([1338698,715451],srProj),"abbr":"'SNS'",streetName:"BOUNDARY ST",address:"507 BOUNDARY ST"},
	            "NewHV":{name:"Senior Nutrition Services",geometry:new Point([1338698,715451],srProj),"abbr":"'SNS'",streetName:"BOUNDARY ST",address:"507 BOUNDARY ST"},
	            "SNSCON":{name:"Senior Nutrition Services",geometry:new Point([1338698,715451],srProj),"abbr":"'SNS'",streetName:"BOUNDARY ST",address:"507 BOUNDARY ST"},
	            "WH1":{name:"WH Senior Center",geometry:new Point([1297047,727805],srProj),"abbr":"'WHSC'",streetName:"17TH ST SW", address:"400 17TH ST SW"},
	            "WH2":{name:"WH Senior Center",geometry:new Point([1297047,727805],srProj),"abbr":"'WHSC'",streetName:"17TH ST SW", address:"400 17TH ST SW"},
	            "WH3":{name:"WH Senior Center",geometry:new Point([1297047,727805],srProj),"abbr":"'WHSC'",streetName:"17TH ST SW", address:"400 17TH ST SW"},
	            "WH4":{	name:"WH Senior Center",geometry:new Point([1297047,727805],srProj),"abbr":"'WHSC'",streetName:"17TH ST SW", address:"400 17TH ST SW"},
	             "WH5-MtnV":{name:"Marketplace Church",geometry:new Point([1297506,713015],srProj),"abbr":"'MC'",streetName:"S NC 127 HWY", address:"2936 S NC 127 HWY"},
	             "WHVale-MtnV":{name:"Marketplace Church",geometry:new Point([1297506,713015],srProj),"abbr":"'MC'",streetName:"S NC 127 HWY", address:"2936 S NC 127 HWY"}};
		parser.parse();
		var esriIdHeight='';
		var disclaimerText = "<font size='3'><b>Tips:</b> Disable sleep and screen lock to allow uninterrupted navigation. Ensure the URL starts with https for " +
				"geolocation to work correctly. iPhone users may have to enable geolocation for their browser in the phone settings window. Initially loading the website " +
				"over wifi will reduce the amount of data transferred over your cellular data plan. Tap the map once to zoom to your location. Double tap to zoom to the full " +
				"route. Tap the client name at the top to zoom to the client's location. Bookmark this page for easier navigation!" +
				"<p><b>Disclaimer:</b> This application is intended to help navigate Meals On Wheels volunteers to client delivery locations within Catawba County. " +
				"It is intended as a additional guide to help navigate Catawba County roads, not to replace personal judgement when operating a vehicle and navigating roadways. " +
				"You agree to follow all traffic laws when using this application. Catawba County has made every effort to provide the most efficient route " +
				"between you and the selected client, but is not responsible for inaccuracies due to changes in road conditions, such as temporary closures. " +
				"The County is also not responsible for inaccuracies due to issues arising from GPS accuracy on your mobile device. Catawba County has also made every effort to minimize " +
				"data usage when using the application. Data usage is needed to load the website, log in, calculate routes, and zoom to the initial route map extent, about 4.6mb of data. " +
				"Any additional interaction with the map by the user will result in additional data usage. Catawba County is not liable for data surcharges incurred " +
				"from using this application. Thank you for being a Meals On Wheels Volunteer, we couldn't do this without you!<p></font>";
		var disclaimerDialog = new Dialog({id:"disclaimerDialog",
			title:"CATAWBA COUNTY DISCLAIMER AND TERMS OF AGREEMENT",
			closable:false,
			style:"font-size:10pt;",
			content:disclaimerText});
		disclaimerDialog.placeAt(document.body);
		var disclaimAcceptButton = new Button({id:"disclaimAcceptButton",
			label:"Accept",
			style:"margin-bottom:5vh;",
			onClick:function(){disclaimerDialog.destroy()}
		},"disclaimAcceptButton");
		disclaimerDialog.addChild(disclaimAcceptButton);
		//domConstruct.place("<p>",disclaimerDialog.domNode)
		//disclaimerDialog.startup();		
		//disclaimerDialog.show();
		domStyle.set(dom.byId("disclaimerDialog"),"top","5vh");
	
		esriID.on("dialog-cancel",function(){
			alert("Access Denied.");
			setTimeout(function(){ window.location.href = "https://gis.catawbacountync.gov"; }, 0);		
		});
		var noSleep = new NoSleep();	

		try{
			var time = new Date().getTime();

			if(localStorage.getItem("catcoMOW") && JSON.parse(localStorage.getItem("catcoMOW")).credentials[0].expires>time){
				esriID.initialize(JSON.parse(localStorage.getItem("catcoMOW")));
			}
			else{
				var timer = new dojox.timing.Timer(100);
				timer.onTick = function(){
					try{
						esriIdHeight = domStyle.get(dom.byId("dijit_Dialog_0"),"height");

						dijit.byId("dijit_form_ValidationTextBox_0").set("value","cocat\\MOWvol")			
						domStyle.set(dom.byId("dijit_Dialog_0"),"top","0");
						
						timer.stop();
						timer = null;
					}
					catch(e){}
				}
				timer.start();
				timer.onStop= function(){
					dijit.byId("dijit_Dialog_0").on("click",function(){				
						domStyle.set(dom.byId("dijit_Dialog_0"),"height",esriIdHeight.toString()+"px");
						domStyle.set(dom.byId("dijit_Dialog_0"),"top","0");
					});
				}
			}
		}
		catch(e){
			console.log(e);		
		}
		var srProj= new SpatialReference(102719);
		//Map() references the map module not ESRI MAP
		mobileMap = new Map();
		var mowService = new ArcGISDynamicMapServiceLayer("https://arcgis2.catawbacountync.gov/arcgis/rest/services/DSS/MOW/MapServer",{id:"mowService"})
		mowService.on("load",function(){
			esriID.getCredential("https://arcgis2.catawbacountync.gov/arcgis/rest/services/DSS/MOW/MapServer").then(function(cred){

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
				localStorage.setItem("catcoMOW", JSON.stringify(cred));
			});	
		});
		mobileMap.map.setScale(4200)
		var nav = new Nav();		
	
		

		var clientsQueryTask = new QueryTask('https://arcgis2.catawbacountync.gov/arcgis/rest/services/DSS/MOW/MapServer/30')
		var directionsHeader = new Heading({id:"directionsHeader",label:"Directions", fixed:"top",back:"Clients",moveTo:"clientsListView"},"directionsHeader");
		on(dom.byId("directionsHeader"),"click",function(){
			mobileMap.map.centerAt(mobileMap.map.getLayer("destGL").graphics[0].geometry).then(function(){
				mobileMap.map.setScale(1200);
			});
		});
		var clientsHeader = new Heading({id:"clientsHeader",label:"Clients", fixed:"top",back:"Routes",moveTo:"#routeListView"},"clientsHeader");
		var routeList = new RoundRectList({
			id:'routeList',
			transition:'slide',
			select:'single'
		},"routeList");
		//hide route list until clients are handles
		domStyle.set(routeList.domNode,"visibility","hidden")
		//set the map height 
		domStyle.set(dijit.byId("mapCP").domNode,"height","60vh")

		var clientList = new RoundRectList({
			id:'clientList',
			transition:'slide',
			select:'single',		
		},"clientList").startup();

		var clientMemory = new Memory();	


		var routeList = ["CAT","CATSF","CLCAT","COOKV","EH1","EH2","EH3",
		                 "EH4","EH5","EH6","EH7","EHV","HWY16S","MA1","MA3","NEW1","NEW2",
		                 "NEW3","NEW4","NEW5","NewHV","SNSCON","WH1","WH2","WH3","WH4",
		                 "WH5-MtnV","WHVale-MtnV"];


		//build route list
		for(var i=0; i<routeList.length;i++){
			var listItem = new ListItem({
				id:routeList[i],
				rightText:routeList[i],
				moveTo:'#clientsListView',
				transition:'slide',
			},routeList[i]);
			dijit.byId('routeList').addChild(listItem);				
		}	

		var selectedClient = {};

		//grab the route name to create the client list. Depending on where you tap, you get a different dom element.
		dijit.byId("routeListView").on("click",function(e){	
			if(e.target.className =="mblListItemLabel"){
				buildRouteClientList(e.target.parentElement.id)
			}
			else if(e.target.className==="mblListItemRightText"){
				buildRouteClientList(e.target.innerText)
			}
			else{
				buildRouteClientList(e.target.id)
			}	
		});

		//restart navigation when reset button pressed
		dijit.byId("refreshButton").on("click",function(){
			window.directions='';
			nav.synth.cancel();
			//nav.timer.stop();
			nav.clearWatchLocation();
			nav.startNavigation({name:selectedClient.name,geometry:selectedClient.geometry,address:selectedClient.address});		
		});



		//do stuff when back button on the direction view to go back to client list
		dijit.byId("dojox_mobile_ToolBarButton_0").on("click",function(){
			nav.synth.cancel();
			window.directions='';
			nav.clearWatchLocation();
			noSleep.disable();
		});

		//remove all the clients from the client list when moving back to routes page for loading new clients
		dijit.byId("dojox_mobile_ToolBarButton_1").on("click",function(e){
			dijit.byId("siteLocation").destroyRecursive();
			domConstruct.empty("clientList");
			
		});

		//get clients on startup, create list items for each, put in memory, and set route list visible
		(function getClients(){

			var clientsQuery = mobileMap.Query();
			clientsQuery.where = "1=1";
			clientsQuery.outFields=['*'];
			clientsQuery.returnGeometry = true;
			clientsQueryTask.execute(clientsQuery,function(result){					
				var clients = result.features
				for(var i=0; i<clients.length;i++){
					var clientName = clients[i].attributes.Name;
					var clientRoute = clients[i].attributes.Route;
					var clientObjectID = clients[i].attributes.ObjectID;
					var clientStreet = clients[i].attributes.Match_addr;
					var clientGeometry = clients[i].geometry;
					var streetArray=clientStreet.split(",")[0];
					streetArray = streetArray.split(" ");
					var address= clientStreet.substring(0, clientStreet.length - 7);
					var streetName = '';
					for(var x = 1;x<streetArray.length;x++){
						if(x==streetArray.length-1){
							streetName += streetArray[x];
						}
						else{
							streetName += streetArray[x]+" ";
						}					
					}
					var listItem = new ListItem({
						id:"client_"+i.toString(),
						rightText:clientName,
						moveTo:'#directionsView',
						clientInfo:{name:clientName,
							streetName:streetName,
							geometry:clientGeometry,
							address:address,
							route:clientRoute,
						},				
						transition:'slide',
						onClick:function(e){
							selectedClient = this.clientInfo;
							nav.startNavigation({name:selectedClient.name,geometry:selectedClient.geometry,address:selectedClient.address});
							dijit.byId("directionsHeader").set("label",this.clientInfo.name);
							mobileMap.map.getLayer("Basemap").setLayerDefinitions(["STREET_COMP LIKE '"+this.clientInfo.streetName+"'",null,null,null,null,null,null,null,null]);
							mobileMap.map.getLayer("Depots").setLayerDefinitions([null,"ABBR LIKE "+depotInfo[this.clientInfo.route]["abbr"],null,null,null,null,null,null,null,null,null,null,null,null
							                                                       ,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]);
						}			
					},"client_"+i.toString());
					clientMemory.add({id:i,listItem:listItem,route:clientRoute});
				}
				domStyle.set(dijit.byId("routeList").domNode,"visibility","visible");				
			});	

		})();

		//build client list when a route is selected
		function buildRouteClientList(route){
			var selectedClients=clientMemory.query({'route':route});
			clientsHeader.set("label",route)
			for(var i=0; i<selectedClients.length;i++){	
				dijit.byId('clientList').addChild(selectedClients[i].listItem);
				selectedClients[i].listItem.resize();
			}
			//add the site location to the client list for navigation
			dijit.byId('clientList').addChild( 
					new ListItem(
					{id: "siteLocation",
						rightText:depotInfo[route].name,
						moveTo:"#directionsView",
						transition:"slide",
						clientInfo:{
							name:depotInfo[route].name,
							address:depotInfo[route].address,
							streetName:depotInfo[route].streetName,
							geometry:depotInfo[route].geometry,
							route:route},
						onClick:function(){
							selectedClient = this.clientInfo;
							nav.startNavigation({name:selectedClient.name,geometry:selectedClient.geometry,address:selectedClient.address});
							dijit.byId("directionsHeader").set("label",this.clientInfo.name);
							dijit.byId("directionsHeader").set("label",this.clientInfo.name);
							noSleep.enable();
						}
				
						},"siteLocation"));
			
		}
// dont need this anymore because we are getting it directly for the route_geocode feature class directly.
//		//this sets the destination point for routing near the centerline for the address, but just offset on the side of the house
//		function getPointOnStreet(selectedClient){
//			//first check to see if the client overlaps any of the polygons in the routing parcels layer
//			//if it does, then just set a geometry bound for selecting the streets
//			//if not then we want to grab streets with the address street name.
//			var deferred = new Deferred();
//			var streetName=selectedClient.streetName.toUpperCase();			
//			var coords = '';
//			var routeParcelQuery= mobileMap.Query();
//			routeParcelQuery.geometry=selectedClient.geometry
//			routeParcelQuery.returnGeometry=true;
//			routeParcelQuery.spatialRelationship=Query.SPATIAL_REL_INTERSECTS;
//			mobileMap.routeParcelQueryTask.execute(routeParcelQuery,function(parcels){
//				var streetQuery = mobileMap.Query();				
//				streetQuery.returnGeometry = true
//				streetQuery.outFields = ["STREET_COMP"];
//				if(parcels.features.length>=1){
//					streetQuery.geometry= parcels.features[0].geometry;
//					streetQuery.spatialRelationship=Query.SPATIAL_REL_INTERSECTS;
//				}
//				else{
//					streetQuery.where = "STREET_COMP LIKE '" + streetName +"'";
//				}
//				mobileMap.clQueryTask.execute(streetQuery,function(streets){
//					//console.log(streets)
//					//create an empty polyline
//					var polyline = new Polyline();
//					polyline.setSpatialReference(srProj);
//					//add all the paths from all the street result features (may not be contiguous) to the single polyline
//					for(var z =0;z<streets.features.length;z++){
//						for(var n=0;n<streets.features[z].geometry.paths.length;n++){
//							polyline.addPath(streets.features[z].geometry.paths[n]);
//						}				
//					}
//					//find the nearest coordinate along the entire path set in the polyline to the client address
//					var nearestCoord = gEngine.nearestCoordinate(polyline,selectedClient.geometry);
//					//set the new address position closer to the centerline along that distance between cl and add pt
//					// I have now put the new add pt 90% of the way from the actual add pt loc to the centerline so
//					// that the navigation knows which side of the street the house is on
//					if(!nearestCoord.coordinate){
//						console.log(nearestCoord.coordinate)
//						console.log(clientName)
//					}
//					else{
//						var addCoordX = selectedClient.geometry.x;
//						var addCoordY = selectedClient.geometry.y;					
//						var stCoordX = nearestCoord.coordinate.x;
//						var stCoordY = nearestCoord.coordinate.y;					
//						var newX = ((stCoordX - addCoordX)*0.9)+addCoordX;
//						var newY = ((stCoordY - addCoordY)*0.9)+addCoordY;
//						coords = new Point(newX,newY, srProj);				
//					}
//				});
//			});		
//			setTimeout(function(){				
//				deferred.resolve({name:selectedClient.name,geometry:coords,address:selectedClient.address});
//			}, 1200);
//			return deferred.promise;
//		}				
	});

//	function returnDepotAbbr(routeAbbr){
//		var depots = {
//				"CAT":"'HMC'",
//				"CLCAT":"'CAT'",
//				"COOKV":"'EUMC'",			
//				"EH1":"'HHCG'",
//				"EH2":"'HHCG'",
//				"EH3":"'HHCG'",
//				"EH4":"'HHCG'",
//				"EH5":"'HHCG'",
//				"EH6":"'HHCG'",
//				"EH7":"'HHCG'",
//				"EHV":"'HHCG'",
//				"HWY16S":"'MtnVBC'",
//				"CATSF":"'MtPUMC'",
//				"MA1":"'MCC'",
//				"MA3":"'MCC'",
//				"NEW1":"'NFPC'",
//				"NEW2":"'NFPC'",
//				"NEW3":"'SNS'",
//				"NEW4":"'NFPC'",
//				"NEW5":"'SNS'",
//				"NEWHV":"'SNS'",
//				"SNSCON":"'SNS'",
//				"WHVale_MtnV":"'MC'",
//				"WH5_MtnV":"'MC'",
//				"WH1":"'WHSC'",
//				"WH2":"'WHSC'",
//				"WH3":"'WHSC'",
//				"WH4":"'WHSC'"
//		}
//		return depots[routeAbbr];		
//	}

	
