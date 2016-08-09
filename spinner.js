    /* SPINNER */
    var spinnerWait = null;

    var opts = {
        lines: 13, /* The number of lines to draw */
        length: 20, /* The length of each line */
        width: 10, /* The line thickness */
        radius: 30, /* The radius of the inner circle */
        corners: 1, /* Corner roundness (0..1) */
        rotate: 0, /* The rotation offset */
        direction: 1, /* 1: clockwise, -1: counterclockwise */
        color: '#000', /* #rgb or #rrggbb or array of colors */
        speed: 1, /* Rounds per second */
        trail: 60, /* Afterglow percentage */
        shadow: false, /* Whether to render a shadow */
        hwaccel: false, /* Whether to use hardware acceleration */
        className: 'spinner', /* The CSS class to assign to the spinner */
        zIndex: 2e9, /* The z-index (defaults to 2000000000) */
        top: 'auto', /* Top position relative to parent in px */
        left: 'auto' /* Left position relative to parent in px */
    };

    function launchSpinner(TargetID, Div2Hide, Button2Disabled){
        if(Div2Hide!==null)
        {
            $(Div2Hide).css('visibility', 'hidden');
        }
        if(Button2Disabled!==null)
        {
            $(Button2Disabled).attr("disabled", true);
        }
        /* LAUNCH SPINNER ONLY IF IT'S NOT NULL TO AVOID MULTIPLE SPINNER AT SAME TIME */
        if(spinnerWait===null)
        {
            spinnerWait = new Spinner(opts).spin(document.getElementById(TargetID));
        }

    }
    function stopSpinner(Div2Show, Button2Enable){
        if(spinnerWait!==null)
        {
            spinnerWait.stop();
            spinnerWait = null;
        }
        if(Div2Show!==null)
        {
            $(Div2Show).css('visibility', 'visible');
        }
        if(Button2Enable!==null)
        {
            $(Button2Enable).attr("disabled", false);
        }
    }