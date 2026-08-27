const defaultUsername = "admin";
const defaultPassword = "admin123";

function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let error = document.getElementById("error");
    error.innerHTML = "";
    if(username === "" && password === ""){
        error.innerHTML = "Username and Password are required.";
        return;
    }
    if(username === ""){
        error.innerHTML = "Username is required.";
        return;
    }
    if(password === ""){
        error.innerHTML = "Password is required.";
        return;
    }
    if(username === defaultUsername && password === defaultPassword){
        window.location.href = "success.html";
    }
    else{
        error.innerHTML = "Invalid Username or Password.";
    }
}