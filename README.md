# IOT_Apps
IoT Apps for Catawba County, NC - written by Arjun Dongre, 7-26-2018

Web applications developed using IIS/PHP, ESRI ArcGIS for Javascript API, dojo Toolkit, ArcServer hosted Routing Service, and NodeJS, and an SOE developed in ArcObjects for Java SDK.


### Meals on Wheels Turn by Turn Voice Navigation

This application was spawned from a larger route optimization web map dashboard that Meals on Wheels uses for routing clients. Being a delivery volunteer myself, the existing route sheet gave directions in sequential order of clients. It was static and did not take into account cancellations. I wanted to created an app with a simplified workflow for selecting a route, a client and then routing the driver to the client using Catawba County's routing data. The County's data is much more reliable and up-to-date than Google Maps. Additionally, the app is easier to navigate that Google Navigation because the user does not have to type addresses in, which saves time and effort.

I started the project off really just seeing how I could use the Voice Synthesis API in conjunction with the directions given by the Network Analysis tools. The mobile_nav.js module is where the heavy routing processing takes place. There are two major steps that take place, for the app to work, that happens on the back-end: geolocating the clients, and the creation of a custom network. 

I developed a more robust way of geolocating positions in the county using additional routing datasets combined with a two step process for determing how best to locate a destination or driver along county roads. This technique is too complex to be detailed here, please inquire for more information. This process however, allows us to geolocate down to the unit level for townhome or trailer court complexes, on the parcel driveways. This app took about 2 years total between my other projects, and went through several iterations to get right. We are now beta-testing, and this methodology of data creation and usage provides a methodology that other small governments could follow.

The application will speak directions, generated from ArcServer, as a driver comes up to geofences created from the route geometry information. Three fences are created to speak directions about 700 feet from a turn(fence type A), 150 feet from a turn(fence type B), and then the next set of directions as the driver pulls out of the turn(fence type C). The user can tap on the text below the map to repeat the directions, tap twice on the map to zoom to the route extent, once to zoom to the car location, and on the header to zoom to the destination.

