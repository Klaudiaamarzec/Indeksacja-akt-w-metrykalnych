document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const surname = urlParams.get('surname');
    const actType = urlParams.get('type');

    if (name && surname) {
        // Wyszukaj dane na podstawie imienia i nazwiska
        searchRecords(name, surname);
    } else if (actType)
    {
        // Wyszukaj akty na podstawie typu
        searchActs(actType);
    }
    else
    {
        // Brak imienia i nazwiska w parametrach URL
        console.error("Brak wymaganych parametrów");
    }
});

// Pobierz referencje do guzików
const btnBirthRecords = document.getElementById("btnBirthRecords");
const btnMarriageRecords = document.getElementById("btnMarriageRecords");
const btnDeathRecords = document.getElementById("btnDeathRecords");

// Przypisz funkcje do obsługi zdarzenia 'click'
btnBirthRecords.addEventListener("click", function() {
    displayActs("birth");
});

btnMarriageRecords.addEventListener("click", function() {
    displayActs("marriage");
});

btnDeathRecords.addEventListener("click", function() {
    displayActs("death");
});

function displayActs(actType)
{
    const searchParams = new URLSearchParams();
    searchParams.append('type', actType);
    window.location.href = `wyswietlenie_metrykalia.html?${searchParams.toString()}`;
}

function handleSearch(event) {
    event.preventDefault(); // Zapobiega domyślnej akcji przesłania formularza

    // wartości z pól formularza
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;

    // obiekt URLSearchParams i dodaj parametry do adresu URL
    const searchParams = new URLSearchParams();
    searchParams.append('name', name);
    searchParams.append('surname', surname);

    // Przekieruj do strony wyników
    window.location.href = `wyswietlenie_metrykalia.html?${searchParams.toString()}`;
}

function searchRecords(name, surname) {
    fetch(`http://127.0.0.1:8000/records/?name=${name}&surname=${surname}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displaySearchResults(data, showActDetails);
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
            // Dodaj obsługę błędów na wypadek problemów z pobieraniem danych
        });
}

function displaySearchResults(results, showActDetailsCallback) {
    const searchResultsSection = document.getElementById("searchResults");

    // Wyczyść poprzednie wyniki
    searchResultsSection.innerHTML = '';

    if (results.length === 0)
    {
        searchResultsSection.innerHTML = "<p>Brak wyników dla podanych kryteriów wyszukiwania.</p>";
    }
    else
    {
        // Utwórz oddzielną tabelę dla każdego wyniku
        results.forEach(result => {

            const entry = result["entry"];

            // Utwórz tabelę
            const table = document.createElement("table");
            table.className = "tableResult";

            // Utwórz wiersz dla daty, języka, celebranta i miasta
            const headerRow = document.createElement("tr");

            const headersMapping = {
                "Date": "Data",
                "language": "Język",
                "city": "Miejscowość"
            };

            Object.keys(headersMapping).forEach(key => {
                const td = document.createElement("td");
                td.textContent = `${headersMapping[key]}: ${entry[key]}`;
                headerRow.appendChild(td);
            });

            table.appendChild(headerRow);

            //linie oddzielające
            let separatorRow = document.createElement("tr");
            let separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);

            const persons = result["person"] || [];

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

            const relationships = result["relationship"] || [];

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
            }

            // Przycisk "Zobacz akt"
            const viewDetailsButton = document.createElement("button");
            viewDetailsButton.textContent = "Zobacz akt";
            viewDetailsButton.classList.add("btn-act");
            viewDetailsButton.addEventListener("click", () => {

                const actId = result["entry"]["uuid"];

                // Sprawdzenie, czy pole entry istnieje
                if (entry && actId) {

                    // Utwórz adres URL dla strony wyników, dodając do niego parametry

                    const actType = result.type;

                    // Wywołaj funkcję przekazując identyfikator aktu
                    showActDetailss(actId, actType);

                } else {
                    console.error("Brak identyfikatora aktu w odpowiedzi.");
                }

                // Przenieś na stronę "akt.html" z odpowiednim identyfikatorem akta
                //window.location.href = `akt.html?id=${actId}`;
            });

            // Utwórz wiersz dla przycisku
            const buttonRow = document.createElement("tr");

            // Dodaj przycisk do trzeciej kolumny
            const buttonCell = document.createElement("td");
            buttonCell.colSpan = 4; // Odpowiada za wszystkie cztery kolumny
            buttonCell.classList.add("center-column");
            buttonCell.appendChild(viewDetailsButton);
            buttonRow.appendChild(buttonCell);

            // Dodaj przycisk do sekcji wyników
            table.appendChild(buttonRow);

            // Dodaj tabelę do sekcji wyników
            searchResultsSection.appendChild(table);
        });
    }
}

function displaySearchActs(results, actType, showActDetailsCallback)
{
    const searchResultsSection = document.getElementById("searchResults");

    // Wyczyść poprzednie wyniki
    searchResultsSection.innerHTML = '';

    if (results.length === 0)
    {
        searchResultsSection.innerHTML = "<p>Brak wyników dla podanych kryteriów wyszukiwania.</p>";
    }
    else
    {
        // Utwórz oddzielną tabelę dla każdego wyniku
        results.forEach(result => {

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
                if (result.hasOwnProperty(key)) {
                    const td = document.createElement("td");
                    td.textContent = `${headersMapping[key]}: ${result[key]}`;
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

            //linie oddzielające
            let separatorRow = document.createElement("tr");
            let separatorCell = document.createElement("td");
            separatorCell.colSpan = 4; // Rozciągnij komórkę na całą szerokość tabeli
            separatorCell.innerHTML = "<hr>";
            separatorRow.appendChild(separatorCell);
            table.appendChild(separatorRow);

            if(result["text"] !== null)
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
                textCell.textContent = result["text"]; // Przypisz wartość zmiennej text
                textRow.appendChild(textCell);
                table.appendChild(textRow);
            }

            // Przycisk "Zobacz akt"
            const viewDetailsButton = document.createElement("button");
            viewDetailsButton.textContent = "Zobacz akt";
            viewDetailsButton.classList.add("btn-act");
            viewDetailsButton.addEventListener("click", () => {

                const actId = result["uuid"];

                // Sprawdzenie, czy pole entry istnieje
                if (result && actId) {

                    // Utwórz adres URL dla strony wyników, dodając do niego parametry

                    // Wywołaj funkcję przekazując identyfikator aktu
                    showActDetailss(actId, actType);

                } else {
                    console.error("Brak identyfikatora aktu w odpowiedzi.");
                }

                // Przenieś na stronę "akt.html" z odpowiednim identyfikatorem akta
                //window.location.href = `akt.html?id=${actId}`;
            });

            // Utwórz wiersz dla przycisku
            const buttonRow = document.createElement("tr");

            // Dodaj przycisk do trzeciej kolumny
            const buttonCell = document.createElement("td");
            buttonCell.colSpan = 4; // Odpowiada za wszystkie cztery kolumny
            buttonCell.classList.add("center-column");
            buttonCell.appendChild(viewDetailsButton);
            buttonRow.appendChild(buttonCell);

            // Dodaj przycisk do sekcji wyników
            table.appendChild(buttonRow);

            // Dodaj tabelę do sekcji wyników
            searchResultsSection.appendChild(table);
        });
    }
}

function showActDetailss(actId, actType) {

    // Utwórz obiekt URLSearchParams i dodaj parametry do adresu URL
    const searchParams = new URLSearchParams();
    searchParams.append('actId', actId);
    searchParams.append('actType', actType);

    // Przekieruj do strony wyników
    window.location.href = `akt.html?${searchParams.toString()}`;
}

function searchActs(actType)
{
    let apiUrl;

    switch(actType)
    {
        case 'birth':
            apiUrl = `http://127.0.0.1:8000/records/birth/:page?page_id=0`;
            break;

        case 'death':
            apiUrl = `http://127.0.0.1:8000/records/death/:page?page_id=0`;
            break;

        case 'marriage':
            apiUrl = `http://127.0.0.1:8000/records/marriage/:page?page_id=0`;
            break;

        default:
            console.error("Nieznany rodzaj aktu");
            return;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displaySearchActs(data, actType, showActDetails);
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
            // Dodaj obsługę błędów na wypadek problemów z pobieraniem danych
        });
}
