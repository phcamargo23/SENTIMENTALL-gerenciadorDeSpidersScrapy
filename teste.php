<?php
function recursiveRemoveDirectory($directory)
{
    $directory = 'http://localhost/teste';
    foreach(glob("{$directory}/*") as $file)
    {
        if(is_dir($file)) {
            recursiveRemoveDirectory($file);
        } else {
            unlink($file);
        }
    }
    rmdir($directory);
}
?>
