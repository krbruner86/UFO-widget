function check_update_cookie () {
    return document.cookie.split(';').some((item) => item.includes('real-time-updates=true'));
}

function check_persist_cookie () {
    return document.cookie.split(';').some((item) => item.includes('persist=true'));
}

if (check_update_cookie() === true && check_persist_cookie() === false) {
    console.log('setting real-time-update to false');
    document.cookie = "real-time-updates=false; expires=60;";
}