document.addEventListener('DOMContentLoaded', function () {

    const headers = new Headers({
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkdXBhIiwic2NvcGVzIjpbInVzZXIiLCJhcmJpdGVyIl0sImV4cCI6MTcwNTI2MzQ0OX0.qUSSTwLQMqvdjMgqWXVC4VqKF19HTNPmv47JaFLlQFI'
    });

    fetch('http://localhost:8000/records/marriage/:page?page_id=0', { headers: headers })
        .then(response => response.json())
        .then(data => {
            const table = document.createElement('table');
            table.className = 'table table-striped';

            // Tworzenie nagłówka tabeli
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const headers = ["Język", "UUID", "Tłumacz", "Celebrant", "Lokalizacja", "Tekst", "Miasto", "Data", "Orginalny język", "Orginalne metrykalium", "Czy tymczasowe", "ID String"];
            const keys = ["language", "uuid", "translator", "celebrant", "localization", "text", "city", "Date", "originallanguage", "originalentry", "istemporary", "idstring"];
            headers.forEach(headerText => {
                const header = document.createElement('th');
                header.textContent = headerText;
                headerRow.appendChild(header);
            });

            // Wypełnianie ciałem tabeli
            const tbody = table.createTBody();
            data.forEach(item => {
                const row = tbody.insertRow();
                keys.forEach(header => {
                    const cell = row.insertCell();
                    const key = header.toLowerCase().replace(/\s+/g, '');
                    cell.textContent = item[key] ?? 'brak';
                });
            });

            // Dodawanie tabeli do DOM
            document.querySelector('.row').appendChild(table);
        })
        .catch(error => console.error('Błąd:', error));
});