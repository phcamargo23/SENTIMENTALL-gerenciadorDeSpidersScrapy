<?php

    function recursiveRemoveDirectory($directory){

        foreach (glob("{$directory}/*") as $file) {
            if (is_dir($file)) {
                recursiveRemoveDirectory($file);
            } else {
                unlink($file);
            }
        }
        rmdir($directory);
    }

    if (isset($_REQUEST['dir'])) {
        $dir = $_REQUEST['dir'];
        recursiveRemoveDirectory($dir);
        echo "Diretório apagado com sucesso!";
    } else {
        echo "Erro: parâmetro não informado!";
    }

?>
