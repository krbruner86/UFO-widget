function check_update_cookie () {
    return document.cookie.split(';').some((item) => item.includes('real-time-updates=true'));
}

function check_persist_cookie () {
    return document.cookie.split(';').some((item) => item.includes('persist=true'));
}

function set_switches () {
    if (check_persist_cookie() === true) {
        document.getElementById("switch-2").checked = true;
    }
        if (check_update_cookie() === true) {
        document.getElementById("switch-1").checked = true;
    }
}

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function remove_list() {
    let ul = document.getElementById("satList");
    ul.remove();
    let div = document.getElementById("ulDiv");
    let ul2 = document.createElement("ul");
    ul2.setAttribute("class", "text");
    ul2.id = "satList";
    ul2.setAttribute("style", "list-style: none;");
    div.appendChild(ul2);
}

// adapted from https://javascript.info/websocket
function run_websocket (coords, socket) {

    socket.onopen = function (e) {
        console.log("[open] Connection established");
        console.log("Sending to server: " + JSON.stringify(coords));

        socket.send(JSON.stringify(coords))
    };

    socket.onmessage = function (event) {

        let sat_data = JSON.parse(event.data);

        if (document.getElementsByTagName('li').length !== 0) {
            remove_list();
        }

        let ul = document.getElementById("satList");

        // loop through websocket data to place data into table
        for (let i = 0; i < sat_data.length; i++) {
            let li = document.createElement("li");
             li.setAttribute("class", "font-size-14 text-center");
             li.appendChild(document.createTextNode(`${sat_data[i].name}: ${sat_data[i].bearing.toFixed(2)}: ${sat_data[i].incline.toFixed(2)}`));
             ul.appendChild(li);
        }

    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log(event.code)
            console.log('[close] Connection died');
        }
    };

    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };
}

let completed = false;

let COORDS = {lat:38.9072,
  long:77.0369
}

function lat_long(loc) {
    console.log('lat: ' + loc.coords.latitude);
    console.log('long: ' + loc.coords.longitude);
    COORDS.lat = loc.coords.latitude;
    if (loc.coords.longitude < 0) {
        loc.coords.longitude = loc.coords.longitude - 180;
    }
    COORDS.long = loc.coords.longitude;
    completed = true;
}

function get_location() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported!");
    } else {
        navigator.geolocation.getCurrentPosition(lat_long);
    }
}

async function main_loop() {

    get_location();

    while (completed !== true) {
        await sleep(1000);
    }

    socket = new WebSocket('ws://3.143.220.142:8080');

    run_websocket(COORDS, socket);

    while (true) {
        await sleep(5000);
        if (check_update_cookie() === true) {
            if (socket.readyState === WebSocket.CLOSED) {
                console.log('reopening socket')
                socket = new WebSocket('ws://3.143.220.142:8080');
                run_websocket(COORDS, socket);
            }
        } else {
            if (socket.readyState === WebSocket.OPEN) {
                console.log('closing socket')
                socket.close();
            }
        }

    }
}


set_switches();
main_loop();