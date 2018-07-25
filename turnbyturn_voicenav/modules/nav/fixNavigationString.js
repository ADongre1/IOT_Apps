define({
	fixString:function(navString){
		var intersectionTrue = false;
		var navString =navString;
		var intersectionTrue = false;
		var saintStreets=['ST CHARLES', 'ST DAVIDS', 'ST JAMES CHURCH', 'ST JOHNS CHURCH', 
		     'ST MICHAELS', 'ST PAULS CHURCH', 'ST PETERS CHURCH', 
		     'ST TIMOTHY FIRE', 'ST VINCENT'];
		saintStreets.forEach(function(st){
    	if(navString.indexOf(st)>=0){
            var replace = st.replace("ST","SAINT")
			navString=test.replace(st,replace)}
		});
		
		var stringArray = navString.split(" ");
		for(var i = 0; i<stringArray.length; i++){
			if(stringArray[i]== "Finish"){
				stringArray[i]=stringArray[i].replace("Finish","You have arrived")
			}
			if(stringArray[i]=="HWY" || stringArray[i]=="HWY."){
				stringArray[i]=stringArray[i].replace("HWY","Highway")
			}
			if(stringArray[i]=="NW" || stringArray[i]=="NW."){
				stringArray[i]=stringArray[i].replace("NW","Northwest")
			}
			
			if(stringArray[i]=="DR" || stringArray[i]=="DR."){
				stringArray[i]=stringArray[i].replace("DR","Drive")
			}
			if(stringArray[i]=="RD"||stringArray[i]=="RD."){
				stringArray[i]=stringArray[i].replace("RD","Road")
			}
			if(stringArray[i]=="E" ||stringArray[i]=="E."){
				if(stringArray[i-1] != "&" ){
					stringArray[i] = stringArray[i].replace("E","East")				}				
			}
			if(stringArray[i]=="W"||stringArray[i]=="W."){
				if(stringArray[i-1] !="&"){
					stringArray[i] = stringArray[i].replace("W","West")
				}			
			}
			if(stringArray[i]=="N"||stringArray[i]=="N."){
				stringArray[i] = stringArray[i].replace("N","North")
			}
			if(stringArray[i]=="S"||stringArray[i]=="S."){
				if(stringArray[i-1] !="&" && stringArray[i+1]!="&"){
					stringArray[i] = stringArray[i].replace("S"," South")
				}				
			}
			if(stringArray[i]=="SE"||stringArray[i]=="SE."){
				stringArray[i] = stringArray[i].replace("SE","Southeast")
			}
			if(stringArray[i]=="SW"||stringArray[i]=="SW."){
				stringArray[i] = stringArray[i].replace("SW","Southwest")
			}
			if(stringArray[i]=="NE"||stringArray[i]=="NE."){
				stringArray[i] = stringArray[i].replace("NE","Northeast")
			}
			if(stringArray[i]=="NW"||stringArray[i]=="NW."){
				stringArray[i]=stringArray[i].replace("NW","Northwest")
			}
			if(stringArray[i]=="AVE"||stringArray[i]=="AVE."){
				stringArray[i] = stringArray[i].replace("AVE","Avenue")
			}
			if(stringArray[i]=="CT"||stringArray[i]=="CT."){
				stringArray[i] = stringArray[i].replace("CT","Court")
			}
			if( stringArray[i]=="BLVD"||stringArray[i]=="BLVD."){
				stringArray[i] = stringArray[i].replace("BLVD","Boulevard")
			}
			if(stringArray[i]=="CIR" ||stringArray[i]=="CIR."){
				stringArray[i] = stringArray[i].replace("CIR","Circle")
			}
			if(stringArray[i]=="EXT" ||stringArray[i]=="EXT."){
				stringArray[i] = stringArray[i].replace("EXT","Extension")
			}	
			if(stringArray[i]=="LN" ||stringArray[i]=="LN."){
				stringArray[i] = stringArray[i].replace("LN","Lane")
			}
			if(stringArray[i]=="TR" ||stringArray[i]=="TR."){
				stringArray[i] = stringArray[i].replace("TR","Trail")
			}
			if(stringArray[i]=="SQ" ||stringArray[i]=="SQ."){
				stringArray[i] = stringArray[i].replace("SQ","Square")			
			}	
			if(stringArray[i]=="PT" ||stringArray[i]=="PT."){
				stringArray[i] = stringArray[i].replace("PT","Point")
			}
			if(stringArray[i]=="MT" ||stringArray[i]=="MT."){
				stringArray[i] = stringArray[i].replace("MT","Mount")
			}	
			if(stringArray[i]=="PK" ||stringArray[i]=="PK."){
				stringArray[i] = stringArray[i].replace(" PK","Park")
			}
			if(stringArray[i]=="PL" ||stringArray[i]=="PL."){
				stringArray[i] = stringArray[i].replace("PL","Place")
			}
			if(stringArray[i]=="RDG" ||stringArray[i]=="RDG."){
				stringArray[i] = stringArray[i].replace("RDG","Ridge")
			}

			if(stringArray[i]=="PKWY" ||stringArray[i]=="PKWY."){
				stringArray[i] = stringArray[i].replace("PKWY","Parkway")
			}			
			if(stringArray[i]=="/"){
				//console.log(stringArray)
				stringArray[i] = stringArray[i].replace("/","and")
				intersectionTrue = true;				
			}
			if(stringArray[i].indexOf("RD")>-1 && stringArray[i].length<=2){
				stringArray[i]=stringArray[i].replace("RD","Road");
			}
			if(stringArray[i].indexOf("TH")>-1 && stringArray[i].length<=2){
				stringArray[i]=stringArray[i].replace("TH","th");
			}
			if(stringArray[i].indexOf("ST")>-1 && stringArray[i].length<=2){
				stringArray[i]=stringArray[i].replace("ST","Street");
			}
			if(stringArray[i].indexOf("ND")>-1 && stringArray[i].length<=2){
				stringArray[i]=stringArray[i].replace("ND","nd");
			}
			
		}
		var newString = stringArray.join(" ");
		var towardIndex = newString.indexOf("toward");
		var atIndex = newString.indexOf("at");	
		if(intersectionTrue && towardIndex>-1){	
			newString = newString.slice(0, towardIndex+6) + " intersection of" + newString.slice(towardIndex+6);			
		}
		else if( intersectionTrue && atIndex>-1 ){
			newString = newString.slice(0, atIndex+2) + " intersection of" + newString.slice(atIndex+2);	
		}
		
		
		return newString;	
	}
	
});

