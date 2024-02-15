
function handleRegistrationClick() {
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("registrationMessage").style.display = "none";
    document.getElementById("emailAlreadyRegisteredError").style.display = "none";
    document.getElementById("emptyFieldsError").style.display = "none";
    document.getElementById("shortPasswordError").style.display = "none";

    const username = document.getElementById("newUsername");
    const password = document.getElementById("newPassword");

    if (!username.value || !password.value) {
        document.getElementById("emptyFieldsError").style.display = "block";
        document.getElementById("shortPasswordError").style.display = "none";

        username.setCustomValidity(!username.value ? "Wprowadź nazwę użytkownika" : "");
        password.setCustomValidity(!password.value ? "Wprowadź hasło" : "");
    } else if (password.value.length < 8) {
        document.getElementById("emptyFieldsError").style.display = "none";
        document.getElementById("shortPasswordError").style.display = "block";

        username.setCustomValidity("");
        password.setCustomValidity("Hasło musi mieć co najmniej 8 znaków");
    } else {
        document.getElementById("emptyFieldsError").style.display = "none";
        document.getElementById("shortPasswordError").style.display = "none";

        username.setCustomValidity("");
        password.setCustomValidity("");
        registerUser();
    }
}

function registerUser() {
    var username = document.getElementById("newUsername").value;
    var password = document.getElementById("newPassword").value;
    var role = document.getElementById("role").value;

    var data = {
        username: username,
        password: password,
        idrole: role
    };

    fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.status === 201) {
            return response.json();
        } else if (!response.ok) {
            console.log('Error:', response.status);
            document.getElementById("emailAlreadyRegisteredError").style.display = "block";
        }
    })
    .then(data => {
        console.log('Server response:', data);
        if (data && data.message) {
            if (data.message === "user created successfully") {
                document.getElementById("registrationMessage").style.display = "block";

                usernameInput.value = "";
                passwordInput.value = "";
                roleInput.value = "";
            } else if (data.message === "Email already registered") {
                document.getElementById("emailAlreadyRegisteredError").style.display = "block";
            } else {
                document.getElementById("errorMessage").style.display = "block";
            }
        }
    })
    .catch((error) => {
        document.getElementById("errorMessage").style.display = "block";
    });
}
