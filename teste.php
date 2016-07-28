<?php
if(isset($_REQUEST['file'])){
    $file = $_REQUEST['file'];


	// $path = 'http://localhost:6800/items/';
	$path = 'http://localhost:6800/items/tutorial/lab/';
	//$files = array_diff(scandir('http://localhost:6800/items/'), array('.', '..'));
	//echo file_get_contents($path);

function get_text($filename) {

    $fp_load = fopen("$filename", "rb");

    if ( $fp_load ) {

			$content = '';
            while ( !feof($fp_load) ) {
                $content .= fgets($fp_load, 8192);
            }

            fclose($fp_load);

            return $content;

    }
}


$matches = array();

preg_match_all("/(a href\=\")([^\?\"]*)(\")/i", get_text($file), $matches);


$a = array();
foreach($matches[2] as $match) {
    //echo $match . '<br>';
		array_push($a, $match);
}
	//print_r($a);
	echo json_encode($a);
}else
{
    echo "Parameter file is missing !";
}

?>
