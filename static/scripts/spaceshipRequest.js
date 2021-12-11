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
    let ul = document.getElementById("sensorList");
    ul.remove();
    let div = document.getElementById("ulDiv");
    let ul2 = document.createElement("ul");
    ul2.setAttribute("class", "text");
    ul2.id = "sensorList";
    ul2.setAttribute("style", "list-style: none;");
    div.appendChild(ul2);
}

function get_data() {
    let httpRequest;
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = updateReadings;
    httpRequest.open('GET', 'https://cs361iotspacecraft.azurewebsites.net/api/shipstatus/current');
    httpRequest.send();

    function updateReadings() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                let response = JSON.parse(httpRequest.responseText);

                if (document.getElementsByTagName('li').length !== 0) {
                    remove_list();
                }

                let ul = document.getElementById("sensorList");
                let response_keys = Object.keys(response);

                // iterate over object
                response_keys.forEach((key, index) => {
                    // console.log(`${response[key].name} : ${response[key].value}`);
                    let li = document.createElement("li");
                    li.setAttribute("class", "font-size-14 text-center");
                    li.appendChild(document.createTextNode(`${response[key].name} : ${response[key].value}`));
                    ul.appendChild(li);
                });

                let todaysDate = new Date()
                let dateTime = (todaysDate.getMonth() + 1) + "/" +
                    todaysDate.getDate() + '/' +
                    todaysDate.getFullYear() + " | " +
                    todaysDate.getHours() + ":" +
                    todaysDate.getMinutes() + ":" +
                    todaysDate.getSeconds();
                let li = document.createElement("li");
                li.setAttribute("class", "font-size-14 text-center");
                li.appendChild(document.createTextNode(`Last refresh - ${dateTime}`));
                ul.appendChild(li);
            }
        }
    }
}

async function main_loop() {
    await sleep(10000);
    while (true) {
        if (check_update_cookie() === true) {
            get_data();
        }
        await sleep(10000);
    }
}

set_switches();
get_data();
main_loop();
