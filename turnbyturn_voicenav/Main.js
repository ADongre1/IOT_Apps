mobileMap= ''
	require(["dojox/mobile/Button","dijit/Dialog","dojo/Deferred","esri/SpatialReference","esri/IdentityManager","dojo/on","dojo/dom-construct",
	         "dojo/dom-style","dojox/mobile/ScrollablePane",
	         "dojo/store/Memory","map/map","nav/mobile_nav","esri/tasks/query","esri/tasks/QueryTask","dojo/dom",
	         'dojox/mobile/Heading','dojox/mobile/ToolBarButton', "esri/layers/ArcGISDynamicMapServiceLayer","esri/geometry/Polyline","esri/geometry/Point",
	         'dojox/mobile/RoundRectList','dojox/mobile/ListItem',"dojo/parser",'dojox/mobile/ContentPane',"esri/geometry/geometryEngine","dojo/domReady!"],
	         function(Button,Dialog,Deferred,SpatialReference,esriID,on,domConstruct,domStyle,ScrollablePane,Memory,Map,Nav,Query,QueryTask,dom,Heading,ToolBarButton,
	        		 ArcGISDynamicMapServiceLayer,Polyline,Point,RoundRectList,ListItem,parser,ContentPane,gEngine){
		
		//Depot information for each route, easier to store in client memory.
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
		var disclaimerText = "disclaimer text";
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
		domConstruct.place("<p>",disclaimerDialog.domNode)
		disclaimerDialog.startup();		
		disclaimerDialog.show();
		domStyle.set(dom.byId("disclaimerDialog"),"top","5vh");
	
		esriID.on("dialog-cancel",function(){
			alert("Access Denied.");
			setTimeout(function(){ window.location.href = "https://gis.catawbacountync.gov"; }, 0);		
		});
	
		//preloads domain prefix for login
		try{
			var time = new Date().getTime();

			if(localStorage.getItem("") && JSON.parse(localStorage.getItem("")).credentials[0].expires>time){
				esriID.initialize(JSON.parse(localStorage.getItem("")));
			}
			else{
				var timer = new dojox.timing.Timer(100);
				timer.onTick = function(){
					try{
						esriIdHeight = domStyle.get(dom.byId("dijit_Dialog_0"),"height");

						dijit.byId("dijit_form_ValidationTextBox_0").set("value","")			
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
		var mowService = new ArcGISDynamicMapServiceLayer("mow_server",{id:"mowService"})

		//sets cookies
		mowService.on("load",function(){
			esriID.getCredential("meals on wheel map service for map display").then(function(cred){

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
	
		
		//query task to grab and process clients
		var clientsQueryTask = new QueryTask('client rest end point')

		//directions/navigation view header
		var directionsHeader = new Heading({id:"directionsHeader",label:"Directions", fixed:"top",back:"Clients",moveTo:"clientsListView"},"directionsHeader");
		on(dom.byId("directionsHeader"),"click",function(){
			//center on destination when the header is clicked or tapped
			mobileMap.map.centerAt(mobileMap.map.getLayer("destGL").graphics[0].geometry).then(function(){
				mobileMap.map.setScale(1200);
			});
		});
		//sets client list header
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

		//sets the list  type in the client list view
		var clientList = new RoundRectList({
			id:'clientList',
			transition:'slide',
			select:'single',		
		},"clientList").startup();
		//memory for storing client info
		var clientMemory = new Memory();	

		//list of routes
		var routeList = ["list","of","routes"];


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
					//parse out street name from the geocoded address
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
					//create the client list item
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
							//set map to only show addresses on the same street and the depot that belongs to the route
							mobileMap.map.getLayer("Basemap").setLayerDefinitions(["STREET_COMP LIKE '"+this.clientInfo.streetName+"'",null,null,null,null,null,null,null,null]);
							mobileMap.map.getLayer("Depots").setLayerDefinitions([null,"ABBR LIKE "+depotInfo[this.clientInfo.route]["abbr"],null,null,null,null,null,null,null,null,null,null,null,null
							                                                       ,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]);
						}			
					},"client_"+i.toString());
					clientMemory.add({id:i,listItem:listItem,route:clientRoute});
				}
				//finally set the route list visibility after clients have been processed
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
	});
