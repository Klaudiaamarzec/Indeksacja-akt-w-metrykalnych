function handleLoginClick() {
    document.getElementById("loginErrorMessage").style.display = "none";
    document.getElementById("loginInvalidCredentialsError").style.display = "none";
    document.getElementById("loginEmptyFieldsError").style.display = "none";

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    // Sprawdź puste pola
    if (!username.value || !password.value) {
        document.getElementById("loginEmptyFieldsError").style.display = "block";

        username.setCustomValidity(!username.value ? "Wprowadź nazwę użytkownika" : "");
        password.setCustomValidity(!password.value ? "Wprowadź hasło" : "");
    } else {
        document.getElementById("loginEmptyFieldsError").style.display = "none";

        username.setCustomValidity("");
        password.setCustomValidity("");
        loginUser();
    }
}

function loginUser() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    var data = new URLSearchParams();
    data.append('grant_type', '');
    data.append('username', username);
    data.append('password', password);
    data.append('scope', '');
    data.append('client_id', '');
    data.append('client_secret', '');

    fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        } else if (!response.ok) {
            console.log('Error:', response.status);
            document.getElementById("loginInvalidCredentialsError").style.display = "block";
        }
    })
    .then(data => {
        console.log('Server response:', data);
        if (data && data.access_token) {
            localStorage.setItem('accessToken', data.access_token);

            var decodedToken = decodeJwt(localStorage.getItem('accessToken'));

            console.log("Zdekodowany token JWT:", decodedToken);

            window.location.href = "strona_glowna.html";

        } else if (data && data.detail === "Incorrect username or password") {
            document.getElementById("loginInvalidCredentialsError").style.display = "block";
        }
    })
    .catch((error) => {
        document.getElementById("loginErrorMessage").style.display = "block";
    });
}


function decodeJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
