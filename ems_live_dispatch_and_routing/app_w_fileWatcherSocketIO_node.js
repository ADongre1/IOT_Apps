//import libraries
var express = require('express');
var WebSocket = require('ws');
var app = express();
var cors = require('cors')
var mssql=require("mssql");
var fs = require ("fs");
var https = require ("https");
var SimpleTimer = require('node-timers/simple');
var timer = new SimpleTimer({pollInterval: 2000});
var deleteDataTimer = new SimpleTimer({pollInterval: 300000});
var moment = require('moment-timezone');
var xml2js = require('xml2js');
var chokidar = require('chokidar');

//watch for ArcServer updating the user token JSON text file through SOI and update JSON in memory
var watcher = chokidar.watch('userTokens.txt', {
  persistent: true
});
var userJSON={};
watcher.on("change",function(path){
  fs.readFile(path, {encoding: 'utf-8'}, function(err,data){
    var soiJSON = JSON.parse(data);
    for(key in soiJSON){
      if(userJSON[key]!=soiJSON[key]){
        userJSON[key]=soiJSON[key];
      }
    }
  });
});

//create websocket server
httpsOptions = {
  pfx:fs.readFileSync("c:\\avlWS\\wildcard2020.pfx"),
  passphrase:'password'
}
app.use(cors());

 var server = https.createServer(httpsOptions,app);
var wss = require('socket.io')(server,{origins:['*:*']});
var connectionCount = 0;
server.listen(3001);

//db connection to get data that is copied to GIS sql server table
//this is the data that clients read so clients aren't hitting AVL directly.
var avlConfig = {
    user:"",
    password:"",
    server: '',
    port:1433,
    database: 'AVL',
    pool: {
       max: 10,
       min: 0,
       idleTimeoutMillis: 600
   }
}
var avlConn = new mssql.Connection(avlConfig)
avlConn.connect();

//Delete data after 5 minutes as it's streaming, don't need old data
deleteDataTimer.on("poll",function(){
  deleteData();
})

function deleteData(){
  var deleteAllQuery = "Delete from AVL.dbo.AVL";
  new mssql.Request(avlConn).query(deleteAllQuery,function(err,result){
      //console.log("avl data deleted")
  });
}

//connection to the live message switch database, only one connectioni
var msgSwitchReadConfig = {
    user:"",
    password:"",
    server:"",
    port:1433,
    database: '',
    pool: {
       max: 1,
       min: 0,
       idleTimeoutMillis: 600
   }
}
var msgSwitchReadConn = new mssql.Connection(msgSwitchReadConfig)
msgSwitchReadConn.connect();


//every two seconds get the latest entry from message switch and write in GIS SQL Server table
timer.on("poll",function(){
  var dateTime=moment().tz("America/New_York").format();
  var timeDate = new Date();
  var date=dateTime.substr(0,10);
  timeDate.setSeconds(timeDate.getSeconds()-2);
  var time=timeDate.toTimeString().substr(0,9);
  var msgSwitchReadQuery = "SELECT MobileLogin,Lat,Long,Time,Speed,DateCreated from CAT_MobileAVLLog (NOLOCK) where DateCreated='"+date+"' and TimeCreated>='"+time+"' and MobileLogin IN ('3M1','3M2','3M3','3M4','3M5','3M6','3M7','3M8','3M9','3M10','3M11','3M12','3M42','3M45','3M46') and Speed <100";
  //console.log(date+" "+time)
  new mssql.Request(msgSwitchReadConn).query(msgSwitchReadQuery,function(err,result){
    //console.log(result)
    if( result && result.length>0){
        var insertQuery = 'INSERT INTO AVL VALUES';
        for(var i in result){
          var msgdate = result[i]["DateCreated"].toISOString().substr(0,10);
          var msgtime = result[i]["Time"];
          insertQuery += "('"+result[i]["MobileLogin"]+"','"+msgdate+"','"+msgtime+"',"+result[i]["Speed"].toString()+","+result[i]["Lat"].toString()+","+result[i]["Long"].toString()+"),";
        }
        insertQuery = insertQuery.slice(0,insertQuery.length-1);
        new mssql.Request(avlConn).query(insertQuery,function(err,result){
        });
      }
    });
});
//on websocket connection check user credentials update connection count and send intial car/incident info and when message is sent from client
wss.on('connection', function(ws) {
  //console.log("connected")
  fs.readFile("C:\\avlWS\\userTokens.txt", {encoding: 'utf-8'}, function(err,data){
    var soiJSON = JSON.parse(data);
    for(user in soiJSON){
        userJSON[user]=soiJSON[user];
    }
    ws.on('message',function(data){
      sendMessage(data);
    });
  });


  connectionCount += 1;
  console.log(connectionCount)
  var cred ='';

  if(connectionCount == 1){
    timer.start();
    deleteDataTimer.start();
//   console.log("timer started")
  }

  ws.on("disconnect",function(){
    connectionCount -= 1;
    console.log(connectionCount);
    if(connectionCount==0){
      timer.stop();
      deleteDataTimer.stop()
      deleteData();
    //  console.log("timers stopped")
    }
    else{
    //  console.log("at least 1 conn still open")
    }
  });
  function sendMessage(data){
    try{
      var userName = data.split(";split;")[1];
      var token = data.split(";split;")[2];
      var data = data.split(";split;")[3];
      var tokenList = userJSON[userName].split(",");
      if(tokenList.indexOf(token)>=0){
        console.log(userName+" token match!")
        var dateTime=moment().tz("America/New_York").format();
        var timeDate = new Date();
        //console.log("msgswitchread time:"+ dateTime)
        var date=dateTime.substr(0,10);
        timeDate.setSeconds(timeDate.getSeconds()-3);
        var time=timeDate.toTimeString().substr(0,9);
        //var query = "SELECT MobileLogin,TimeCreated,Speed,Lat,Long from AVL.dbo.AVL (NOLOCK) where DateCreated='"+date+"' and TimeCreated>='"+time+"' and MobileLogin IN "+data+" and Speed <100";
        var query ="Select * From  AVL as avl1 where TimeCreated = (select max(TimeCreated) from AVL where avl1.MobileLogin =AVL.MobileLogin) and DateCreated = (select max(DateCreated) from AVL where avl1.MobileLogin =AVL.MobileLogin) and MobileLogin IN "+ data+" and Speed <100"
        new mssql.Request(avlConn).query(query,function(err,result){
          var data = {data:result,dataType:"avl"};
          ws.send(JSON.stringify(data));
        });
        ws.send(JSON.stringify({data:openIncidents,dataType:"incidents"}));
        ws.send(JSON.stringify({data:carStatus,dataType:"carStatus"}));
      }
      else{
        ws.send("invalid id/token!");
      }
    }
    catch(e){

    }

  }
});
///////
//// THIS CODE IS FOR READING CAD FILES AND CREATING CAD OBJECTS TO SEND TO CLIENT. RUNS ON A TIMER EVERY 10 seconds
////

var updateCADTimer= new SimpleTimer({pollInterval: 10000});
updateCADTimer.on("poll",function(){
    processFiles();
});
updateCADTimer.start();
var carStatus = {
  "3M1":{available:"yes",ocanum:""},
  "3M2":{available:"yes",ocanum:""},
  "3M3":{available:"yes",ocanum:""},
  "3M4":{available:"yes",ocanum:""},
  "3M5":{available:"yes",ocanum:""},
  "3M6":{available:"yes",ocanum:""},
  "3M7":{available:"yes",ocanum:""},
  "3M8":{available:"yes",ocanum:""},
  "3M9":{available:"yes",ocanum:""},
  "3M10":{available:"yes",ocanum:""},
  "3M11":{available:"yes",ocanum:""},
  "3M12":{available:"yes",ocanum:""},
  "3M42":{available:"yes",ocanum:""},
  "3M45":{available:"yes",ocanum:""},
  "3M46":{available:"yes",ocanum:""}//,
  //"test":{available:"yes",ocanum:""},
  //"test2":{available:"yes",ocanum:""}
}
medics=["3M1","3M2","3M3","3M4","3M5","3M6","3M7","3M8","3M9","3M10","3M11","3M12","3M42","3M45","3M46"];//,"test","test2"]
var openIncidents = {};

function resetEMSObjects(){
  openIncidents = {};
  carStatus = {
    "3M1":{available:"yes",ocanum:"","unitInfo":""},
    "3M2":{available:"yes",ocanum:"","unitInfo":""},
    "3M3":{available:"yes",ocanum:"","unitInfo":""},
    "3M4":{available:"yes",ocanum:"","unitInfo":""},
    "3M5":{available:"yes",ocanum:"","unitInfo":""},
    "3M6":{available:"yes",ocanum:"","unitInfo":""},
    "3M7":{available:"yes",ocanum:"","unitInfo":""},
    "3M8":{available:"yes",ocanum:"","unitInfo":""},
    "3M9":{available:"yes",ocanum:"","unitInfo":""},
    "3M10":{available:"yes",ocanum:"","unitInfo":""},
    "3M11":{available:"yes",ocanum:"","unitInfo":""},
    "3M12":{available:"yes",ocanum:"","unitInfo":""},
    "3M42":{available:"yes",ocanum:"","unitInfo":""},
    "3M45":{available:"yes",ocanum:"","unitInfo":""},
    "3M46":{available:"yes",ocanum:"","unitInfo":""}//,
  }
}
//processe XML CAD files to extract incident location info and what vehicle was dispatched.
function processFiles() {
  resetEMSObjects();
  //console.log("close calls")
  var dir = './CADData';
  var fileList = [];
  var self = this;
  //first read files, and delete any that are closed where timecomplete.length>0
  fs.readdir(dir, function(err, files) {
    self.fileList = files;
    for (var i = 0; i < self.fileList.length; i++) {
      var file = fs.readFileSync('CADData\\' + self.fileList[i], {encoding: 'utf-8'});
      file =file.replace(" & "," &amp; ")
      new xml2js.Parser().parseString(file, function(err, result) {
        var data = result.cadcall;
        var call = data.call[0].$;
        var ocanum = call.ocanumber;
        var units = data.units[0];
        var complaint = call.complaint;
        var city = call.actualincidcity;
        var address = call.actualincidlocation;
        if(call.timecomplete.length>0){
          //console.log(ocanum +" deleted")
          fs.unlinkSync('CADData/' + ocanum+".xml");
        }
      });
    }
    //read the files again, sort in order by modified date and recreate CAD objects
    //must be nested, otherwise it will run before completed routine finishes.
    //wanted to be sorted because we want the latest info from the files to be associated with the vehicles
    fs.readdir(dir, function(err, files) {
      self.fileList = files.sort(function(a, b) {
        return fs.statSync(dir + "/" + a).mtime.getTime() - fs.statSync(dir + "/" + b).mtime.getTime();
      });
  
     for (var i = 0; i < self.fileList.length; i++) {

       var file = fs.readFileSync('CADData\\' + self.fileList[i], {encoding: 'utf-8'});
       file =file.replace(" & "," &amp; ")
       new xml2js.Parser().parseString(file, function(err, result) {
         var data = result.cadcall;
         var call = data.call[0].$;
         var ocanum = call.ocanumber;
         var units = data.units[0];
         var complaint = call.complaint;
         var city = call.actualincidcity;
         var address = call.actualincidlocation;

         if(["OUT OF DISTR","STANDBY"].indexOf(complaint) >-1){
           fs.unlinkSync('CADData/' + ocanum+".xml");
         }
         else if(call.timecomplete.length==0){
           openIncidents[ocanum]={city:city,address:address,cars:[]};
           for(var unit in units) {
             var unitInfo = units[unit][0].$;
             var unitName = unitInfo.unit.toUpperCase();
             if (units.hasOwnProperty(unit) && medics.indexOf(unitName) > -1 && !unitInfo.rem) {
               openIncidents[ocanum].cars.push(unitName);              
                 carStatus[unitName]["available"] = "no";
                 carStatus[unitName]["ocanum"] = ocanum;
                 carStatus[unitName]["unitInfo"]=unitInfo;
             }
             else {
          //     console.log(ocanum+" " + unitName+ " not dispatched");
             }
           }
           if(openIncidents[ocanum].cars.length==0){
                  //  console.log("no pertinent vehicles. deleting file" + ocanum )
                    fs.unlinkSync('CADData/' + ocanum+".xml");
                    delete openIncidents[ocanum];
                  }
         }
       });
     }


    });
  });
}
processFiles();
