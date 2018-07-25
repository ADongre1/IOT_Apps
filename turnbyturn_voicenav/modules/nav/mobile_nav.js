//directions has to be a global variable to pass to the speak function in the index.html document
directions = '';
define(["esri/layers/FeatureLayer", "esri/tasks/query",
		"nav/fixNavigationString", "dojo/dom", "dojo/Deferred", "esri/tasks/FeatureSet", "dojo/_base/declare",
		"esri/SpatialReference", "esri/geometry/Point", "esri/geometry/Polygon",
		"dojo/on", "esri/tasks/RouteParameters",
		"esri/tasks/RouteTask", "esri/graphicsUtils",
		"esri/geometry/geometryEngine", "esri/Color", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol",
		"https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.3/proj4-src.js", "esri/graphic", "dojo/domReady!"
	],
	function (FeatureLayer, Query, fixString, dom, Deferred, FeatureSet, declare, SpatialReference, Point, Polygon,
		on, RouteParameters, RouteTask, graphicsUtils,
		gEngine, Color, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol, Proj4, Graphic) {
		return declare(null, {
			setProj4: function () {
				Proj4.defs('NCSP', '+proj=lcc +lat_1=34.33333333333334 +lat_2=36.16666666666666 +lat_0=33.75 +lon_0=-79 +x_0= 609601.22 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');
			},
			getLocation: function () {
				var deferred = new Deferred();
				//need to instantiate the location variable as an esri point first
				var location = ''
				var nearestAddress = {
					address: '',
					street: '',
					distance: 100000,
					lat: 0,
					long: 0
				};
				var nearestStVertex = {
					coordinate: '',
					distance: 10000
				};
				navigator.geolocation.getCurrentPosition(function (pos) {
					var projLoc = Proj4('NCSP', [pos.coords.longitude, pos.coords.latitude]);
					//automated start position for nancy josey testing
					//var projLoc = Proj4('NCSP',[-81.227059187,35.695139393]);
					location = [projLoc[0] * 3.28084, projLoc[1] * 3.28084];
					//set the phones current location as point
					location = new Point(location[0], location[1], new SpatialReference(102719));
					mobileMap.map.getLayer("carsGL").graphics[0].setGeometry(location);
					mobileMap.map.centerAt(location);
					//now first check to see if we are in one of the routing parcels to select centerlines by parcel boundary, if not then select based on nearest address
					//point street_comp
					var routeParcelQuery = mobileMap.Query();
					routeParcelQuery.geometry = location;
					routeParcelQuery.returnGeometry = true;
					routeParcelQuery.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					mobileMap.routeParcelQueryTask.execute(routeParcelQuery, function (parcels) {
						if (parcels.features.length >= 1) {
							var streetQuery = mobileMap.Query()
							streetQuery.geometry = parcels.features[0].geometry;
							streetQuery.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
							streetQuery.outFields = ["STREET_COMP"];
							streetQuery.returnGeometry = true;
							mobileMap.clQueryTask.execute(streetQuery, function (result) {
								var features = result.features;
								for (var x = 0; x < features.length; x++) {
									var tempCoord = gEngine.nearestCoordinate(features[x].geometry, location, new SpatialReference(102719));
									//console.log(nearestStCoord)
									if (tempCoord.distance < nearestStVertex.distance) {
										nearestStVertex = tempCoord;
									}
								}
								location = nearestStVertex.coordinate;
								//mobileMap.map.getLayer("carsGL").graphics[0].setGeometry(location);
							});
						} else {
							var query1 = mobileMap.Query()
							query1.geometry = location;
							query1.outFields = ['PIN'];
							query1.returnGeometry = false;
							//query parcels with only phone location to determine if car is inside a parcel or not		
							mobileMap.parcelQueryTask.execute(query1, function (result) {

								//if we do get a result, query  the address point lat/long
								if (result.features.length > 0) {
									var pin = result.features[0].attributes.PIN;
									var addQuery = mobileMap.Query();
									addQuery.where = "PIN LIKE '" + pin + "' AND ADDR_STATUS LIKE 'ACT'";
									addQuery.returnGeometry = true;
									addQuery.outFields = ["STREET_COMP", "ADDRESS_FULL"]
									mobileMap.addQueryTask.execute(addQuery, function (addResult) {
										for (var i = 0; i < addResult.features.length; i++) {
											//	get the address feature, convert to SP and then find the distance between 
											var address = addResult.features[i];
											//var addPt = Proj4('NCSP',[address.lng,address.lat]);
											//addPt = [addPt[0]*3.28084,addPt[1]*3.28084];
											var distance = gEngine.distance(address.geometry, location, "feet");
											//	I loop through all points because I want to find the address that is closest to phone location for that parcel
											if (distance < nearestAddress.distance) {
												nearestAddress = {
													address: address.attributes.ADDRESS_FULL,
													street: address.attributes.STREET_COMP,
													distance: distance
												}
											}
										}
										//	Then I grab all the street centerlines that match the address street and 
										// find the nearest point along all those streets to the selected address point
										//set the car start location to that centerline point for routing.
										//this is so that in case there is a big property where the car might physically be closer to a different street than 
										//what the driveway goes to, it will always route from the correct street.
										var query2 = mobileMap.Query()
										query2.where = "STREET_COMP LIKE'" + nearestAddress.street + "'";
										query2.geometry = null;
										query2.outFields = ["STREET_COMP"];
										query2.returnGeometry = true;
										mobileMap.clQueryTask.execute(query2, function (result) {
											var features = result.features;
											for (var x = 0; x < features.length; x++) {
												var tempCoord = gEngine.nearestCoordinate(features[x].geometry, location, new SpatialReference(102719));
												//console.log(nearestStCoord)
												if (tempCoord.distance < nearestStVertex.distance) {
													nearestStVertex = tempCoord;
												}
											}
											location = nearestStVertex.coordinate;
											//mobileMap.map.getLayer("carsGL").graphics[0].setGeometry(location);
										});
									}, function (e) {
										console.log(e)
									});
								}

							}, function (e) {
								console.log(e)
							});
						}
					});


				}, null, {
					enableHighAccuracy: true,
					maximumAge: 0,
					timeout: 1000
				});

				setTimeout(function () {
					deferred.resolve(location)
				}, 2000)

				return deferred.promise;
			},
			watchLocation: null,
			clearWatchLocation: function () {
				navigator.geolocation.clearWatch(this.watchLocation);
				console.log("cleared");
			},
			synth: window.speechSynthesis,
			startNavigation: function (clientObject) {
				mobileMap.map.getLayer('routeFL').clear();
				mobileMap.map.getLayer('routeFL').refresh();
				mobileMap.map.getLayer('fenceFL').clear();
				mobileMap.map.getLayer('fenceFL').refresh();
				mobileMap.map.getLayer('turnsGL').clear();
				mobileMap.map.getLayer('turnsGL').refresh();

				var mobileNav = this;
				mobileNav.synth = window.speechSynthesis;
				mobileNav.clientObject = clientObject;
				window.directions = "Calculating directions to " + clientObject.name +".";
				dom.byId("synthPane").innerHTML = "Calculating directions to " + clientObject.name + ".";
				this.setProj4();
				var srProj = new SpatialReference(102719);
				var rTask = new RouteTask('https://arcgis2.catawbacountync.gov/arcgis/rest/services/catawba/Centerlines_Network/NAServer/Route/')
				var routeFS = new FeatureSet();
				routeFS.geometryType = 'esriGeometryPoint';
				routeFS.spatialReference = srProj;
				var routeParams = new RouteParameters()
				routeParams.directionsLengthUnits = 'esriMiles';
				routeParams.directionsOutputType = 'complete';
				routeParams.impendanceAttribute = 'DriveTime';
				routeParams.returnDirections = true;
				routeParams.stops = routeFS;
				on(window, "unload", function () {
					mobileNav.synth.cancel()
				});
				this.getLocation().then(function (pos) {
					//move first emit down here because it wasn't firing above.
					on.emit(dom.byId("synthPane"), "click", {
						bubbles: true,
						cancelable: false,
					});
					var routeSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([26, 26, 255]), 4);
					var turnFences = {};
					var fencesCount = 1;
					var turnCount = 1;
					var directionsText = '';
					routeFS.features = [new Graphic(pos, null, null), new Graphic(clientObject.geometry, null, {
						name: clientObject.name
					})];
					rTask.solve(routeParams, function (result) {
							var directions = result.routeResults[0].directions.features;
							//set graphics in the map
							mobileMap.map.getLayer("destGL").graphics[0].setGeometry(clientObject.geometry);
							mobileMap.map.getLayer("destGL").graphics[1].setGeometry(new Point(clientObject.geometry.x, clientObject.geometry.y + 25, srProj));
							mobileMap.map.getLayer("destGL").graphics[1].symbol.setText(clientObject.address);
							var routePL = result.routeResults[0].route.geometry;
							mobileMap.map.getLayer('routeFL').applyEdits([new Graphic(routePL, routeSymbol, null)]);
							mobileMap.map.setExtent(graphicsUtils.graphicsExtent(mobileMap.map.getLayer('routeFL').graphics).expand(1.25), true);
							//set on click events for zooming map

							//create a new directions object that we write to below. we want the first two from the original so we hardcode them in.
							var newDirections = [{
									"text": directions[0]["attributes"]["text"],
									"geometry": directions[0]["geometry"],
									"length": directions[0]["attributes"]["length"]
								},
								{
									"text": directions[1]["attributes"]["text"],
									"geometry": directions[1]["geometry"],
									"length": directions[1]["attributes"]["length"]
								}
							];
							//if car is close enough to end location that there are only 2 directions (start and finish) then we want to handle it separately. 
							for (var i = 2; i < directions.length; i++) {

								if (directions[i]["attributes"]["text"].indexOf("Continue on") == 0 && directions[i]["attributes"]["maneuverType"] == "esriDMTStraight") {
									try {
										var len1 = newDirections[newDirections.length - 1]["length"];

										var len2 = directions[i].attributes["length"];

										var len3 = len1 + len2;

										newDirections[newDirections.length - 1]["length"] = len3;

										for (var y = 0; y < directions[i].geometry.paths.length; y++) {
											newDirections[newDirections.length - 1].geometry.addPath(directions[i].geometry.paths[y])
										}
									} catch (e) {
										console.log(e)
									}
								} else {
									newDirections.push({
										"text": directions[i]["attributes"]["text"],
										"geometry": directions[i]["geometry"],
										"length": directions[i].attributes["length"]
									});
									//console.log(newDirections)
								}
							}
							var aSFS = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
									new Color([255, 128, 0,0]), 2), new Color([170, 70, 190, 0]));
							var bSFS = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
									new Color([255, 128, 0,0]), 2), new Color([255, 128, 180, 0]));
							var cSFS = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
								new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
									new Color([255, 128, 0,0]), 2), new Color([80, 255, 0, 0]));
							//creating the list of turning directions and turn points after first set of directions and before last set
							for (var i = 0; i < newDirections.length; i++) {
								var pathsLength = newDirections[i].geometry.paths.length
								var lastPath = newDirections[i].geometry.paths[pathsLength - 1];
								var lastPathCoord = lastPath[lastPath.length - 1]

								var tempTurn = new Point(lastPathCoord, srProj);
								mobileMap.map.getLayer("turnsGL").add(new Graphic(tempTurn, new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10,
									new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
										new Color([255, 0, 0]), 1),
									new Color([0, 255, 0, 0.25]))));
								var tempPL = newDirections[i].geometry;
								//700 ft circle around turn
								var aBufferInit = gEngine.buffer(tempTurn, 700, "feet");
								//150 ft circle around turn
								var bBufferInit = gEngine.buffer(tempTurn, 150, "feet")
								//75 ft buffer around turn for c buffer
								var cBufferInit = gEngine.buffer(tempTurn, 125, "feet")
								//700 ft polyline
								var aBufferIntersect = gEngine.intersect(aBufferInit, tempPL);
								// 700 ft polyline buffered 60ft

								var aBuffer = gEngine.buffer(aBufferIntersect, 40, "feet");
								//creates b polyline
								var bBufferIntersect = gEngine.intersect(bBufferInit, tempPL);
								//creates b final buffer
								var bBuffer = gEngine.buffer(bBufferIntersect, 40, "feet");

								aBuffer = gEngine.difference(aBuffer, bBuffer)
								var cBuffer = '';
								try {
									var tempPLC = newDirections[i + 1].geometry;
									var cBufferIntersect = gEngine.intersect(cBufferInit, tempPLC);
									//creates b final buffer
									cBuffer = gEngine.buffer(cBufferIntersect, 40, "feet");
									//creates final a buffer
									cBuffer = gEngine.difference(cBuffer, bBuffer)
								} catch (e) {
									console.log("out of range")
								}



								//handle all directions except last one that says "You have arrived...", handle that separately. 	
								//we start at i=1, but we actually want the future directions so we say i+1, etc. We use i as an id index though.
								if (i >= 0 && i < newDirections.length - 1) {

									var distance = parseFloat(newDirections[i + 1]["length"]);
									if (distance < 0.15) {
										distance = (distance * 5280).toFixed(0);
										distance = Math.round(distance / 10) * 10;
										distance = distance.toString() + " feet.";
									} else {
										var distanceArray = distance.toFixed(1).toString().split(".");
										distance = distanceArray[0] + "." + distanceArray[1] + " miles.";

									}
									var dirText = fixString.fixString(newDirections[i + 1]["text"]);
									var aAttrs = {
										turnPt: tempTurn,
										distanceText: distance,
										directions: dirText + ".",
										directionType: "A",
										spoke: false
									};

									if (dirText == "Continue") {
										dirText = "";
									} else {
										dirText = dirText;
									}

									var bAttrs = {
										turnPt: tempTurn,
										distanceText: distance,
										directions: dirText,
										directionType: "B",
										spoke: false
									}
									var dirTextNext = '';
									//Set the initial C Directions
									if (newDirections[i + 2]) {
										dirTextNext = "In, " + fixString.fixString(newDirections[i + 2]["text"]);
									}
									//once we set the intial C Text, check for oddballs.
									if (dirTextNext == "Continue ahead, then Continue") {
										dirTextNext = "In, continue straight."
									} else if (dirTextNext.indexOf("Continue. Then,") > -1) {
										dirTextNext = dirTextNext.replace("Continue. Then,", "In,")
									}

									var cAttrs = {
										turnPt: tempTurn,
										distanceText: distance,
										directions: dirTextNext,
										directionType: "C",
										spoke: false
									}

									var aFeature = new Graphic(aBuffer, aSFS, aAttrs);
									var bFeature = new Graphic(bBuffer, bSFS, bAttrs);
									var cFeature = '';
									var features = '';

									try {
										cFeature = new Graphic(cBuffer, cSFS, cAttrs);
										features = [aFeature, bFeature, cFeature];
										//features = [aFeature, bFeature];
									} catch (e) {
										features = [aFeature, bFeature];
										console.log("no c feature")
									}
	
									mobileMap.map.getLayer('fenceFL').applyEdits(features, null, null, function (evt) {});


								} else {
									console.log("out of range")
								}

							}
							//remove any graphics where geometry is null
							for (var i = 0; i < mobileMap.map.getLayer('fenceFL').graphics.length; i++) {
								if (!mobileMap.map.getLayer('fenceFL').graphics[i].geometry) {
									console.log("deleted")
									mobileMap.map.getLayer('fenceFL').applyEdits(null, null, [mobileMap.map.getLayer('fenceFL').graphics[i]])
								}
							}
							//var fenceLength = mobileMap.map.getLayer('fenceFL').graphics.length;
							//Delete last C, we don't need it.
							//var lastGraphic = mobileMap.map.getLayer('fenceFL').graphics[fenceLength - 1];
							//mobileMap.map.getLayer('fenceFL').applyEdits(null, null, [lastGraphic])
							var fenceLength = mobileMap.map.getLayer('fenceFL').graphics.length;
							console.log(fenceLength)
							console.log(mobileMap.map.getLayer('fenceFL').graphics)
							mobileMap.map.getLayer('fenceFL').graphics.shift();
							//fix overlaps.
							for (var i = fenceLength - 1; i >= 0; i--) {
								console.log(i)
								try {
									var graphic1 = mobileMap.map.getLayer('fenceFL').graphics[i]

									var subtractor = new Polygon(srProj);
									for (var x = 0; x < i; x++) {
										var tempGraphic = mobileMap.map.getLayer('fenceFL').graphics[x];

										for (var z = 0; z < tempGraphic.geometry.rings.length; z++) {
											subtractor.addRing(tempGraphic.geometry.rings[z])
										}

									}
									var graphic1Geom = graphic1.geometry;
									graphic1Geom = gEngine.difference(graphic1Geom, subtractor);
									graphic1.setGeometry(graphic1Geom)
									mobileMap.map.getLayer('fenceFL').applyEdits(null, [graphic1]);

								} catch (e) {
									console.log(e)
								}
							}
							// for (var i = fenceLength - 1; i >= 0; i--) {

							// 	try {
							// 		var graphic1 = mobileMap.map.getLayer('fenceFL').graphics[i]
							// 		if (graphic1.attributes.directionType == "C") {
							// 			var subtractor = new Polygon(srProj);
							// 			for (var x = 0; x < i; x++) {
							// 				var tempGraphic = mobileMap.map.getLayer('fenceFL').graphics[x];
							// 				if (tempGraphic.attributes.directionType == "B" || tempGraphic.attributes.directionType == "A") {
							// 					for (var z = 0; z < tempGraphic.geometry.rings.length; z++) {
							// 						subtractor.addRing(tempGraphic.geometry.rings[z])
							// 					}
							// 				}
							// 			}
							// 			var graphic1Geom = graphic1.geometry;
							// 			graphic1Geom = gEngine.difference(graphic1Geom, subtractor);
							// 			graphic1.setGeometry(graphic1Geom)
							// 			mobileMap.map.getLayer('fenceFL').applyEdits(null, [graphic1]);
							// 		}
							// 	} catch (e) {
							// 		console.log(e)
							// 	}
							// }
							// for (var i = fenceLength - 1; i >= 0; i--) {

							// 	try {
							// 		var graphic1 = mobileMap.map.getLayer('fenceFL').graphics[i]
							// 		if (graphic1.attributes.directionType == "B") {
							// 			var subtractor = new Polygon(srProj);
							// 			for (var x = 0; x < i; x++) {
							// 				var tempGraphic = mobileMap.map.getLayer('fenceFL').graphics[x];
							// 				if (tempGraphic.attributes.directionType == "B" || tempGraphic.attributes.directionType == "C") {
							// 					for (var z = 0; z < tempGraphic.geometry.rings.length; z++) {
							// 						subtractor.addRing(tempGraphic.geometry.rings[z])
							// 					}
							// 				}
							// 			}
							// 			var graphic1Geom = graphic1.geometry;
							// 			graphic1Geom = gEngine.difference(graphic1Geom, subtractor);
							// 			graphic1.setGeometry(graphic1Geom)
							// 			mobileMap.map.getLayer('fenceFL').applyEdits(null, [graphic1]);
							// 		}
							// 	} catch (e) {
							// 		console.log(e)
							// 	}
							// }
							// for (var i = fenceLength - 1; i >= 0; i--) {

							// 	try {
							// 		var graphic1 = mobileMap.map.getLayer('fenceFL').graphics[i]
							// 		if (graphic1.attributes.directionType == "A") {
							// 			var subtractor = new Polygon(srProj);
							// 			for (var x = 0; x < i; x++) {
							// 				var tempGraphic = mobileMap.map.getLayer('fenceFL').graphics[x];
							// 				if (tempGraphic.attributes.directionType == "B" || tempGraphic.attributes.directionType == "C") {
							// 					for (var z = 0; z < tempGraphic.geometry.rings.length; z++) {
							// 						subtractor.addRing(tempGraphic.geometry.rings[z])
							// 					}
							// 				}
							// 			}
							// 			var graphic1Geom = graphic1.geometry;
							// 			graphic1Geom = gEngine.difference(graphic1Geom, subtractor);
							// 			graphic1.setGeometry(graphic1Geom)
							// 			mobileMap.map.getLayer('fenceFL').applyEdits(null, [graphic1]);

							// 		}
							// 	} catch (e) {
							// 		console.log(e)
							// 	}
							// }

							//reverse the graphics order so graphics stack from start to finish top to bottom
							//mobileMap.map.getLayer('fenceFL').graphics.reverse();
							//also move the last one to the top. If we hit this one, then we clear the graphics
							//mobileMap.map.getLayer('fenceFL').graphics.shift();
							//mobileMap.map.getLayer('fenceFL').clear();
							//mobileMap.map.getLayer('fenceFL').applyEdits([fenceReverseGraphics]);
							//delete fenceReverseGraphics;

							//set the very first directions and emit audio.
							var distance = parseFloat(newDirections[1]["length"]);
							if (distance < 0.15) {
								distance = (distance * 5280).toFixed(0);
								distance = Math.round(distance / 10) * 10;
								distance = distance.toString() + " feet.";
							} else {
								var distanceArray = distance.toFixed(1).toString().split(".");
								distance = distanceArray[0] + "." + distanceArray[1] + " miles.";
							}

							var fixedTextFirst = fixString.fixString(newDirections[1]["text"])

							//get rid of second part of first utterance "toward xy road."
							if (fixedTextFirst.indexOf("toward") > -1) {
								fixedTextFirst = fixedTextFirst.substring(0, fixedTextFirst.indexOf('toward'));
							}
							var fixedTextSecond = fixString.fixString(newDirections[2]["text"])
							var firstString = fixedTextFirst;

							window.directions = dom.byId("synthPane").innerHTML = firstString.toUpperCase();
							on.emit(dom.byId("synthPane"), "click", {
								bubbles: true,
								cancelable: false,
							});
							//after everything is calculated then we start the gps watch location function.
							mobileNav.watchLocation = navigator.geolocation.watchPosition(function (pos) {
								var pos = [pos.coords.longitude, pos.coords.latitude]
								var projLoc = Proj4('NCSP', pos);
								var location = [projLoc[0] * 3.28084, projLoc[1] * 3.28084];
								var ptProj = new Point(location, srProj);

								//mobileNav.lastLocation = ptProj;
								mobileMap.map.getLayer("carsGL").graphics[0].setGeometry(ptProj);
								var extent = graphicsUtils.graphicsExtent(mobileMap.map.getLayer("carsGL").graphics)
								var query = new Query();
								query.num = 1;
								query.geometry = extent;
								query.outFields = ['*']
								mobileMap.map.getLayer('fenceFL').selectFeatures(query, FeatureLayer.SELECTION_NEW, function (features) {
									try {
										var feature = features[0];
										if (feature) {
											var featureIndex=mobileMap.map.getLayer('fenceFL').graphics.indexOf(feature)
											//calculate the current distance between turn and car on the fly and set correct units
											var vSDistanceText = '';
											console.log("test");
											var text = feature.attributes.directions;
											console.log(text)
											//calculate the current distance between car and next feature turn for C type direction, and hand,le below
											//when setting up text.
											if (feature.attributes.directionType == "C") {
												console.log("in c")
												var nextPt = mobileMap.map.getLayer('fenceFL').graphics[featureIndex + 1].attributes.turnPt;
												console.log(mobileMap.map.getLayer('fenceFL').graphics)
												if(nextPt){
													console.log(nextPt)
													var vSDistanceC = gEngine.distance(nextPt, ptProj, "miles");
													//var vSDistanceCMiles = gEngine.distance(nextPt, ptProj, "miles");							
													if (vSDistanceC <= 0.15) {
														vSDistanceC = (vSDistanceC * 5280).toFixed(0);
														vSDistanceC = Math.round(vSDistanceC / 10) * 10;
														vSDistanceText = vSDistanceC.toString() + " feet ";
													} else {
														var vSDistanceArrayC = vSDistanceC.toFixed(1).toString().split(".");
														vSDistanceText = vSDistanceArrayC[0] + "." + vSDistanceArrayC[1] + " miles ";
													}
													text = text.replace("In,", "In " + vSDistanceText);
													text = text = text.replace("have arrived", "will arrive")
													text = text.replace("Then, drive for 0 feet.", '')
												}
												else{
													text=text.replace("In,","");
												}
			
												console.log("test");
											} else {
												var vSDistance = gEngine.distance(feature.attributes.turnPt, ptProj, "miles");
												if (vSDistance <= 0.15) {
													vSDistance = (vSDistance * 5280).toFixed(0);
													vSDistance = Math.round(vSDistance / 10) * 10;
													vSDistance = vSDistance.toString() + " feet, ";
												} else {
													var vSDistanceArray = vSDistance.toFixed(1).toString().split(".");
													vSDistanceText = vSDistanceArray[0] + "." + vSDistanceArray[1] + " miles, ";
												}
												if (feature.attributes.directionType == "A") {
													text = "In " + vSDistance + feature.attributes.directions
													text = text = text.replace("have arrived", "will arrive")
												} else if (feature.attributes.directionType == "B") {
													text = text.replace("Then, drive for 0 feet.", '')
												}
											}
											//emit text, set directions pane and remove fence
											window.directions = text.toUpperCase();
											console.log("test");
											on.emit(dom.byId("synthPane"), "click", {
												bubbles: true,
												cancelable: false
											});
											dom.byId("synthPane").innerHTML = (window.directions).toUpperCase();
											mobileMap.map.getLayer('fenceFL').remove(feature)
			
			
											//if for some reason the 'have arrived' fence is triggered,just clear out everything and stop getting locations
											if (text.indexOf("have arrived") > 0) {
												mobileMap.map.getLayer('fenceFL').clear();
												mobileMap.map.getLayer('turnsGL').clear();
												mobileNav.clearWatchLocation();
											}
										}
			
			
									} catch (e) {
			
									}
								});
							}, null, {
								enableHighAccuracy: true,
								maximumAge: 0,
								timeout: 1000
							});
						},
						function (e) {
							console.log(e)
						});
				});
			}
		});
	});