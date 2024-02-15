document.getElementById('urlCheckbox').addEventListener('change', function() {
    var urlInputs = document.getElementById('urlInputs');
    urlInputs.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('localCheckbox').addEventListener('change', function() {
    var localInputs = document.getElementById('localInputs');
    localInputs.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('physicalCheckbox').addEventListener('change', function() {
    var physicalInputs = document.getElementById('physicalInputs');
    physicalInputs.style.display = this.checked ? 'block' : 'none';
});


const jwtToken = localStorage.getItem("accessToken");

document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:8000/locations/', {
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(locations => {
        console.log('Odpowiedź z serwera:', locations);

        const exampleLocationSelect = document.getElementById('actLocation');
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.text = `${location.voivodeship}, ${location.country}, ${location.community}, ${location.postalcode}, ${location.city}, ${location.parish}, ${location.address}`;
            exampleLocationSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching locations:', error.message);
    });
});


function submitForm() {
    document.getElementById("formDataError").style.display = "none";
    document.getElementById("formSuccessMessage").style.display = "none";
    document.getElementById("formErrorMessage").style.display = "none";

    const eventDateElement = document.getElementById('eventDate');
    const eventDateValue = eventDateElement.value;

    if (!isValidDate(eventDateValue)) {
        document.getElementById("formDataError").style.display = "block";
        return;
    }

    const formData = {
        entry: {
            date: new Date(document.getElementById('eventDate').value).toISOString(),
            text: document.getElementById('eventDescription').value,
            language: document.getElementById('otherLanguage').value,
            originallanguage: document.getElementById('originalLanguage').value,
            translator: document.getElementById('translator').value,
            celebrant: document.getElementById('celebrant').value,
            istemporary: true,
            city: document.getElementById('eventLocation').value
            // idstring: "string",
            // localization: 0,
            // originalentry: 0
        },
        url: [],
        local: [],
        physical: [],
        location: {
            country: document.getElementById('country').value,
            voivodeship: document.getElementById('voivodeship').value,
            community: document.getElementById('community').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
            postalcode: parseInt(document.getElementById('postalcode').value),
            parish: document.getElementById('parish').value
        },
        person: [],
        relationships: []
    };

    if (document.getElementById('urlCheckbox').checked) {
        const numberOfUrls = document.getElementById('numberOfUrls').value;
        for (let i = 1; i <= numberOfUrls; i++) {
            const urlData = {
                idurl: 0,
                url: document.getElementById(`url${i}`).value,
                condition: document.getElementById(`conditionUrl${i}`).value
            };
            formData.url.push(urlData);
        }
    }

    if (document.getElementById('localCheckbox').checked) {
        const numberOfLocals = document.getElementById('numberOfLocals').value;
        for (let i = 1; i <= numberOfLocals; i++) {
            const localData = {
                idpath: 0,
                localpath: document.getElementById(`localPath${i}`).value,
                condition: document.getElementById(`conditionLocal${i}`).value
            };
            formData.local.push(localData);
        }
    }

    if (document.getElementById('physicalCheckbox').checked) {
        const numberOfPhysicals = document.getElementById('numberOfPhysicals').value;
        for (let i = 1; i <= numberOfPhysicals; i++) {
            const physicalData = {
                tomenumber: parseInt(document.getElementById(`volumeNumber${i}`).value),
                page: parseInt(document.getElementById(`page${i}`).value),
                condition: document.getElementById(`conditionPhysical${i}`).value,
                type: document.getElementById(`type${i}`).value,
                signature: document.getElementById(`signature${i}`).value,
                actnumber: parseInt(document.getElementById(`actNumber${i}`).value),
                idphys: 0,
                localaddressid: 0
            };
            formData.physical.push(physicalData);
        }
    }

    const numberOfPeople = document.getElementById('numberOfPeople').value;
    for (let i = 1; i <= numberOfPeople; i++) {
        const personData = {
            // pfid: parseInt(document.getElementById(`pfid${i}`).value),
            // cfid: parseInt(document.getElementById(`cfid${i}`).value),
            // marriage: parseInt(document.getElementById(`marriage${i}`).value),
            name: document.getElementById(`personName${i}`).value,
            surname: document.getElementById(`personLastName${i}`).value,
            // birth: document.getElementById(`birth${i}`).value,
            // death: document.getElementById(`death${i}`).value
        };
        formData.person.push(personData);
    }

    const numberOfRelationships = document.getElementById('numberOfPeople').value;
    for (let i = 1; i <= numberOfRelationships; i++) {
        const relationshipData = {
            insiderole: document.getElementById(`personRole${i}`).value,
            idpersons: 0,
            // marriageentriesuuid: parseInt(document.getElementById(`marriageEntriesUuid${i}`).value),
            // birthentriesuuid: parseInt(document.getElementById(`birthEntriesUuid${i}`).value),
            // deathentriesuuid: parseInt(document.getElementById(`deathEntriesUuid${i}`).value)
        };
        formData.relationships.push(relationshipData);
    }
    
    console.log(JSON.stringify(formData, null, 2));

    // Sprawdź rodzaj aktu
    const actType = document.getElementById('actType').value;
    let apiUrl;

    if (document.getElementById('actLocation').value === 'nope') {
        apiUrl = `http://127.0.0.1:8000/records/${actType}`;
    } else {
        const locationId = document.getElementById('actLocation').value;
        
        switch (actType) {
            case 'birth':
                apiUrl = `http://127.0.0.1:8000/records/birth?localization_id=${locationId}`;
                break;
            case 'death':
                apiUrl = `http://127.0.0.1:8000/records/death?localization_id=${locationId}`;
                break;
            case 'marriage':
                apiUrl = `http://127.0.0.1:8000/records/marriage?localization_id=${locationId}`;
                break;
            default:
                console.error('Nieznany rodzaj aktu');
                return;
        }
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        clearForm();

        console.log('Odpowiedź z serwera:', data);
        document.getElementById("formSuccessMessage").style.display = "block";
    })
    .catch(error => {
        console.error('Błąd podczas wysyłania danych:', error);
        document.getElementById("formErrorMessage").style.display = "block";
    });
}

function showLocationForm() {
    const actLocation = document.getElementById('actLocation');
    const locationForm = document.getElementById('locationForm');

    if (actLocation.value === 'brak') {
        locationForm.style.display = 'block';
    } else {
        locationForm.style.display = 'none';
    }
}

document.getElementById('urlCheckbox').addEventListener('change', function() {
    var urlInputs = document.getElementById('urlInputs');
    var numberOfUrls = document.getElementById('numberOfUrls').value;

    if (this.checked) {
        urlInputs.style.display = 'block';
        generateUrlFields(numberOfUrls);
    } else {
        urlInputs.style.display = 'none';
        document.getElementById('urlFields').innerHTML = '';
    }
});

document.getElementById('numberOfUrls').addEventListener('input', function() {
    var numberOfUrls = this.value;
    generateUrlFields(numberOfUrls);
});

document.getElementById('localCheckbox').addEventListener('change', function() {
    var localInputs = document.getElementById('localInputs');
    var numberOfLocals = document.getElementById('numberOfLocals').value;

    if (this.checked) {
        localInputs.style.display = 'block';
        generateLocalFields(numberOfLocals);
    } else {
        localInputs.style.display = 'none';
        document.getElementById('localFields').innerHTML = '';
    }
});

document.getElementById('numberOfLocals').addEventListener('input', function() {
    var numberOfLocals = this.value;
    generateLocalFields(numberOfLocals);
});

document.getElementById('physicalCheckbox').addEventListener('change', function() {
    var physicalInputs = document.getElementById('physicalInputs');
    var numberOfPhysicals = document.getElementById('numberOfPhysicals').value;

    if (this.checked) {
        physicalInputs.style.display = 'block';
        generatePhysicalFields(numberOfPhysicals);
    } else {
        physicalInputs.style.display = 'none';
        document.getElementById('physicalFields').innerHTML = '';
    }
});

document.getElementById('numberOfPhysicals').addEventListener('input', function() {
    var numberOfPhysicals = this.value;
    generatePhysicalFields(numberOfPhysicals);
});

document.getElementById('numberOfPeople').addEventListener('input', function() {
    var numberOfPeople = this.value;
    generatePeopleFields(numberOfPeople);
});

function generateUrlFields(numberOfUrls) {
    var urlFieldsContainer = document.getElementById('urlFields');
    urlFieldsContainer.innerHTML = '';

    for (var i = 0; i < numberOfUrls; i++) {
        var urlField = createFormSection('Forma linku ' + (i + 1) + ':');

        var urlNameField = createFormRow('URL:');
        var inputUrl = createInput('text', 'form-control', 'url' + (i + 1));
        urlNameField.appendChild(inputUrl);

        var conditionField = createFormRow('Kondycja dokument:');
        var inputCondition = createInput('text', 'form-control', 'conditionUrl' + (i + 1));
        conditionField.appendChild(inputCondition);

        urlField.appendChild(urlNameField);
        urlField.appendChild(conditionField);

        urlFieldsContainer.appendChild(urlField);
    }
}

function generateLocalFields(numberOfLocals) {
    var localFieldsContainer = document.getElementById('localFields');
    localFieldsContainer.innerHTML = '';

    for (var i = 0; i < numberOfLocals; i++) {
        var localField = createFormSection('Forma fizyczna ' + (i + 1) + ':');

        var localNameField = createFormRow('Lokalna ścieżka:');
        var inputLocalPath = createInput('text', 'form-control', 'localPath' + (i + 1));
        localNameField.appendChild(inputLocalPath);

        var conditionField = createFormRow('Kondycja dokumentu:');
        var inputCondition = createInput('text', 'form-control', 'conditionLocal' + (i + 1));
        conditionField.appendChild(inputCondition);

        localField.appendChild(localNameField);
        localField.appendChild(conditionField);

        localFieldsContainer.appendChild(localField);
    }
}

function generatePhysicalFields(numberOfPhysicals) {
    var physicalFieldsContainer = document.getElementById('physicalFields');
    physicalFieldsContainer.innerHTML = '';

    for (var i = 0; i < numberOfPhysicals; i++) {
        var physicalsField = createFormSection('Forma fizyczna ' + (i + 1) + ':');

        var typeField = createFormRow('Typ dokumentu:');
        var inputType = createInput('text', 'form-control', 'type' + (i + 1));
        typeField.appendChild(inputType);

        var volumeNumberField = createFormRow('Numer tomu:');
        var inputVolumeNumber = createInput('number', 'form-control', 'volumeNumber' + (i + 1));
        volumeNumberField.appendChild(inputVolumeNumber);

        var pageField = createFormRow('Strona:');
        var inputPage = createInput('number', 'form-control', 'page' + (i + 1));
        pageField.appendChild(inputPage);

        var actNumberField = createFormRow('Numer aktu:');
        var inputActNumber = createInput('number', 'form-control', 'actNumber' + (i + 1));
        actNumberField.appendChild(inputActNumber);

        var signatureField = createFormRow('Sygnatura:');
        var inputSignature = createInput('text', 'form-control', 'signature' + (i + 1));
        signatureField.appendChild(inputSignature);

        var conditionField = createFormRow('Kondycja dokumentu:');
        var inputCondition = createInput('text', 'form-control', 'conditionPhysical' + (i + 1));
        conditionField.appendChild(inputCondition);

        physicalsField.appendChild(typeField);
        physicalsField.appendChild(volumeNumberField);
        physicalsField.appendChild(pageField);
        physicalsField.appendChild(actNumberField);
        physicalsField.appendChild(signatureField);
        physicalsField.appendChild(conditionField);

        physicalFieldsContainer.appendChild(physicalsField);
    }
}


function generatePeopleFields(numberOfPeople) {
    var peopleFieldsContainer = document.getElementById('peopleFields');
    peopleFieldsContainer.innerHTML = '';

    for (var i = 0; i < numberOfPeople; i++) {
        var personField = createFormSection('Osoba ' + (i + 1) + ':');

        var nameField = createFormRow('Imię:');
        var inputName = createInput('text', 'form-control', 'personName' + (i + 1));
        nameField.appendChild(inputName);

        var lastNameField = createFormRow('Nazwisko:');
        var inputLastName = createInput('text', 'form-control', 'personLastName' + (i + 1));
        lastNameField.appendChild(inputLastName);

        var roleField = createFormRow('Rola:');
        var inputRole = createInput('text', 'form-control', 'personRole' + (i + 1));
        roleField.appendChild(inputRole);

        personField.appendChild(nameField);
        personField.appendChild(lastNameField);
        personField.appendChild(roleField);

        peopleFieldsContainer.appendChild(personField);
    }
}

function createFormRow(labelText) {
    var formRow = document.createElement('div');
    formRow.className = 'form-group';

    var label = document.createElement('label');
    label.innerHTML = labelText;
    formRow.appendChild(label);

    return formRow;
}

function createInput(type, className, id) {
    var input = document.createElement('input');
    input.type = type;
    input.className = className;
    input.id = id;

    if (type === 'number') {
        input.min = 1;
    }

    return input;
}

function createFormSection(labelText) {
    var formSection = document.createElement('div');
    formSection.className = 'form-section';

    var label = document.createElement('h3');
    label.innerHTML = labelText;
    formSection.appendChild(label);

    return formSection;
}

function clearForm() {
    document.getElementById('eventDate').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('otherLanguage').value = '';
    document.getElementById('originalLanguage').value = '';
    document.getElementById('translator').value = '';
    document.getElementById('celebrant').value = '';
    document.getElementById('eventLocation').value = '';

    document.getElementById('urlCheckbox').checked = false;
    document.getElementById('numberOfUrls').value = '';
    document.getElementById('urlFields').innerHTML = '';

    document.getElementById('localCheckbox').checked = false;
    document.getElementById('numberOfLocals').value = '';
    document.getElementById('localFields').innerHTML = '';

    document.getElementById('physicalCheckbox').checked = false;
    document.getElementById('numberOfPhysicals').value = '';
    document.getElementById('physicalFields').innerHTML = '';

    document.getElementById('actLocation').value = 'nope';
    document.getElementById('voivodeship').value = '';
    document.getElementById('country').value = '';
    document.getElementById('community').value = '';
    document.getElementById('postalcode').value = '';
    document.getElementById('city').value = '';
    document.getElementById('parish').value = '';
    document.getElementById('address').value = '';

    document.getElementById('numberOfPeople').value = '';
    document.getElementById('peopleFields').innerHTML = '';
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // Sprawdzenie czy data ma format "YYYY-MM-DD"
    return dateString.match(regex) !== null;
}