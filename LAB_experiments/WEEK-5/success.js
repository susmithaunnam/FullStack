let now = new Date();
let date =
    String(now.getDate()).padStart(2,'0') + "/" +
    String(now.getMonth()+1).padStart(2,'0') + "/" +
    now.getFullYear();
let hour = now.getHours();
let minute = String(now.getMinutes()).padStart(2,'0');
let second = String(now.getSeconds()).padStart(2,'0');
let ampm = hour >= 12 ? "PM" : "AM";
let greeting;
if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
}
else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
}
else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
}
else {
    greeting = "Good Night";
}
hour = hour % 12;
if(hour == 0)
    hour = 12;
document.getElementById("loginTime").innerHTML =
    greeting + "!<br>" +
    "Login Time : " + date + ", " + 
    hour + ":" + minute + ":" + second + " " + ampm;

let logoutTimer;

function resetTimer() {
    clearTimeout(logoutTimer);

    logoutTimer = setTimeout(logout, 10000); 
}
function logout() {
    document.getElementById("loginTime").innerHTML =
        "<b style='color:red'>Session Expired due to Inactivity!</b>";
    alert("You have been logged out due to inactivity.");
    window.location.href = "index.html";
}



document.addEventListener("mousemove", resetTimer);
document.addEventListener("keydown", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);
document.addEventListener("drag", resetTimer);
document.addEventListener("keyup",resetTimer);

// Start inactivity timer
resetTimer();