document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem('accessToken')) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("addActBtn").style.display = "block";
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
        document.getElementById("loginSection").style.display = "none";
    }
});

var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem('accessToken');
        window.location.reload();
    });
}

function checkTokenExpiration() {
    var token = localStorage.getItem('accessToken');

    if (token) {
        var decodedToken = decodeJwt(token);
        console.log(decodedToken);
        var expirationTime = decodedToken.exp * 1000;

        if (expirationTime < Date.now()) {
            logoutUser();
        } else {
            setTimeout(checkTokenExpiration, expirationTime - Date.now());
        }
    }
}

function logoutUser() {
    localStorage.removeItem('accessToken');
    window.location.href = "strona_glowna.html";
}

checkTokenExpiration();

function decodeJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}