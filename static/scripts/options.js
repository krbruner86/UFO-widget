// set option switches
// https://stackoverflow.com/questions/52550817/cookie-value-change-when-i-check-uncheck-a-checkbox
$("input#switch-1").change(function() {
    if ($(this).is(":checked")) {
        $.cookie("real-time-updates", true, {expires: 60});
    } else {
        $.cookie("real-time-updates", false, {expires: 60});
    }
});

$("input#switch-2").change(function() {
    if($(this).is(":checked")) {
        $.cookie("persist", true, {expires: 60});
    } else {
        $.cookie("persist", false, {expires: 60});
    }

});
