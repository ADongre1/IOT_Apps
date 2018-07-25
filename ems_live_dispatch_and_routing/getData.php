<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
$date = (isset($_REQUEST['date']) ? $_REQUEST['date'] : null);
$startTime = (isset($_REQUEST['startTime']) ? $_REQUEST['startTime'] : null);	
$endTime = (isset($_REQUEST['endTime']) ? $_REQUEST['endTime'] : null);	
$unit = (isset($_REQUEST['unit']) ? $_REQUEST['unit'] : null);
$cred = (isset($_REQUEST['creds']) ? $_REQUEST['creds'] : null);


$credArray=array(//private info/
);
if(!in_array($cred, $credArray)){
	echo "Not correct login!";
	die();
}


$login_text = explode(" ",file_get_contents('C:\inetpub\logins\EMS\vairmobile_login.txt'));
$username = $login_text[0];
$pword = $login_text[1];
$db = $login_text[2];
$server = $login_text[3];

$dateStart=new DateTime($date." ".$startTime);
$dateEnd =new DateTime($date." ".$endTime);

//check date and time stamps otherwise die and echo error
$difference = $dateStart->diff($dateEnd);
$diffHours = $difference->format('%h');
$diffMin = $difference->format('%I');

if(intval($diffHours) >= 1 && intval($diffMin) > 0){
	die("Invalid time length." );
}
else{
	unset($dateStart);
	unset($dateEnd);
	unset($difference);
	unset($diffMin);
}

$unit = "'".$unit."'";
$date = "'".$date."'";
$startTime="'".$startTime."'";
$endTime="'".$endTime."'";

$resultArray = array();
try{
$statement = "SELECT [Lat],[Long],[Speed],[TimeCreated],[DateCreated] from [vairmobile].[dbo].[CAT_MobileAVLLog] where MobileLogin = ".$unit." and DateCreated = ".$date." and TimeCreated >= ".$startTime." and TimeCreated <= ".$endTime." and Speed <> 0 and Speed < 100 order by TimeCreated asc";
$conn = new PDO("sqlsrv:Server=$server;Database=$db",$username,$pword);
$conn->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

}
catch(Exception $e)
{		
	die( "No Connection!");
}
$result = $conn->prepare($statement);
$result->execute();
$data = $result->fetchAll(PDO::FETCH_NUM);
$resultArray=array();
foreach($data as $row)
{	
	$resultArray[]=$row;
}

$conn = null;
$arrayCount = count($resultArray);
if($arrayCount > 0){
	echo json_encode($resultArray);
}
else{
	echo "No Data";
}


?>
