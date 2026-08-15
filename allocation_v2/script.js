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
const EMS_ORDER = [DUTY_91_1, DUTY_91_2, DUTY_92_1, DUTY_92_2, DUTY_PRE_1, DUTY_PRE_2]
const OTHER_ORDER = [DUTY_PRE_1, DUTY_PRE_2, DUTY_92_2, DUTY_92_1, DUTY_91_2, DUTY_91_1]
const TOP_RIGHT_ELEMENT = ["leader", "driver", "member"]
const EMS_CAR = ["91", "92"]
const FIRE_CAR = ["11", "55", "16", "61", "31", "71", "91", "92", "331"]
const OTHER_CAR = ["service"]


var sep_char = "．"

function sleep(time) {
    return(new Promise(function(resolve, reject) {
        setTimeout(function() { resolve(); }, time);
    }));
}

function sendCurrentStatus() {
  let current_status = new Object();
  let all_member_list = [];
  let all_target = document.getElementsByClassName("target");
  for (let tar of all_target) {
    let tar_id = tar.id;
    //console.log(tar_id);
    if ($("#"+tar_id).children('span.member').length != 0) {
      member_elem = document.getElementById(tar_id).getElementsByClassName("member")[0];
      if (member_elem.querySelector("sup") != null) {
        member_name = member_elem.innerText.slice(0, -2) + sep_char + member_elem.querySelector("sup").innerText;
      } else {
        member_name = member_elem.innerText;
      }
      current_status[tar_id] = {[member_name]: "member"};
      if (member_name.includes(sep_char)) {
        member_name = member_name.split(sep_char)[0];
      }
      all_member_list.push({[member_name]: "member"});
    } else if ($("#"+tar_id).children('span.cadre').length != 0) {
      cadre_elem = document.getElementById(tar_id).getElementsByClassName("cadre")[0];
      if (cadre_elem.querySelector("sup") != null) {
        cadre_name = cadre_elem.innerText.slice(0, -2) + sep_char + cadre_elem.querySelector("sup").innerText;
      } else {
        cadre_name = cadre_elem.innerText;
      }
      current_status[tar_id] = {[cadre_name]: "cadre"};
      if (cadre_name.includes(sep_char)) {
        cadre_name = cadre_name.split(sep_char)[0];
      }
      all_member_list.push({[cadre_name]: "cadre"});
    } else {
      current_status[tar_id] = "";
    }
  }

  let all_top_right_select_car = document.getElementsByClassName("top_right_select");
  for (let i = 0; i < all_top_right_select_car.length; i++) {
    sel = document.getElementsByClassName("top_right_select")[i];
    current_status[sel.id] = sel.value;
  }

  let all_car_out = document.getElementsByClassName("onoffswitch-checkbox");
  for (let i = 0; i < all_car_out.length; i++) {
    chk = document.getElementsByClassName("onoffswitch-checkbox")[i];
    current_status[chk.id] = $('#'+chk.id).is(':checked');
  }

  let all_bottom_select_car = document.getElementsByClassName("bottom_select");
  for (let i = 0; i < all_bottom_select_car.length; i++) {
    sel = document.getElementsByClassName("bottom_select")[i];
    current_status[sel.id] = sel.value;
  }

  let idle_list = [];
  let all_idle_cadre = document.getElementById("idle").getElementsByClassName("cadre");
  for (let i in all_idle_cadre) {
    if (all_idle_cadre[i].className == "cadre"){
      cadre_elem = all_idle_cadre[i];
      if (cadre_elem.querySelector("sup") != null) {
        cadre_name = cadre_elem.innerText.slice(0, -2) + sep_char + cadre_elem.querySelector("sup").innerText;
      } else {
        cadre_name = cadre_elem.innerText;
      }
      idle_list.push({[cadre_name]: "cadre"});
      if (cadre_name.includes(sep_char)) {
        cadre_name = cadre_name.split(sep_char)[0];
      }
      all_member_list.push({[cadre_name]: "cadre"});
    }
  }
  let all_idle_member = document.getElementById("idle").getElementsByClassName("member");
  for (let i in all_idle_member) {
    if (all_idle_member[i].className == "member"){
      member_elem = all_idle_member[i];
      if (member_elem.querySelector("sup") != null) {
        member_name = member_elem.innerText.slice(0, -2) + sep_char + member_elem.querySelector("sup").innerText;
      } else {
        member_name = member_elem.innerText;
      }
      idle_list.push({[member_name]: "member"});
      if (member_name.includes(sep_char)) {
        member_name = member_name.split(sep_char)[0];
      }
      all_member_list.push({[member_name]: "member"});
    }
  }
  current_status.idle = idle_list;
  current_status.all_member = all_member_list;
  current_status.current_duty_name = document.getElementById("current_duty_name").value;
  //console.log(current_status);
  fetch(ip_addr + ':8030/datastream', {
    method: 'POST',
    body: JSON.stringify({current_status}),
    headers: {'Content-Type': 'application/json'}
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(err => console.log(err))

  sleep(500).then(function() {
    socket.emit('osc');
  });
}

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
    document.getElementById("last_update").innerHTML = "<span style=\"font-size: 1.2vw;\">[最後更新] </span><b><span style=\"font-size: 1.8vw;\">" + last_update_time + "</span></b>"
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
      if (key == "idle") {
        let idle_list = records[key];
        document.getElementById(key).innerHTML = "";
        /*let idle_origin = new Map;
        for (let i in idle_list) {
          console.log(idle_list[i])
          let name = Object.keys(idle_list[i])[0];
          idle_origin.set(name, idle_list[i]);
        }
        console.log(idle_list)
        console.log(idle_origin)
        let idle_sort = new Map([...idle_origin.entries()].sort());
        console.log(idle_sort)
        let idle_sort_keys = Array.from(idle_sort.keys());
        console.log(idle_sort_keys)
        for (let i in idle_sort_keys) {
          console.log(idle_sort_keys[i])
          console.log(Object.values(idle_sort.get(idle_sort_keys[i]))[0])
        }
        for (let i in idle_sort_keys) {
          let name = idle_sort_keys[i];
          user = document.createElement('span');
          user.className = Object.values(idle_sort.get(idle_sort_keys[i]))[0];*/
        for (let i in idle_list) {
          //console.log(idle_list[i])
          let name = Object.keys(idle_list[i])[0];
          //console.log(name)
          user = document.createElement('span');
          user.className = Object.values(idle_list[i])[0];
          //console.log(Object.values(idle_list[i])[0])
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
          /*} else if (name.split(sep_char)[1] == "91") {
            user.setAttribute("id", name.split(sep_char)[0]);
            user.setAttribute("data-duty", "91");
            user.style.backgroundColor = "rgb(250, 210, 250)";
            user.innerHTML = name.split(sep_char)[0] + "<sup>91</sup>";
            //console.log(user)
          } else {
            user.setAttribute("id", name.split(sep_char)[0]);
            user.setAttribute("data-duty", "92");
            user.style.backgroundColor = "rgb(250, 250, 210)";
            user.innerHTML = name.split(sep_char)[0] + "<sup>92</sup>";
          }*/
          //user.innerText = name;
          user.setAttribute("draggable", "true");
          user.setAttribute("ondragover", "noAllowDrop(event)");
          document.getElementById(key).appendChild(user);
        }
      } else if (key == "all_member") {
        let all_member_list = records[key];
        document.getElementById(key).innerHTML = "";
        for (let i in all_member_list) {
          let name = Object.keys(all_member_list[i])[0];
          user = document.createElement('span');
          user.className = 'night_' + Object.values(all_member_list[i])[0];
          user.setAttribute("id", 'all_' + name);
          user.innerText = name;
          user.setAttribute("draggable", "true");
          user.setAttribute("ondragover", "noAllowDrop(event)");
          document.getElementById(key).appendChild(user);
        }
      } else if (/car_\d+_name/.test(key)) {
        document.querySelector('#'+ key + ' option[value="' + records[key] + '"]').setAttribute('selected', "");
        if (records[key] != "none") {
          var disable_option = document.querySelectorAll('.top_right_select:not(#' + key + ') option[value="' + records[key] + '"]').forEach( function(element) {
            element.setAttribute("disabled", "");
          });
        }
      } else if (/car_\d+_out/.test(key)) {
        if (records[key]) {
          document.getElementById(key).setAttribute('checked', "");
        }
      } else if (/other_\d+_car/.test(key)) {
        document.querySelector('#'+ key + ' option[value="' + records[key] + '"]').setAttribute('selected', "");
      } else if (key == "current_duty_name") {
        continue;
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
    let origin = [];
    for (let i = 0; i < records["all_member"].length; i++) {
      origin.push(Object.keys(records["all_member"][i])[0]);
    }
    console.log(origin)
    let sort = origin.sort();
    console.log(sort)
    let current_duty_select = document.getElementById('current_duty_name');

    for (let i = 0; i < sort.length; i++){
        let opt = document.createElement('option');
        opt.value = sort[i];
        opt.innerHTML = sort[i];
        current_duty_select.appendChild(opt);
    }
    if (sort.includes(records["current_duty_name"])) {
      document.querySelector('#current_duty_name option[value="' + records["current_duty_name"] + '"]').setAttribute('selected', "");
    } else {
      document.querySelector('#current_duty_name option[value="none"]').setAttribute('selected', "");
    }
    
    dragAndDrop();
  })();
}

function dragAndDrop() {
  document.body.innerHTML = document.body.innerHTML;
  $(".member, .cadre").on({
    "dragstart": function(event){
      console.log("dragstart");
      event.originalEvent.dataTransfer.setData('text/id',event.target.id)
      event.originalEvent.dataTransfer.setData('text/class',event.target.className)
    },
    "dragend": function(){
      console.log("dragend");
      $(".target").removeClass("over")
      $(".drop_text").removeClass("over")
    },
    "mousedown": function(e) {
      //e.preventDefault();
      if( (e.which == 3) ) {
        console.log("old: " + this.dataset.duty);
        new_duty = nextDuty(this.dataset.duty);
        this.dataset.duty = new_duty;
        if (new_duty == "none") {
          this.innerText = this.id;
        } else {
          this.innerHTML = this.id + "<sup>" + new_duty + "</sup>";
        }
        if (new_duty == DUTY_91_1 || new_duty == DUTY_91_2) {
          this.style.backgroundColor = "rgb(250, 210, 250)";
        } else if (new_duty == DUTY_92_1 || new_duty == DUTY_92_2) {
          this.style.backgroundColor = "rgb(250, 250, 210)";
        } else {
          this.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
        }
        console.log("new: " + this.dataset.duty);
        sendCurrentStatus();
        /*if (this.dataset.duty == "none") {
          this.dataset.duty = "91";
          this.innerHTML = this.id + "<sup>91</sup>";
          this.style.backgroundColor = "rgb(250, 210, 250)";
        } else if (this.dataset.duty == "91") {
          this.dataset.duty = "92";
          this.innerHTML = this.id + "<sup>92</sup>";
          this.style.backgroundColor = "rgb(250, 250, 210)";
        } else {
          this.dataset.duty = "none";
          this.innerText = this.id;
          this.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
        }
        console.log("new: " + this.dataset.duty)*/
      }
      e.stopPropagation();
    },
    "contextmenu": function(e){
      e.preventDefault();
    }
  })

  $(".night_member, .night_cadre").on({
    "dragstart": function(event){
      console.log("dragstart");
      console.log(event)
      event.originalEvent.dataTransfer.setData('text/id',event.target.id)
      event.originalEvent.dataTransfer.setData('text/class',event.target.className)
    },
    "dragend": function(){
      console.log("dragend");
      $(".target").removeClass("over")
      $(".drop_text").removeClass("over")
    },
    "contextmenu": function(e){
      e.preventDefault();
    }
  })
  
  $(".target").on({
    "dragenter": function(event){
      event.preventDefault();
      
      console.log("dragenter");
    },
    "dragover": function(event){
      event.preventDefault();

      $(this).addClass("over")
      console.log("dragover");
    },
    "dragleave": function(){
      console.log("dragleave");
      $(".target").removeClass("over")
    },
    "drop": function(event){
      // event.stopPropagation(); //停止事件氣泡現象
      let source_person_class = event.originalEvent.dataTransfer.getData('text/class');
      if (source_person_class == "cadre" || source_person_class == "member") {
        event.preventDefault();
        console.log("drop");
        let source_person_id = event.originalEvent.dataTransfer.getData('text/id');
        let destination_target_id = event.target.id;
        console.log($(event.target).children('span.member').length)
        if ($(event.target).children('span.member').length != 0) {
          let destination_person_id = document.getElementById(destination_target_id).getElementsByClassName("member")[0].id;
          let source_target_id = document.getElementById(source_person_id).parentNode.id;
      
          console.log(destination_person_id);
          //$("#"+destination_person_id).appendTo(document.getElementById("idle"));
          $("#"+destination_person_id).appendTo(document.getElementById(source_target_id));
        } else if ($(event.target).children('span.cadre').length != 0) {
          let destination_person_id = document.getElementById(destination_target_id).getElementsByClassName("cadre")[0].id;
          let source_target_id = document.getElementById(source_person_id).parentNode.id;
      
          console.log(destination_person_id);
          //$("#"+destination_person_id).appendTo(document.getElementById("idle"));
          $("#"+destination_person_id).appendTo(document.getElementById(source_target_id));
        }
        console.log(source_person_id);
        $("#"+source_person_id).appendTo(event.target);
        sendCurrentStatus();
      }
      $(".target").removeClass("over")
    }
  })

  $(".night").on({
    "dragenter": function(event){
      event.preventDefault();
      
      console.log("dragenter");
    },
    "dragover": function(event){
      event.preventDefault();

      $(this).addClass("over")
      console.log("dragover");
    },
    "dragleave": function(){
      console.log("dragleave");
      $(".night").removeClass("over")
    },
    "drop": function(event){
      event.preventDefault();
      // event.stopPropagation(); //停止事件氣泡現象
      let source_person_class = event.originalEvent.dataTransfer.getData('text/class');
      if (source_person_class == "night_cadre" || source_person_class == "night_member") {
        console.log("drop");
        let id = event.originalEvent.dataTransfer.getData('text/id');
        let destination_target_id = event.target.id;
        console.log($(event.target).children('span.night_member').length)
        if ($(event.target).children('span.night_member').length != 0) {
          let origin = document.getElementById(destination_target_id).getElementsByClassName("night_member")[0].id;
      
          console.log(origin);
          let elem = document.getElementById(origin);
          if (elem) {
            elem.remove();
            sendCurrentStatus();
          }
        } else if ($(event.target).children('span.night_cadre').length != 0) {
          let origin = document.getElementById(destination_target_id).getElementsByClassName("night_cadre")[0].id;
      
          console.log(origin);
          let elem = document.getElementById(origin);
          if (elem) {
            elem.remove();
            sendCurrentStatus();
          }
        }
        console.log(id);
        var new_node = document.getElementById(id).cloneNode(true);
        console.log(event.target.id)
        new_node.id = event.target.id + '_' + id;
        event.target.appendChild(new_node);
        dragAndDrop();
        sendCurrentStatus();
      }
      $(".night").removeClass("over")
    }
  })
  
  $("#idle").on({
    "dragenter": function(event){
      event.preventDefault();
      
      console.log("dragenter");
    },
    "dragover": function(event){
      event.preventDefault();
      $(this).addClass("over")
      
      console.log("dragover");
    },
    "dragleave": function(){
      console.log("dragleave");
      $(".target").removeClass("over")
    },
    "drop": function(event){
      event.preventDefault();
      // event.stopPropagation(); //停止事件氣泡現象
      let source_person_class = event.originalEvent.dataTransfer.getData('text/class');
      if (source_person_class == "cadre" || source_person_class == "member") {
        console.log("drop");
        let id = event.originalEvent.dataTransfer.getData('text/id');
        
        $("#"+id).appendTo(event.target);
        sendCurrentStatus();
      } else {
        $(".target").removeClass("over")
      }
      sortIdleAllMemberList();
    }
  })

  $("#all_member").on({
    "dragenter": function(event){
      event.preventDefault();
      
      console.log("dragenter");
    },
    "dragover": function(event){
      event.preventDefault();
      $(this).addClass("over")
      
      console.log("dragover");
    },
    "dragleave": function(){
      console.log("dragleave");
      $(".night").removeClass("over")
    },
    "drop": function(event){
      event.preventDefault();
      // event.stopPropagation(); //停止事件氣泡現象
      let source_person_class = event.originalEvent.dataTransfer.getData('text/class');
      if (source_person_class == "night_cadre" || source_person_class == "night_member") {
        console.log("drop");
        let id = event.originalEvent.dataTransfer.getData('text/id');
        let elem = document.getElementById(id);
        if (elem) {
          elem.remove();
          sendCurrentStatus();
        }
      } else {
        $(".night").removeClass("over")
      }
    }
  })

  $(".drop_text").on({
    "dragenter": function(event){
      event.preventDefault();
      
      console.log("dragenter");
    },
    "dragover": function(event){
      event.preventDefault();
      $(this).addClass("over")
      
      console.log("dragover");
    },
    "dragleave": function(){
      console.log("dragleave");
      $(".drop_text").removeClass("over")
    },
    "drop": function(event){
      event.preventDefault();
      // event.stopPropagation(); //停止事件氣泡現象
      let source_person_class = event.originalEvent.dataTransfer.getData('text/class');
      if (source_person_class == "cadre" || source_person_class == "member") {
        console.log("drop");
        let id = event.originalEvent.dataTransfer.getData('text/id');
        let all_elem = document.querySelectorAll('[id$="' + id + '"]')
        for (let i in all_elem) {
          if (all_elem[i].tagName == "SPAN") {
            all_elem[i].remove();
          }
        }
        sendCurrentStatus();
      } else {
        $(".drop_text").removeClass("over")
      }
    }
  })
  floatWindow();
  topRightCarSelect();
  topRightCarOut();
  bottomCarSelect();
  saveDefaultButton();
  sortButton();
  resetButton();
  broadcastButton();
  emsButton();
  fireMiddleButton();
  fireBigButton();
  fireOtherButton();
  otherButton();
  bottomCarBackButton();
  currentDutySelect();
  sortIdleAllMemberList();
}
  
function noAllowDrop(ev) {
  ev.stopPropagation();
}

function createCadre() {
  let name = document.getElementById("new_user_name").value;
  document.getElementById("new_user_name").value = "";
  if (name == "") {
    console.log("Empty name");
  } else {
    let exist = document.getElementById(name);
    if (exist){
        console.log(name+" exist");
    } else if (name.indexOf(sep_char) > -1) {
      console.log("'" + sep_char + "' is invalid")
    } else {
      user = document.createElement('span');
      user.className = "cadre";
      user.innerText = name;
      user.setAttribute("id", name);
      user.setAttribute("data-duty", "none");
      user.setAttribute("draggable", "true");
      user.setAttribute("ondragover", "noAllowDrop(event)");
      document.getElementById("idle").appendChild(user);

      all_user = document.createElement('span');
      all_user.className = 'night_cadre';
      all_user.setAttribute("id", 'all_' + name);
      all_user.innerText = name;
      all_user.setAttribute("draggable", "true");
      all_user.setAttribute("ondragover", "noAllowDrop(event)");
      document.getElementById("all_member").appendChild(all_user);
      dragAndDrop();
      sendCurrentStatus();
    }
  }
}

function createMember() {
  let name = document.getElementById("new_user_name").value;
  document.getElementById("new_user_name").value = "";
  if (name == "") {
    console.log("Empty name");
  } else if (name.indexOf("-") > -1) {
    console.log("'-' is invalid")
  } else {
    let exist = document.getElementById(name);
    if (exist){
        console.log(name+" exist");
    } else {
      user = document.createElement('span');
      user.className = "member";
      user.innerText = name;
      user.setAttribute("id", name);
      user.setAttribute("data-172.23.85.195", "none");
      user.setAttribute("draggable", "true");
      user.setAttribute("ondragover", "noAllowDrop(event)");
      document.getElementById("idle").appendChild(user);

      all_user = document.createElement('span');
      all_user.className = 'night_member';
      all_user.setAttribute("id", 'all_' + name);
      all_user.innerText = name;
      all_user.setAttribute("draggable", "true");
      all_user.setAttribute("ondragover", "noAllowDrop(event)");
      document.getElementById("all_member").appendChild(all_user);
      dragAndDrop();
      sendCurrentStatus();
    }
  }
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
  if ([0, 2, 4, 6].includes(date.getHours()) && date.getMinutes() < 5 && date.getSeconds() < 5) {
    autoUpdate(date.getHours());
  }
  setTimeout("showTime()",1000);
}

function autoUpdate(hour) {
  let start = hour;
  let end = hour + 2;
  let id_91_member_1 = start + "_" + end + "_91_member_1";
  let id_91_member_2 = start + "_" + end + "_91_member_2";
  let id_92_member_1 = start + "_" + end + "_92_member_1";
  let id_92_member_2 = start + "_" + end + "_92_member_2";
  let id_prepare_1 = start + "_" + end + "_prepare_1";
  let id_prepare_2 = start + "_" + end + "_prepare_2";
  if ($("#"+id_91_member_1).children('span').length != 0 && 
      $("#"+id_91_member_2).children('span').length != 0 &&
      $("#"+id_92_member_1).children('span').length != 0 &&
      $("#"+id_92_member_2).children('span').length != 0) {
    let all_cadre = document.getElementsByClassName("cadre");
    let all_member = document.getElementsByClassName("member");
    for (let i in all_cadre) {
      if (all_cadre[i].className == "cadre") {
        all_cadre[i].setAttribute("data-duty", "none");
        all_cadre[i].innerText = all_cadre[i].id;
        all_cadre[i].style.backgroundColor = "rgba(240, 248, 248, 0.6)";
      }
    }
    for (let i in all_member) {
      if (all_member[i].className == "member") {
        all_member[i].setAttribute("data-duty", "none");
        all_member[i].innerText = all_member[i].id;
        all_member[i].style.backgroundColor = "rgba(240, 248, 248, 0.6)";
      }
    }
    let member_91_1 = document.getElementById(id_91_member_1);
    let member_91_2 = document.getElementById(id_91_member_2);
    let member_92_1 = document.getElementById(id_92_member_1);
    let member_92_2 = document.getElementById(id_92_member_2);
    let prepare_1 = document.getElementById(id_prepare_1);
    let prepare_2 = document.getElementById(id_prepare_2);
    
    let new_91_1 = document.getElementById(member_91_1.innerText);
    new_91_1.setAttribute("data-duty", DUTY_91_1);
    new_91_1.style.backgroundColor = "rgb(250, 210, 250)";
    new_91_1.innerHTML = new_91_1.id + "<sup>" + DUTY_91_1 + "</sup>";
    let new_91_2 = document.getElementById(member_91_2.innerText);
    new_91_2.setAttribute("data-duty", DUTY_91_2);
    new_91_2.style.backgroundColor = "rgb(250, 210, 250)";
    new_91_2.innerHTML = new_91_2.id + "<sup>" + DUTY_91_2 + "</sup>";
    let new_92_1 = document.getElementById(member_92_1.innerText);
    new_92_1.setAttribute("data-duty", DUTY_92_1);
    new_92_1.style.backgroundColor = "rgb(250, 250, 210)";
    new_92_1.innerHTML = new_92_1.id + "<sup>" + DUTY_92_1 + "</sup>";
    let new_92_2 = document.getElementById(member_92_2.innerText);
    new_92_2.setAttribute("data-duty", DUTY_92_2);
    new_92_2.style.backgroundColor = "rgb(250, 250, 210)";
    new_92_2.innerHTML = new_92_2.id + "<sup>" + DUTY_92_2 + "</sup>";

    if ($("#"+id_prepare_1).children('span').length != 0) {
      let new_prepare_1 = document.getElementById(prepare_1.innerText);
      new_prepare_1.setAttribute("data-duty", DUTY_PRE_1);
      new_prepare_1.innerHTML = new_prepare_1.id + "<sup>" + DUTY_PRE_1 + "</sup>";
    }

    if ($("#"+id_prepare_2).children('span').length != 0) {
      let new_prepare_2 = document.getElementById(prepare_2.innerText);
      new_prepare_2.setAttribute("data-duty", DUTY_PRE_2);
      new_prepare_2.innerHTML = new_prepare_2.id + "<sup>" + DUTY_PRE_2 + "</sup>";
    }
    
    member_91_1.innerHTML = "";
    member_91_2.innerHTML = "";
    member_92_1.innerHTML = "";
    member_92_2.innerHTML = "";
    prepare_1.innerHTML = "";
    prepare_2.innerHTML = "";
    sendCurrentStatus();
  }
}

var elementSelected;
var mouseX, mouseY;
function floatWindow() {
  document.querySelectorAll(".member_list_content").forEach( function(element,index) {
    element.style.left = 400;
    element.addEventListener('mousedown', function(event) {
      elementSelected = element;
      mouseX = event.clientX - parseInt(getComputedStyle(elementSelected).left);
      mouseY = event.clientY - parseInt(getComputedStyle(elementSelected).top);
      // move this element to top layer
      //document.querySelector(".container").appendChild(elementSelected);
    })
  });
  
  document.addEventListener('mousemove', function(event) {
    if(elementSelected!==undefined) {
      elementSelected.style.left = event.clientX - mouseX + 'px';
      elementSelected.style.top = event.clientY - mouseY + 'px';
    }
  });
  
  document.addEventListener('mouseup', function(event) {
    elementSelected = undefined;
  });
}

function sortIdleAllMemberList() {
  //console.log(document.getElementById("idle"))\
  let list_ids = ["idle", "all_member"]
  for (let i = 0; i < list_ids.length; i++) {
    //console.log(list_ids[i])
    let childs = document.getElementById(list_ids[i]).childNodes;
    let origin = new Map;
    for (let i = 0; i < childs.length; i++) {
      let name = childs[i].id;
      origin.set(name, childs[i]);
    }
    let sort = new Map([...origin.entries()].sort());
    let sort_keys = Array.from(sort.keys());
    //console.log(idle_sort_keys)
    document.getElementById(list_ids[i]).innerHTML = "";
    for (let key in sort_keys) {
      document.getElementById(list_ids[i]).appendChild(sort.get(sort_keys[key]));
    }
  }
}

function topRightCarSelect() {
  var top_right_select = document.querySelectorAll(".top_right_select").forEach( function(element) {
    element.addEventListener('change', topRightSelectFunc);
    element.dataset.current_car = element.value;
  });
}

function topRightSelectFunc() {
  const selectValue = this.value;
  //console.log(this.id);
  //console.log(selectValue);
  
  if (this.dataset.current_car != "none") {
    var restore_option = document.querySelectorAll('.top_right_select:not(#' + this.id + ') option[value="' + this.dataset.current_car + '"]').forEach( function(element) {
      element.removeAttribute("disabled");
    });
  }
  if (selectValue != "none") {
    var disable_option = document.querySelectorAll('.top_right_select:not(#' + this.id + ') option[value="' + this.value + '"]').forEach( function(element) {
      element.setAttribute("disabled", "");
    });
  }
  this.dataset.current_car = selectValue;
  sendCurrentStatus();
}

function topRightCarOut() {
  var switch_box = document.querySelectorAll(".onoffswitch-checkbox").forEach( function(element) {
    element.addEventListener('change', checkFunc);
  });
}

async function checkFunc() {
  //console.log(this.id);
  //console.log($(this).is(':checked'));
  if (!$(this).is(':checked')) {
    var car_name_id = this.id.replace("out", "name");
    var current_car = document.getElementById(car_name_id).value;
    document.getElementById(car_name_id).value = "none";
    var restore_option = document.querySelectorAll('.top_right_select:not(#' + car_name_id + ') option[value="' + current_car + '"]').forEach( function(element) {
      element.removeAttribute("disabled");
    });
    for (let i = 0; i < TOP_RIGHT_ELEMENT.length; i++) {
      var elem_id = this.id.replace("out", TOP_RIGHT_ELEMENT[i]);
      //console.log(document.getElementById(elem_id))
      if (document.getElementById(elem_id).childNodes.length == 1) {
        $("#"+document.getElementById(elem_id).childNodes[0].id).appendTo(document.getElementById("idle"));
      }
    }
    await sortFunc();
  }
  sendCurrentStatus();
  sortIdleAllMemberList();
}

function bottomCarSelect() {
  var top_right_select = document.querySelectorAll(".bottom_select").forEach( function(element) {
    element.addEventListener('change', bottomSelectFunc);
  });
}

function bottomSelectFunc() {
  const selectValue = this.value;
  //console.log(this.id);
  //console.log(selectValue);
  
  sendCurrentStatus();
}

function bottomCarBackButton() {
  var back_buttom = document.querySelectorAll(".button_back").forEach( function(element) {
    element.addEventListener('click', bottomCarBackFunc);
  });
}

async function bottomCarBackFunc() {
  let id_prefix = this.id.replace("_back", "");
  document.querySelector('#'+ id_prefix + '_car option[selected]').removeAttribute('selected');
  document.querySelector('#'+ id_prefix + '_car option[value="none"]').setAttribute('selected', "");
  
  let corresponding_member = document.getElementById(id_prefix + "_member")
  if (corresponding_member.childNodes.length == 1) {
    $("#"+corresponding_member.childNodes[0].id).appendTo(document.getElementById("idle"));
  }
  await sortFunc();
  sendCurrentStatus();
  sortIdleAllMemberList();
}

function topRightCarOut() {
  var switch_box = document.querySelectorAll(".onoffswitch-checkbox").forEach( function(element) {
    element.addEventListener('change', checkFunc);
  });
}

function saveDefaultButton() {
  document.getElementById("save_default").addEventListener("click", saveDefaultFunc);
}

function saveDefaultFunc() {
  let default_list = new Object();
  let all_top_left = document.getElementsByClassName("top_left");
  for (let tl of all_top_left) {
    let tl_id = tl.id;
    //console.log(tar_id);
    if (tl_id == "31_71_leader" || tl_id == "91_92_leader") {
      continue;
    }
    if ($("#"+tl_id).children('span.member').length != 0) {
      member_elem = document.getElementById(tl_id).getElementsByClassName("member")[0]
      if (member_elem.querySelector("sup") != null) {
        member_name = member_elem.innerText.slice(0, -2)
      } else {
        member_name = member_elem.innerText
      }
      default_list[tl_id] = {[member_name]: "member"};
    } else if ($("#"+tl_id).children('span.cadre').length != 0){
      cadre_elem = document.getElementById(tl_id).getElementsByClassName("cadre")[0]
      if (cadre_elem.querySelector("sup") != null) {
        cadre_name = cadre_elem.innerText.slice(0, -2)
      } else {
        cadre_name = cadre_elem.innerText
      }
      default_list[tl_id] = {[cadre_name]: "cadre"};
    } else {
      default_list[tl_id] = "";
    }
  }
  let date = new Date();
  let datetime = "";
  datetime = addZero(date.getMonth() + 1) + "/";
  datetime = datetime + addZero(date.getDate()) + " ";
  datetime = datetime + addZero(date.getHours()) + ":";
  datetime = datetime + addZero(date.getMinutes()) + ":";
  datetime = datetime + addZero(date.getSeconds());
  default_list["update_time"] = datetime;

  //console.log(current_status);
  fetch(ip_addr + ':8030/datastreamDefault', {
    method: 'POST',
    body: JSON.stringify({default_list}),
    headers: {'Content-Type': 'application/json'}
  })
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(err => console.log(err))
  .then(none => document.getElementById("last_update").innerHTML = "<span style=\"font-size: 1.2vw;\">[最後更新] </span><b><span style=\"font-size: 1.8vw;\">" + datetime + "</span></b>")
}

function sortButton() {
  document.getElementById("sort").addEventListener("click", sortFunc);
}

async function sortFunc() {
  return new Promise((resolve, reject) => {
    //console.log("sort-start")
    let default_table;
    const getDefaultData = async () => {
      const default_response = await fetch(ip_addr + ':8030/datastreamDefault');
      const default_data = await default_response.json();
      default_table = default_data;
      return default_data;
    };
    let substitute_order;
    const getSubstituteOrderData = async () => {
      const response = await fetch(ip_addr + ':8030/substituteOrder');
      const data = await response.json();
      substitute_order = data;
      return data;
    };

    (async () => {
      await getDefaultData();
      await getSubstituteOrderData();
      //console.log(default_table);
      //console.log(substitute_order);
      //console.log();
      default_list = Object.values(default_table)[0];
      //console.log(document.getElementsByClassName("top_left"))
      /*for (let idx in document.getElementsByClassName("top_left")) {
        clean_elem = document.getElementsByClassName("top_left")[idx];
        if (clean_elem.id == "31_71_leader" || clean_elem.id == "91_92_leader" || clean_elem.id === undefined) {
          continue;
        }
        if (clean_elem.childNodes.length == 1) {
          $("#"+clean_elem.childNodes[0].id).appendTo(document.getElementById("idle"));
        }
      }*/
      resetFunc(false)
      for (let character in default_list) {
        if (character == "update_time" || default_list[character] == "") {
          continue;
        }
        let member_id = Object.keys(default_list[character])[0];
        let parent_elem = document.getElementById(member_id).parentNode;
        if (parent_elem.classList.contains('member_list')) {
          $("#"+member_id).appendTo(document.getElementById(character));
        }
      }

      let sub_candidate;
      if (document.getElementById("11_55_leader").childNodes.length == 0) {
        if (default_list["16_61_leader"] != "") {
          sub_candidate = document.getElementById(Object.keys(default_list["16_61_leader"])[0]);
          if (sub_candidate.parentNode.classList.contains('member_list') || sub_candidate.parentNode.classList.contains('top_left')) {
            $("#"+sub_candidate.id).appendTo(document.getElementById("11_55_leader"));
          }
        }
      }
      //console.log(document.getElementById("11_55_leader").childNodes)
      //console.log(document.getElementById("16_61_leader").childNodes)
      if (document.getElementById("11_55_leader").childNodes.length == 0 && document.getElementById("16_61_leader").childNodes.length == 0) {
        let substitute_list = Object.values(substitute_order);
        //console.log(substitute_list)
        let sub_elem;
        for (let i = 0; i < substitute_list.length; i++) {
          sub_elem = document.querySelector('.member[id*="' + substitute_list[i] + '"], .cadre[id*="' + substitute_list[i] + '"]');
          //console.log(sub_elem)
          if (sub_elem.parentNode.classList.contains("top_left") && sub_elem.parentNode.id != "duty_officer") {
            $("#"+sub_elem.id).appendTo(document.getElementById("11_55_leader"));
            break;
          }
        }
      }

      // 由前往後檢查空缺，由後往前填補
      let m_idx = 0;
      let isSubstituted = false;
      for (let c_idx = 0; c_idx < CHARACTER_ORDER.length; c_idx++) {
        //console.log(CHARACTER_ORDER[c_idx], MEMBER_ORDER[m_idx])
        let current_character = CHARACTER_ORDER[c_idx];
        if (current_character == "16_61_member" && document.getElementById("16_61_leader").childNodes.length != 0) {
          //console.log("Skip 55 61 member")
          continue;
        }
        //console.log(document.getElementById(current_character).childNodes)
        if (document.getElementById(current_character).childNodes.length == 0) {
          //console.log(current_character)
          isSubstituted = false;
          while (!isSubstituted && m_idx < MEMBER_ORDER.length) {
            if (default_list[MEMBER_ORDER[m_idx]] != "") {
              sub_candidate = document.getElementById(Object.keys(default_list[MEMBER_ORDER[m_idx]])[0]);
              //console.log(sub_candidate.parentNode.classList)
              if (sub_candidate.parentNode.classList.contains('member_list') || sub_candidate.parentNode.classList.contains('top_left')) {
                if (sub_candidate.parentNode.id != "11_55_leader") {
                  $("#"+sub_candidate.id).appendTo(document.getElementById(current_character));
                isSubstituted = true;
                //console.log(sub_candidate.id, current_character)
                }
              }
            }
            m_idx++;
            //console.log(c_idx, MEMBER_ORDER.length-1-m_idx, m_idx)
            if (c_idx >= MEMBER_ORDER.length-1-m_idx) {
              break;
            }
          }
        }
        //console.log(c_idx, MEMBER_ORDER.length-1-m_idx)
        if (c_idx >= MEMBER_ORDER.length-1-m_idx) {
          if (document.getElementById("16_61_member").childNodes.length != 0 && document.getElementById("16_61_leader").childNodes.length != 0 && document.getElementById(current_character).childNodes.length == 0) {
            $("#"+document.getElementById("16_61_member").childNodes[0].id).appendTo(document.getElementById(current_character));
          }
          break;
        }
      }
      sendCurrentStatus();
      sortIdleAllMemberList();
      //console.log("sort-end")
      resolve(1);
    })();
  })
}

function resetButton() {
  document.getElementById("reset").addEventListener("click", resetFunc);
}

function resetFunc(reset_duty) {
  if (!reset_duty) {
    console.log("false")
  } else {
    console.log("true")
  }
  
  for (let idx in document.getElementsByClassName("top_left")) {
    clean_elem = document.getElementsByClassName("top_left")[idx];
    if (clean_elem.id == "31_71_leader" || clean_elem.id == "91_92_leader" || clean_elem.id === undefined) {
      continue;
    }
    if (clean_elem.childNodes.length == 1) {
      $("#"+clean_elem.childNodes[0].id).appendTo(document.getElementById("idle"));
    }
  }
  if (reset_duty) {
    for (let idx in document.getElementsByClassName("cadre")) {
      clean_elem = document.getElementsByClassName("cadre")[idx];
      if (clean_elem.id === undefined) {
        continue;
      }
      if (clean_elem.querySelector("sup") != null) {
        clean_elem.innerText = clean_elem.id;
        clean_elem.dataset.duty = "none";
        clean_elem.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
      }
    }
    for (let idx in document.getElementsByClassName("member")) {
      clean_elem = document.getElementsByClassName("member")[idx];
      if (clean_elem.id === undefined) {
        continue;
      }
      if (clean_elem.querySelector("sup") != null) {
        clean_elem.innerText = clean_elem.id;
        clean_elem.dataset.duty = "none";
        clean_elem.style.backgroundColor = "rgba(240, 248, 248, 0.6)";
      }
    }
  }
  
  sendCurrentStatus();
  sortIdleAllMemberList();
}

function broadcastButton() {
  document.getElementById("broadcast").addEventListener("click", broadcastFunc);
}

function broadcastFunc() {
  let voices = window.speechSynthesis.getVoices()
  let u = new SpeechSynthesisUtterance();
  u.lang = 'zh-TW';
  u.rate = 1.2;
  /*setTimeout(() => {
    voices = window.speechSynthesis.getVoices()
    console.log(voices)
    u.voice = voices[5];
  }, 1000)*/
  
  window.speechSynthesis.cancel();
  
  let content = "出勤車輛";
  for (let car_i = 1; car_i <= 4; car_i++) {
    if ($('#car_'+car_i+'_broadcast').is(':checked')) {
      switch(document.getElementById("car_"+car_i+"_name").value) {
        case "11":
          content += "，邀邀車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "55":
          content += "，五五車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "16":
          content += "，邀六車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "61":
          content += "，六邀車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "331":
          content += "，中指車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "31":
          content += "，三邀車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "71":
          content += "，拐邀車"
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，帶隊官，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，駕駛，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，瞄子手，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "91":
          content += "，九邀車"
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，第三人，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "92":
          content += "，九兩車"
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，第三人，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        case "service":
          content += "，警備車"
          if (document.getElementById("car_"+car_i+"_driver").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_driver").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_member").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_member").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          if (document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
            content += "，" + document.getElementById("car_"+car_i+"_leader").childNodes[0].id.replace(/[0-9]/g, '').replace(/隊長/g, ' 隊長');
          }
          break;
        default:
          break;
      }
      console.log(content)
      $('#car_'+car_i+'_broadcast').prop('checked', false);
    }
  }
  if (content != "出勤車輛") {
    u.text = content;
    window.speechSynthesis.speak(u);
    window.speechSynthesis.speak(u);
  }
}

function removeNonCheckedDispatch(car_index) {
  for (let ele_i = 0; ele_i < TOP_RIGHT_ELEMENT.length; ele_i++) {
    if (document.getElementById("car_"+car_index+"_"+TOP_RIGHT_ELEMENT[ele_i]).childNodes.length != 0) {
      $("#"+document.getElementById("car_"+car_index+"_"+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id).appendTo(document.getElementById("idle"));
    }
  }
}

function emsButton() {
  document.getElementById("ems").addEventListener("click", emsDispatchFunc);
}

async function emsDispatchFunc() {
  let car_candidate = new Map();
  for (let car_i = 1; car_i <= 4; car_i++) {
    $('#car_'+car_i+'_broadcast').prop('checked', false);
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      removeNonCheckedDispatch(car_i);
      if (document.getElementById("car_"+car_i+"_name").value == "91" || document.getElementById("car_"+car_i+"_name").value == "92") {
        $('#car_'+car_i+'_broadcast').prop('checked', true);
        car_candidate.set(document.getElementById("car_"+car_i+"_name").value, car_i);
      }
    }
  }
  await sortFunc();
  let car_sort_list = []
  for (let i = 0; i < EMS_CAR.length; i++) {
    if (car_candidate.has(EMS_CAR[i])) {
      car_sort_list.push(car_candidate.get(EMS_CAR[i]));
    }
  }
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let dispatch_count = 1;
    for (let i = 0; i < EMS_ORDER.length; i++) {
      let candidate;
      console.log(EMS_ORDER[i])
      candidate = document.querySelector('.member[data-duty="' + EMS_ORDER[i] + '"], .cadre[data-duty="' + EMS_ORDER[i] + '"]')
      if (candidate != null) {
        if (candidate.parentNode.classList.contains("member_list") || candidate.parentNode.classList.contains("top_left")) {
          while (dispatch_count <= 2) {
            if (document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]).childNodes.length == 0) {
              $("#"+candidate.id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]));
              dispatch_count++;
              break;
            }
            dispatch_count++;
          }
        }
      }
      if (dispatch_count > 2) {
        break;
      }
    }
  }
  await sortFunc();
  /*let all_sup = document.querySelectorAll('.member > sup, .cadre > sup');
  for (let i = 0; i < all_sup.length; i++) {
    //document.querySelector(.member)
    console.log(all_sup[i].parentNode)
  }*/
}

function fireMiddleButton() {
  document.getElementById("fire_middle").addEventListener("click", fireMiddleDispatchFunc);
}

async function fireMiddleDispatchFunc() {
  let car_candidate = new Map();
  for (let car_i = 1; car_i <= 4; car_i++) {
    $('#car_'+car_i+'_broadcast').prop('checked', false);
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      removeNonCheckedDispatch(car_i);
      if (document.getElementById("car_"+car_i+"_name").value != "service" && document.getElementById("car_"+car_i+"_name").value != "none") {
        $('#car_'+car_i+'_broadcast').prop('checked', true);
        car_candidate.set(document.getElementById("car_"+car_i+"_name").value, car_i);
      }
    }
  }
  await sortFunc();

  for (let t = 0; t < document.getElementsByClassName("top_left").length; t++) {
    if (document.getElementsByClassName("top_left")[t].childNodes.length != 0) {
      console.log(document.getElementsByClassName("top_left")[t].childNodes[0])
    }
  }
  let car_sort_list = [];
  let hasMain = false;
  let driver_331 = "";
  // 依照救災車輛順序依序檢查
  for (let i = 0; i < FIRE_CAR.length; i++) {
    // 如果有被選中
    if (car_candidate.has(FIRE_CAR[i])) {
      let car_i = car_candidate.get(FIRE_CAR[i])
      // 將當前車輛加入之後遞補檢查名單
      car_sort_list.push(car_i);
      let top_left_prefix = "";
      // 選取對應的人車編組表前綴
      switch(FIRE_CAR[i]) {
        case "11":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "55":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "16":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "61":
          top_left_prefix = "16_61_";
          break;
        case "331":
          top_left_prefix = "331_";
          break;
        case "31":
          top_left_prefix = "31_71_";
          break;
        case "71":
          top_left_prefix = "31_71_";
          break;
        case "91":
          top_left_prefix = "91_92_";
          break;
        case "92":
          top_left_prefix = "91_92_";
          break;
        default:
          top_left_prefix = "";
          break;
      }
      console.log(top_left_prefix)
      if (top_left_prefix != "") {
        // 依照帶隊官、駕駛、瞄子手(隊員)的順序填入
        for (let ele_i = 0; ele_i < TOP_RIGHT_ELEMENT.length; ele_i++) {
          // 若當前位置為帶隊官且無主力車及非331
          if (!hasMain && TOP_RIGHT_ELEMENT[ele_i] == "leader" && FIRE_CAR[i] != "331") {
            // 若有第一幹部，填入第一幹部
            if (document.getElementById("11_55_leader").childNodes.length != 0) {
              $("#"+document.getElementById("11_55_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
              hasMain = true;
              continue;
            }
          }
          // 若人車編組表有對應的人員即填入
          if (document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes.length != 0) {
            $("#"+document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
            // 紀錄331司機，若之後有缺則優先以331司機遞補
            if (top_left_prefix+TOP_RIGHT_ELEMENT[ele_i] == "331_driver") {
              driver_331 = document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id;
            }
          }
        }
      }
    }
  }
  // 遞補檢查 - 若無駕駛
  console.log(car_sort_list)
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    if (document.getElementById("car_"+car_i+"_driver").childNodes.length == 0) {
      // 由後往前遞補
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_driver"));
          break;
        }
        m_idx++;
      }
      // 若人車編組表已無人可選且有331司機，以331司機遞補
      if (m_idx == MEMBER_ORDER.length-1 && driver_331 != "") {
        $("#"+driver_331).appendTo(document.getElementById("car_"+car_i+"_driver"));
        driver_331 = "";
      }
    }
  }
  // 遞補檢查 - 若無瞄子手(隊員)
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    // 331不需隊員
    if (document.getElementById("car_"+car_i+"_name").value == "331") {
      continue;
    }
    // 若無帶隊官且無隊員
    if (document.getElementById("car_"+car_i+"_leader").childNodes.length == 0 && document.getElementById("car_"+car_i+"_member").childNodes.length == 0) {
      // 由後往前遞補
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_member"));
          break;
        }
        m_idx++;
      }
      // 若人車編組表已無人可選且有第二幹部，且當前車輛非91、92，以第二幹部遞補
      if (m_idx == MEMBER_ORDER.length-1 && document.getElementById("16_61_leader").childNodes.length != 0) {
        if (document.getElementById("car_"+car_i+"_name").value != "91" && document.getElementById("car_"+car_i+"_name").value != "92") {
          $("#"+document.getElementById("16_61_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_member"));
        }
      }
    }
  }
  await sortFunc();
}

function fireBigButton() {
  document.getElementById("fire_big").addEventListener("click", fireBigDispatchFunc);
}

async function fireBigDispatchFunc() {
  let car_candidate = new Map();
  for (let car_i = 1; car_i <= 4; car_i++) {
    $('#car_'+car_i+'_broadcast').prop('checked', false);
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      removeNonCheckedDispatch(car_i);
      if (document.getElementById("car_"+car_i+"_name").value != "service" && document.getElementById("car_"+car_i+"_name").value != "none") {
        $('#car_'+car_i+'_broadcast').prop('checked', true);
        car_candidate.set(document.getElementById("car_"+car_i+"_name").value, car_i);
      }
    }
  }
  await sortFunc();
  let car_sort_list = [];
  let hasMain = false;
  let driver_331 = "";
  // 依照救災車輛順序依序檢查
  for (let i = 0; i < FIRE_CAR.length; i++) {
    // 如果有被選中
    if (car_candidate.has(FIRE_CAR[i])) {
      let car_i = car_candidate.get(FIRE_CAR[i])
      // 將當前車輛加入之後遞補檢查名單
      car_sort_list.push(car_i);
      let top_left_prefix = "";
      // 選取對應的人車編組表前綴
      switch(FIRE_CAR[i]) {
        case "11":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "55":
          top_left_prefix = "11_55_";
          break;
        case "16":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "61":
          top_left_prefix = "16_61_";
          break;
        case "331":
          top_left_prefix = "331_";
          break;
        case "31":
          top_left_prefix = "31_71_";
          break;
        case "71":
          top_left_prefix = "31_71_";
          break;
        case "91":
          top_left_prefix = "91_92_";
          break;
        case "92":
          top_left_prefix = "91_92_";
          break;
        default:
          top_left_prefix = "";
          break;
      }
      console.log(top_left_prefix)
      if (top_left_prefix != "") {
        // 依照帶隊官、駕駛、瞄子手(隊員)的順序填入
        for (let ele_i = 0; ele_i < TOP_RIGHT_ELEMENT.length; ele_i++) {
          // 若為55車則不需成員(兩人出勤)
          if (FIRE_CAR[i] == "55" && TOP_RIGHT_ELEMENT[ele_i] == "member") {
            continue;
          }
          // 若當前位置為帶隊官且無主力車及非331
          if (!hasMain && TOP_RIGHT_ELEMENT[ele_i] == "leader" && FIRE_CAR[i] != "331") {
            // 若有第一幹部，填入第一幹部
            if (document.getElementById("11_55_leader").childNodes.length != 0) {
              $("#"+document.getElementById("11_55_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
              hasMain = true;
              continue;
            }
          }
          // 若人車編組表有對應的人員即填入
          if (document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes.length != 0) {
            $("#"+document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
            // 紀錄331司機，若之後有缺則優先以331司機遞補
            if (top_left_prefix+TOP_RIGHT_ELEMENT[ele_i] == "331_driver") {
              driver_331 = document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id;
            }
          }
        }
      }
    }
  }
  // 遞補檢查 - 若無駕駛
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    if (document.getElementById("car_"+car_i+"_driver").childNodes.length == 0) {
      // 由後往前遞補
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_driver"));
          break;
        }
        m_idx++;
      }
      // 若人車編組表已無人可選且有331司機，以331司機遞補
      if (m_idx == MEMBER_ORDER.length-1 && driver_331 != "") {
        $("#"+driver_331).appendTo(document.getElementById("car_"+car_i+"_driver"));
        driver_331 = "";
      }
    }
  }
  // 遞補檢查 - 若無瞄子手(隊員)
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    // 331不需隊員
    if (document.getElementById("car_"+car_i+"_name").value == "331") {
      continue;
    }
    // 若無幹部且無隊員，遞補(一車最多兩人)
    if (document.getElementById("car_"+car_i+"_leader").childNodes.length == 0 && document.getElementById("car_"+car_i+"_member").childNodes.length == 0) {
      // 由後往前遞補
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_member"));
          break;
        }
        m_idx++;
      }
      // 若人車編組表已無人可選且有第二幹部，且當前車輛非91、92，以第二幹部遞補
      if (m_idx == MEMBER_ORDER.length-1 && document.getElementById("16_61_leader").childNodes.length != 0) {
        if (document.getElementById("car_"+car_i+"_name").value != "91" && document.getElementById("car_"+car_i+"_name").value != "92") {
          $("#"+document.getElementById("16_61_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_member"));
        }
      }
    }
  }
  await sortFunc();
}

function fireOtherButton() {
  document.getElementById("fire_other").addEventListener("click", fireOtherDispatchFunc);
}

async function fireOtherDispatchFunc() {
  let car_candidate = new Map();
  for (let car_i = 1; car_i <= 4; car_i++) {
    $('#car_'+car_i+'_broadcast').prop('checked', false);
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      removeNonCheckedDispatch(car_i);
      if (document.getElementById("car_"+car_i+"_name").value != "service" && document.getElementById("car_"+car_i+"_name").value != "none") {
        $('#car_'+car_i+'_broadcast').prop('checked', true);
        car_candidate.set(document.getElementById("car_"+car_i+"_name").value, car_i);
      }
    }
  }
  await sortFunc();
  let car_sort_list = [];
  let hasMain = false;
  let driver_331 = "";
  for (let i = 0; i < FIRE_CAR.length; i++) {
    if (car_candidate.has(FIRE_CAR[i])) {
      let car_i = car_candidate.get(FIRE_CAR[i])
      car_sort_list.push(car_i);
      let top_left_prefix = "";
      switch(FIRE_CAR[i]) {
        case "11":
          top_left_prefix = "11_55_";
          hasMain = true;
          break;
        case "55":
          top_left_prefix = "11_55_";
          break;
        case "16":
          top_left_prefix = "11_55_";
          break;
        case "61":
          top_left_prefix = "16_61_";
          break;
        case "331":
          top_left_prefix = "331_";
          break;
        case "31":
          top_left_prefix = "31_71_";
          break;
        case "71":
          top_left_prefix = "31_71_";
          break;
        case "91":
          top_left_prefix = "91_92_";
          break;
        case "92":
          top_left_prefix = "91_92_";
          break;
        default:
          top_left_prefix = "";
          break;
      }
      console.log(top_left_prefix)
      if (top_left_prefix != "") {
        for (let ele_i = 0; ele_i < TOP_RIGHT_ELEMENT.length; ele_i++) {
          if (FIRE_CAR[i] != "11") {
            if (TOP_RIGHT_ELEMENT[ele_i] == "leader" && FIRE_CAR[i] == "331") {
              if (document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes.length != 0) {
                $("#"+document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
              }
              continue;
            }
            if (!hasMain && TOP_RIGHT_ELEMENT[ele_i] == "leader" && document.getElementById("16_61_leader").childNodes.length == 0) {
              continue;
            }
            if (!hasMain && TOP_RIGHT_ELEMENT[ele_i] == "leader" && FIRE_CAR[i] != "331" && FIRE_CAR[i] != "91" && FIRE_CAR[i] != "92") {
              if (document.getElementById("11_55_leader").childNodes.length != 0) {
                $("#"+document.getElementById("11_55_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
                hasMain = true;
                continue;
              }
            }
            if ((FIRE_CAR[i] == "55" || FIRE_CAR[i] == "16") && TOP_RIGHT_ELEMENT[ele_i] == "member" && document.getElementById("car_"+car_i+"_leader").childNodes.length != 0) {
              continue;
            }
            if (top_left_prefix+TOP_RIGHT_ELEMENT[ele_i] == "16_61_leader") {
              continue;
            }
          }
          if (document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes.length != 0) {
            $("#"+document.getElementById(top_left_prefix+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]));
            if (top_left_prefix+TOP_RIGHT_ELEMENT[ele_i] == "331_driver") {
              driver_331 = document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[ele_i]).childNodes[0].id;
            }
          }
        }
      }
    }
  }
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    if (document.getElementById("car_"+car_i+"_driver").childNodes.length == 0) {
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_driver"));
          break;
        }
        m_idx++;
      }
      if (m_idx == MEMBER_ORDER.length-1 && driver_331 != "") {
        $("#"+driver_331).appendTo(document.getElementById("car_"+car_i+"_driver"));
        driver_331 = "";
      }
    }
  }
  for (let j = 0; j < car_sort_list.length; j++) {
    let car_i = car_sort_list[j];
    let m_idx = 0;
    if (document.getElementById("car_"+car_i+"_name").value == "331") {
      continue;
    }
    if (document.getElementById("car_"+car_i+"_leader").childNodes.length == 0 && document.getElementById("car_"+car_i+"_member").childNodes.length == 0) {
      while (m_idx < MEMBER_ORDER.length-1) {
        if (document.getElementById(MEMBER_ORDER[m_idx]).childNodes.length != 0) {
          $("#"+document.getElementById(MEMBER_ORDER[m_idx]).childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_member"));
          break;
        }
        m_idx++;
      }
    }
  }
  await sortFunc();
}

function otherButton() {
  document.getElementById("other").addEventListener("click", otherDispatchFunc);
}

async function otherDispatchFunc() {
  for (let car_i = 1; car_i <=4; car_i++) {
    $('#car_'+car_i+'_broadcast').prop('checked', false);
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      removeNonCheckedDispatch(car_i);
    }
  }
  await sortFunc();
  for (let car_i = 1; car_i <=4; car_i++) {
    if (!$('#car_'+car_i+'_out').is(':checked')) {
      if (document.getElementById("car_"+car_i+"_name").value == "service") {
        $('#car_'+car_i+'_broadcast').prop('checked', true);
        let dispatch_count = 1;
        if (document.getElementById("11_55_leader").childNodes.length != 0 && document.getElementById("16_61_leader").childNodes.length != 0) {
          while (dispatch_count <= 2) {
            if (document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]).childNodes.length == 0) {
              $("#"+document.getElementById("11_55_leader").childNodes[0].id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]));
              dispatch_count++;
              break;
            }
            dispatch_count++;
          }
        }
        for (let i = 0; i < OTHER_ORDER.length; i++) {
          let candidate;
          console.log(OTHER_ORDER[i])
          candidate = document.querySelector('.member[data-duty="' + OTHER_ORDER[i] + '"], .cadre[data-duty="' + OTHER_ORDER[i] + '"]')
          if (candidate != null) {
            if (candidate.parentNode.classList.contains("member_list") || candidate.parentNode.classList.contains("top_left")) {
              while (dispatch_count <= 2) {
                if (document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]).childNodes.length == 0) {
                  $("#"+candidate.id).appendTo(document.getElementById("car_"+car_i+"_"+TOP_RIGHT_ELEMENT[dispatch_count]));
                  dispatch_count++;
                  break;
                }
                dispatch_count++;
              }
            }
          }
          if (dispatch_count > 2) {
            break;
          }
        }
        break;
      }
    }
  }
  await sortFunc();
}

function currentDutySelect() {
  var top_right_select = document.querySelectorAll(".current_duty").forEach( function(element) {
    element.addEventListener('change', currentDutySelectFunc);
    element.dataset.current_duty_name = element.value;
  });
}

function currentDutySelectFunc() {
  sendCurrentStatus();
  //sortIdleAllMemberList();
} 

function nextDuty(current_duty) {
  for (let i = DUTY_ORDER.indexOf(current_duty) + 1; i < DUTY_ORDER.length; i++) { 
    if (!isDutyExisted(DUTY_ORDER[i])) {
      return DUTY_ORDER[i];
    }
  }
  return "none";
}

function isDutyExisted(duty_name) {
  let all_sup = document.querySelectorAll('.member > sup, .cadre > sup');
  for (let i = 0; i < all_sup.length; i++) {
    if (all_sup[i].innerText == duty_name) {
      return true;
    }
  }
  return false;
}