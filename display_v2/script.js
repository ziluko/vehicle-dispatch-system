var ip_addr = "http://localhost"
var socket = io(ip_addr + ':8020');

const LEADER_ORDER = ["11_55_leader", "16_61_leader"]
const CHARACTER_ORDER = ["duty_officer", "11_55_driver", "11_55_member", "16_61_driver", "16_61_member", "331_driver", "31_71_driver", "91_92_driver", "31_71_member", "91_92_member"]
const MEMBER_ORDER = ["91_92_member", "31_71_member", "91_92_driver", "31_71_driver", "331_driver", "16_61_member", "16_61_driver", "11_55_member", "11_55_driver", "duty_officer"]
const DUTY_91_1 = "1a"
const DUTY_91_2 = "1b"
const DUTY_92_1 = "2a"
const DUTY_92_2 = "2b"
const DUTY_PRE_1 = "P1"
const DUTY_PRE_2 = "P2"
const DUTY_ORDER = ["none", DUTY_91_1, DUTY_91_2, DUTY_92_1, DUTY_92_2, DUTY_PRE_1, DUTY_PRE_2]
const EMS_ORDER = [DUTY_91_1, DUTY_91_2, DUTY_92_1, DUTY_92_2]
const OTHER_ORDER = [DUTY_PRE_1, DUTY_PRE_2, DUTY_92_2, DUTY_92_1, DUTY_91_2, DUTY_91_1]
const TOP_RIGHT_ELEMENT = ["leader", "driver", "member"]
const EMS_CAR = ["91", "92"]
const FIRE_CAR = ["11", "55", "16", "61", "31", "71", "91", "92", "331"]
const OTHER_CAR = ["service"]


var sep_char = "．"

socket.on('connect', (data) => {
  console.log('connected!');
  socket.on('osc', (msg) => {
    console.log(msg);
    getCurrentStatus()
  });
  console.log('finish!');
})

function getCurrentStatus() {
  let last_update_time;
  const getLastUpdate = async () => {
    const default_response = await fetch(ip_addr + ':8030/datastreamDefault');
    const default_data = await default_response.json();
    last_update_time = Object.values(default_data)[0]['update_time'];
    return default_data;
  };

  (async () => {
    await getLastUpdate();
    console.log(last_update_time);
    console.log();
    document.getElementById("last_update").innerHTML = "<span style=\"font-size: 1vw;\">[最後更新] </span><b><span style=\"font-size: 1.5vw;\">" + last_update_time + "</span></b>"
  })();

  let current_status;
  
  const getData = async () => {
    const response = await fetch(ip_addr + ':8030/datastream');
    const data = await response.json();
    current_status = data;
    return data;
  };

  (async () => {
    await getData();
    console.log(current_status);
    console.log();
    records = Object.values(current_status)[0];
    for (let key in records) {
      if (key == "idle" || key == "all_member") {
        continue;
      } else if (/car_\d+_name/.test(key) || /other_\d+_car/.test(key)) {
        let car_name = ""
        switch(records[key]) {
          case "11":
            car_name = "11車";
            break;
          case "55":
            car_name = "55車";
            break;
          case "16":
            car_name = "16車";
            break;
          case "61":
            car_name = "61車";
            break;
          case "331":
            car_name = "中指車";
            break;
          case "31":
            car_name = "31車";
            break;
          case "71":
            car_name = "71車";
            break;
          case "91":
            car_name = "91車";
            break;
          case "92":
            car_name = "92車";
            break;
          case "service":
            car_name = "警備車";
            break;
          case "rest":
           	car_name = "休息";
           	break;
          case "train":
            car_name = "訓練";
            break;
          case "business":
            car_name = "洽公";
            break;
          case "truck":
           	car_name = "大紅";
           	break;
          case "moto_513":
           	car_name = "機車513";
           	break;
          case "moto_515":
           	car_name = "機車515";
           	break;
          case "moto_750":
           	car_name = "機車750";
           	break;
          case "moto_751":
           	car_name = "機車751";
           	break;
          default:
            car_name = "";
            break;
        }
        document.getElementById(key).innerText = car_name;
      } else if (/car_\d+_out/.test(key)) {
        if (records[key]) {
          document.getElementById(key).innerText = "出勤";
          document.getElementById(key).style.backgroundColor = "red";
          document.getElementById(key).style.color = "white";
          document.getElementById(key).style.float = "right";
        } else {
          document.getElementById(key).innerText = "在隊";
          document.getElementById(key).style.backgroundColor = "green";
          document.getElementById(key).style.color = "white";
          document.getElementById(key).style.float = "right";
        }
      } else if (key == "current_duty_name") {
        document.getElementById(key).innerText = records[key];
      } else {
        //console.log(key)
        if (records[key] != "") {
          let name = Object.keys(records[key])[0];
          user = document.createElement('span');
          user.className = Object.values(records[key])[0];
          //console.log(name.split(sep_char))
          //console.log(sep_char)
          user.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
          if (name.split(sep_char).length == 1) {
            user.setAttribute("id", name);
            user.setAttribute("data-duty", "none");
            user.innerHTML = name;
          } else {
            user.setAttribute("id", name.split(sep_char)[0]);
            let duty = name.split(sep_char)[1];
            user.setAttribute("data-duty", duty);
            user.innerHTML = name.split(sep_char)[0] + "<sup>" + duty + "</sup>";
            if (duty == DUTY_91_1 || duty == DUTY_91_2) {
              user.style.backgroundColor = "rgb(250, 210, 250)";
            } else if (duty == DUTY_92_1 || duty == DUTY_92_2) {
              user.style.backgroundColor = "rgb(250, 250, 210)";
            }
          }
          /*if (name.split(sep_char).length == 1) {
            user.setAttribute("id", name);
            user.setAttribute("data-duty", "none");
            user.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
            user.innerHTML = name;
          } else if (name.split(sep_char)[1] == "91") {
            user.setAttribute("id", name.split(sep_char)[0]);
            user.setAttribute("data-duty", "91");
            user.style.backgroundColor = "rgb(250, 210, 250)";
            user.innerHTML = name.split(sep_char)[0] + "<sup>91</sup>";
          } else {
            user.setAttribute("id", name.split(sep_char)[0]);
            user.setAttribute("data-duty", "92");
            user.style.backgroundColor = "rgb(250, 250, 210)";
            user.innerHTML = name.split(sep_char)[0] + "<sup>92</sup>";
          }*/
          //user.innerText = name;
          user.setAttribute("draggable", "true");
          user.setAttribute("ondragover", "noAllowDrop(event)");
          console.log(key)
          document.getElementById(key).innerHTML = "";
          document.getElementById(key).appendChild(user);
        } else {
          document.getElementById(key).innerHTML = "";
        }
      }
    }
  })();
}

function addZero(num) {
  return num < 10 ? "0" + num : num;
}

function showTime() {
  let date = new Date();
  let datetime = "";
  datetime = (date.getFullYear() - 1911) + "年";
  datetime = datetime + addZero(date.getMonth() + 1) + "月";
  datetime = datetime + addZero(date.getDate()) + "日\n";
  datetime = datetime + addZero(date.getHours()) + "時";
  datetime = datetime + addZero(date.getMinutes()) + "分";
  datetime = datetime + addZero(date.getSeconds()) + "秒";
  document.getElementById("datetime").innerText = datetime;
  setTimeout("showTime()",1000);
}
