<?php

    function listFiles($dir){

        if ($handle = opendir($dir)) {
            $itens = array();

            while (false !== ($entry = readdir($handle))) {

                if ($entry != "." && $entry != "..") {
                    array_push($itens, $entry);
                }
            }

            closedir($handle);
//            print_r($itens);
            echo json_encode($itens);
        }
    }


    if (isset($_REQUEST['dir'])) {
        $dir = $_REQUEST['dir'];
        listFiles($dir);
    } else {
        echo "Erro: parâmetro não informado!";
    }

?>
