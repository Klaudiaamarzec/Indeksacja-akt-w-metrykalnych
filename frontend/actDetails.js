// Wywołaj funkcję po załadowaniu strony
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const actId = urlParams.get('actId');
    const actType = urlParams.get('actType');

    if (actId && actType) {
        // Wyszukaj dane na podstawie imienia i nazwiska
        showActDetails(actId, actType);
    } else {
        // Brak imienia i nazwiska w parametrach URL
        console.error("Brak wymaganych parametrów");
    }
});

const jwtToken = localStorage.getItem("accessToken");

// Główna funkcja obsługująca wyświetlanie szczegółów aktu
function showActDetails(actId, actType) {

    // Przekieruj do strony wyników
    //window.location.href = `akt.html?`;

    /*if(actId) {
        getActDetails(actId, actType)
            .then(data => {
                displayActDetails(data);
            })
            .catch(error => {
                console.error('Wystąpił błąd podczas wyświetlania danych:', error);
            });
    } else {
        console.error('Nie udało się uzyskać identyfikatora aktu z adresu URL.');
    }*/

    if (actId) {
        getActDetails(actId, actType)
            .then(actData => {
                // Wywołaj getLocation() po uzyskaniu danych z getActDetails()
                return getLocation().then(locationData => {
                    return { actData, locationData };
                });
            })
            .then(({ actData, locationData }) => {
                // Przekazuj obiekt data (actData) i locations (locationData) do funkcji displayActDetails
                displayActDetails(actData, locationData);
            })
            .catch(error => {
                console.error('Wystąpił błąd podczas wyświetlania danych:', error);
            });
    } else {
        console.error('Nie udało się uzyskać identyfikatora aktu z adresu URL.');
    }
}

// Pobierz dane aktu na podstawie identyfikatora
function getActDetails(actId, actType) {

    let apiUrl;

    switch(actType)
    {
        case 'birth':
            apiUrl = `http://127.0.0.1:8000/records/birth/${actId}`;
            break;

        case 'death':
            apiUrl = `http://127.0.0.1:8000/records/death/${actId}`;
            break;

        case 'marriage':
            apiUrl = `http://127.0.0.1:8000/records/marriage/${actId}`;
            break;

        default:
            console.error("Nieznany rodzaj aktu");
            return;
    }

    return fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Tutaj możesz manipulować danymi z odpowiedzi
            console.log(data);
            return data;
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
        });
}

function getLocation()
{
    return fetch('http://127.0.0.1:8000/locations/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Tutaj możesz manipulować danymi z odpowiedzi
            //console.log(data);
            return data;
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas pobierania lokalizacji:', error);
        });
}

// Wyświetl szczegóły aktu na stronie
function displayActDetails(data, locations) {
    // Tutaj możesz manipulować DOM-em i wyświetlać szczegóły aktu
    //console.log("Wyswietla");
    const actDetailsContainer = document.getElementById('actDetails');

    // Sprawdź, czy actDetailsContainer został znaleziony
    if (!actDetailsContainer) {
        console.error('Element actDetailsContainer nie został znaleziony.');
        return;
    }

    // Wyczyść poprzednie wyniki
    actDetailsContainer.innerHTML = '';

    if (data.length === 0)
    {
        actDetailsContainer.innerHTML = "<p>Brak wyników dla podanych kryteriów wyszukiwania.</p>";
    }
    else
    {
        const entry = data["entry"];

        // Utwórz tabelę
        const table = document.createElement("table");
        table.className = "tableResult";

        // Utwórz wiersz dla daty, języka, celebranta i miasta
        let headerRow = document.createElement("tr");

        const headersMapping = {
            "Date": "Data",
            "city": "Miejscowość",
            "celebrant": "Osoba udzielająca sakramentu",
            "language": "Język",
            "originallanguage" : "Oryginalny język",
            "translator" : "Tłumaczenie"
        };

        let colCount = 0; // Licznik kolumn

        Object.keys(headersMapping).forEach(key => {
            // Sprawdź, czy istnieje klucz w obiekcie entry
            if (entry.hasOwnProperty(key)) {
                const td = document.createElement("td");
                td.textContent = `${headersMapping[key]}: ${entry[key]}`;
                headerRow.appendChild(td);
            }

            colCount++;

            // Dodaj nowy wiersz po trzech elementach w pierwszym wierszu
            if (colCount === 3) {
                table.appendChild(headerRow);
                headerRow = document.createElement("tr");
                colCount = 0;
            }
        });

        // Sprawdź, czy istnieje niepełny wiersz i dodaj go
        if (colCount > 0) {
            table.appendChild(headerRow);
        }

        // linie oddzielające
        let separatorRow = document.createElement("tr");
        let separatorCell = document.createElement("td");
        separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
        separatorCell.innerHTML = "<hr>";
        separatorRow.appendChild(separatorCell);
        table.appendChild(separatorRow);

        const localization = entry["localization"];

        let personsLabelRow = document.createElement("tr");
        let personsLabelCell = document.createElement("td");
        personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
        personsLabelRow.classList.add("narrow-row");
        personsLabelCell.innerHTML = '<strong>Lokalizacja wydarzenia:</strong>';
        personsLabelRow.appendChild(personsLabelCell);
        table.appendChild(personsLabelRow);

        let local;

        locations.forEach(location => {

            if(location["id"] === localization)
                local = location;

        })

        //console.log("Lokalizacja");
        //console.log(local);

        // Komórka ze zmienną text
        let LocalRow = document.createElement("tr");
        let LocalCell = document.createElement("td");
        LocalCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
        LocalCell.textContent = `Parafia: ${local["parish"]}`; // Przypisz wartość zmiennej text
        LocalRow.appendChild(LocalCell);
        table.appendChild(LocalRow);

        // Wiersz i komórka z adresem
        let addressRow = document.createElement("tr");
        let addressCell = document.createElement("td");
        addressCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
        addressCell.textContent = `${local["address"]} ${local["city"]}, ${local["community"]}, województwo ${local["voivodeship"]}, ${local["postalcode"]} ${local["country"]}`;
        addressRow.appendChild(addressCell);
        table.appendChild(addressRow);

        // linie oddzielające
        separatorRow = document.createElement("tr");
        separatorCell = document.createElement("td");
        separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
        separatorCell.innerHTML = "<hr>";
        separatorRow.appendChild(separatorCell);
        table.appendChild(separatorRow);

        if(entry["text"] !== null)
        {
            let personsLabelRow = document.createElement("tr");
            let personsLabelCell = document.createElement("td");
            personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            personsLabelRow.classList.add("narrow-row");
            personsLabelCell.innerHTML = '<strong>Tekst:</strong>';
            //personsLabelCell.textContent = "Tekst:";
            personsLabelRow.appendChild(personsLabelCell);
            table.appendChild(personsLabelRow);

            // Komórka z zmienną text
            let textRow = document.createElement("tr");
            let textCell = document.createElement("td");
            textCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            textCell.textContent = entry["text"]; // Przypisz wartość zmiennej text
            textRow.appendChild(textCell);
            table.appendChild(textRow);

            // linie oddzielające
            separatorRow = document.createElement("tr");
            separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);
        }

        const persons = data["person"] || [];

        if (persons.length > 0) {

            personsLabelRow = document.createElement("tr");
            personsLabelCell = document.createElement("td");
            personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            personsLabelRow.classList.add("narrow-row");
            personsLabelCell.innerHTML = '<strong>Osoby wystepujące w akcie:</strong>';
            personsLabelRow.appendChild(personsLabelCell);
            table.appendChild(personsLabelRow);

            const personsRow = document.createElement("tr");
            const personsCell = document.createElement("td");
            personsCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli

            // Sklej imiona i nazwiska osób, oddzielając przecinkiem
            const personsNames = persons.map(person => `${person["name"]} ${person["surname"]}`).join(', ');

            personsCell.textContent = `${personsNames}`;
            personsRow.appendChild(personsCell);
            table.appendChild(personsRow);

            /*let separatorRow = document.createElement("tr");
            let separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);*/

            // linie oddzielające
            separatorRow = document.createElement("tr");
            separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);

        }

        const relationships = data["relationship"] || [];

        if(relationships.length > 0)
        {
            personsLabelRow = document.createElement("tr");
            personsLabelCell = document.createElement("td");
            personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            personsLabelRow.classList.add("narrow-row");
            personsLabelCell.innerHTML = '<strong>Relacje:</strong>';
            personsLabelRow.appendChild(personsLabelCell);
            table.appendChild(personsLabelRow);

            relationships.forEach(relationship => {
                const relationshipRow = document.createElement("tr");

                const tdRelation = document.createElement("td");

                persons.forEach(person => {

                    if(person["uuid"] === relationship["idpersons"])
                    {
                        tdRelation.textContent = `${person["name"]} ${person["surname"]}: ${relationship["insiderole"]}`;
                        relationshipRow.appendChild(tdRelation);
                        table.appendChild(relationshipRow);
                    }
                })

            });

            // linie oddzielające
            separatorRow = document.createElement("tr");
            separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);
        }

        const urls = data["url"] || [];
        const local2 = data["local"] || [];
        const physical = data["physical"] || [];

        if(urls.length >0 || local2.length >0 || physical.length > 0)
        {
            personsLabelRow = document.createElement("tr");
            personsLabelCell = document.createElement("td");
            personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            personsLabelRow.classList.add("narrow-row");

            personsLabelCell.style.textAlign = "center";

            personsLabelCell.innerHTML = '<strong>Dokument:</strong>';
            personsLabelRow.appendChild(personsLabelCell);
            table.appendChild(personsLabelRow);

            if(urls.length > 0)
            {
                personsLabelRow = document.createElement("tr");
                personsLabelCell = document.createElement("td");
                personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                personsLabelRow.classList.add("narrow-row");
                personsLabelCell.innerHTML = '<strong>Adresy URL:</strong>';
                personsLabelRow.appendChild(personsLabelCell);
                table.appendChild(personsLabelRow);

                // Tworzenie wiersza z komórką zawierającą adresy URL
                let urlRow = document.createElement("tr");
                let urlCell = document.createElement("td");
                urlCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli

                // Sklej imiona i nazwiska osób, oddzielając przecinkiem
                const urlLocal = urls.map(url => `${url["url"]} (stan: ${url["Condition"]})`).join(', ');

                urlCell.textContent = `${urlLocal}`;
                urlRow.appendChild(urlCell);
                table.appendChild(urlRow);

            }

            if(local2.length > 0)
            {
                personsLabelRow = document.createElement("tr");
                personsLabelCell = document.createElement("td");
                personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                personsLabelRow.classList.add("narrow-row");
                personsLabelCell.innerHTML = '<strong>Adresy lokalne:</strong>';
                personsLabelRow.appendChild(personsLabelCell);
                table.appendChild(personsLabelRow);

                // Tworzenie wiersza z komórką zawierającą adresy URL
                let localRow = document.createElement("tr");
                let localCell = document.createElement("td");
                localCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli

                // Sklej imiona i nazwiska osób, oddzielając przecinkiem
                const localpath = local2.map(loc => `${loc["localpath"]} (stan: ${loc["Condition"]})`).join(', ');

                localCell.textContent = `${localpath}`;
                localRow.appendChild(localCell);
                table.appendChild(localRow);
            }

            if(physical.length > 0)
            {
                personsLabelRow = document.createElement("tr");
                personsLabelCell = document.createElement("td");
                personsLabelCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                personsLabelRow.classList.add("narrow-row");
                personsLabelCell.innerHTML = '<strong>Fizyczne lokalizacje:</strong>';
                personsLabelRow.appendChild(personsLabelCell);
                table.appendChild(personsLabelRow);

                physical.forEach((physicalLocation, index) => {

                    locations.forEach(location => {

                        if(location["id"] === physicalLocation["localaddressid"])
                            local = location;
                    })

                    const physicalRow = document.createElement("tr");
                    const physicalCell = document.createElement("td");
                    physicalCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                    physicalCell.textContent = `Parafia: ${local["parish"]} (stan: ${physicalLocation["Condition"]})`; // Przypisz wartość zmiennej text
                    physicalRow.appendChild(physicalCell);
                    table.appendChild(physicalRow);

                    // Wiersz i komórka z adresem
                    const addRow = document.createElement("tr");
                    const addCell = document.createElement("td");
                    addCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                    addCell.textContent = `${local["address"]} ${local["city"]}, ${local["community"]}, województwo ${local["voivodeship"]}, ${local["postalcode"]} ${local["country"]}`;
                    addRow.appendChild(addCell);
                    table.appendChild(addRow);

                    const bookRow = document.createElement("tr");
                    const bookCell = document.createElement("td");
                    bookCell.colSpan = 4;
                    bookCell.textContent = `Księga: tom: ${physicalLocation["tomenumber"]}, akt: ${physicalLocation["actnumber"]}, strona: ${physicalLocation["page"]}, typ: ${physicalLocation["type"]}, podpis: ${physicalLocation["signature"]}`;
                    bookRow.appendChild(bookCell);
                    table.appendChild(bookRow);

                    if (index < physical.length - 1) {
                        let separatorRow = document.createElement("tr");
                        let separatorCell = document.createElement("td");
                        separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
                        separatorCell.style.borderTop = "1px dashed black";
                        separatorRow.appendChild(separatorCell);
                        table.appendChild(separatorRow);
                    }

                })
            }
        }

        // Dodaj tabelę do sekcji wyników
        actDetailsContainer.appendChild(table);
    }

}

