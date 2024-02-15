## Security
#### POST
- `/register/`
rejestracja użytkownika\
Request:
```JSON
{
  "username": "string",
  "password": "string",
  "idrole": "int"
}
```

Response:\
    Sukces - 201\
    Fail - 400

- `/login/`
endpoint służący do logowania. Zwraca token potrzebny do autentykacji\
Request:\
header: 'Content-Type: application/x-www-form-urlencoded'\
data: 'grant_type=&username=USERNAME&password=PASSWORD&scope=&client_id=&client_secret='\
Response:
```JSON
{
  "access_token": "token",
  "token_type": "bearer"
}
```
### Działanie autoryzacji
Przy każdym requescie do backendu trzeba dołączać header z otrzymanym tokenem w następującym formacie:\
'Authorization: Bearer TOKEN_DATA'
## Records
#### GET
- `/records/marriage/{id}` 
zwraca marriage entry o zadanym id\
Response:
```JSON
{
  "entry": {
    "id": "int",
    "date": "date",
    "text": "string",
    "language": "string",
    "originallanguage": "string",
    "translator": "string",
    "celebrant": "string",
    "istemporary": "boolean",
    "city": "string",
    "idstring": "string",
    "localization": "int",
    "originalentry": "int"
  },
  "url": [
    {
      "id": "int",
      "idurl": "int",
      "url": "string",
      "condition": "string"
    }
  ],
  "local": [
    {
      "id": "int",
      "idpath": "int",
      "localpath": "string",
      "condition": "string"
    }
  ],
  "physical": [
    {
      "id": "int",
      "tomenumber": "int",
      "page": "int",
      "condition": "string",
      "type": "string",
      "signature": "string",
      "actnumber": "int",
      "idphys": "int",
      "localaddressid": "int"
    }
  ],
  "location": {
    "id": "int",
    "country": "string",
    "voivodeship": "string",
    "community": "string",
    "city": "string",
    "address": "string",
    "postalcode": "int",
    "parish": "string"
  },
  "persons": [
    {
      "id": "int",
      "pfid": "int",
      "cfid": "int",
      "marriage": "int",
      "name": "string",
      "surname": "string",
      "birth": "date",
      "death": "date"
    }
  ],
  "relationships": [
    {
      "id": "int",
      "insiderole": "string",
      "idpersons": "int",
      "marriageentriesuuid": "int",
      "birthentriesuuid": "int",
      "deathentriesuuid": "int"
    }
  ]
}
```

- `/records/birth/{id}` 
zwraca marriage entry o zadanym id\
Response:  jak w GET`/records/marriage/{id}`

- `/records/death/{id}` 
zwraca marriage entry o zadanym id\
Response:jak w GET`/records/marriage/{id}`

- `/records/marriage/:page` 
zwraca kolejne zależne od page 20 elementowe listy marriage entries. Jeżeli page=0 to zwraca najnowsze 20 wpisów, przy page=1 zwraca kolejne 20 wpisów itd.\ 
Response:
```JSON
{
  [
  {
    "Date": "2023-12-18",
    "uuid": 6,
    "originallanguage": null,
    "translator": "string",
    "celebrant": "string",
    "localization": 7,
    "text": "string",
    "city": "string",
    "language": "string",
    "originalentry": null,
    "istemporary": false,
    "idstring": "uwu"
  },
  ]
}
```

- `/records/birth/:page` 
zwraca kolejne zależne od page 20 elementowe listy birth entries. Jeżeli page=0 to zwraca najnowsze 20 wpisów, przy page=1 zwraca kolejne 20 wpisów itd. \
Response: jak w GET `/records/marriage/:page` 


- `/records/death/:page` 
zwraca kolejne zależne od page 20 elementowe listy death entries. Jeżeli page=0 to zwraca najnowsze 20 wpisów, przy page=1 zwraca kolejne 20 wpisów itd. \
Response:jak w GET `/records/marriage/:page` 


- `/records/:name:surname`
zwraca entries z związane z danym imieniem i nazwiskiem.
Response:

```JSON
[
  {
    "type": "string",
    "entry": {
      "id": "int",
      "date": "date",
      "text": "string",
      "language": "string",
      "originallanguage": "string",
      "translator": "string",
      "celebrant": "string",
      "istemporary": "boolean",
      "city": "string",
      "idstring": "string",
      "localization": "int",
      "originalentry": "int"
    },
    "url": [
      {
        "id": "int",
        "idurl": "int",
        "url": "string",
        "condition": "string"
      }
    ],
    "local": [
      {
        "id": "int",
        "idpath": "int",
        "localpath": "string",
        "condition": "string"
      }
    ],
    "physical": [
      {
        "id": "int",
        "tomenumber": "int",
        "page": "int",
        "condition": "string",
        "type": "string",
        "signature": "string",
        "actnumber": "int",
        "idphys": "int",
        "localaddressid": "int"
      }
    ],
    "location": {
      "id": "int",
      "country": "string",
      "voivodeship": "string",
      "community": "string",
      "city": "string",
      "address": "string",
      "postalcode": "int",
      "parish": "string"
    },
    "persons": [
      {
        "id": "int",
        "pfid": "int",
        "cfid": "int",
        "marriage": "int",
        "name": "string",
        "surname": "string",
        "birth": "date",
        "death": "date"
      }
    ],
    "relationships": [
      {
        "id": "int",
        "insiderole": "string",
        "idpersons": "int",
        "marriageentriesuuid": "int",
        "birthentriesuuid": "int",
        "deathentriesuuid": "int"
      }
    ]
  }
]
```

- `/records/temporary`
zwraca entries do arbitrażu\
Response:
```JSON
[
  {
        "type": "string",
        "entry": {
          "id": "int",
        "date": "date",
        "text": "string",
        "language": "string",
        "originallanguage": "string",
        "translator": "string",
        "celebrant": "string",
        "istemporary": "boolean",
        "city": "string",
        "idstring": "string",
        "localization": "int",
        "originalentry": "int"
      },
      "url": [
        {
          "id": "int",
          "idurl": "int",
          "url": "string",
          "condition": "string"
        }
      ],
      "local": [
        {
          "id": "int",
          "idpath": "int",
          "localpath": "string",
          "condition": "string"
        }
      ],
      "physical": [
        {
          "id": "int",
          "tomenumber": "int",
          "page": "int",
          "condition": "string",
          "type": "string",
          "signature": "string",
          "actnumber": "int",
          "idphys": "int",
          "localaddressid": "int"
        }
      ],
      "location": {
        "id": "int",
        "country": "string",
        "voivodeship": "string",
        "community": "string",
        "city": "string",
        "address": "string",
        "postalcode": "int",
        "parish": "string"
      },
      "persons": [
        {
          "id": "int",
          "pfid": "int",
          "cfid": "int",
          "marriage": "int",
          "name": "string",
          "surname": "string",
          "birth": "date",
          "death": "date"
        }
      ],
      "relationships": [
        {
          "id": "int",
          "insiderole": "string",
          "idpersons": "int",
          "marriageentriesuuid": "int",
          "birthentriesuuid": "int",
          "deathentriesuuid": "int"
        }
      ]
  },
]
```
#### POST
- `/records/marriage/:localization_id`
dodawanie wpisu z księgi małżeństw. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
```JSON
  {
        "entry": {
        "date": "date",
        "text": "string",
        "language": "string",
        "originallanguage": "string",
        "translator": "string",
        "celebrant": "string",
        "istemporary": "boolean",
        "city": "string",
        "idstring": "string",
        "localization": "int",
        "originalentry": "int"
      },
      "url": [
        {
          "idurl": "int",
          "url": "string",
          "condition": "string"
        }
      ],
      "local": [
        {
          "idpath": "int",
          "localpath": "string",
          "condition": "string"
        }
      ],
      "physical": [
        {
          "tomenumber": "int",
          "page": "int",
          "condition": "string",
          "type": "string",
          "signature": "string",
          "actnumber": "int",
          "idphys": "int",
          "localaddressid": "int"
        }
      ],
      "location": {
        "country": "string",
        "voivodeship": "string",
        "community": "string",
        "city": "string",
        "address": "string",
        "postalcode": "int",
        "parish": "string"
      },
      "persons": [
        {
          "pfid": "int",
          "cfid": "int",
          "marriage": "int",
          "name": "string",
          "surname": "string",
          "birth": "date",
          "death": "date"
        }
      ],
      "relationships": [
        {
          "insiderole": "string",
          "idpersons": "int",
          "marriageentriesuuid": "int",
          "birthentriesuuid": "int",
          "deathentriesuuid": "int"
        }
      ]
  }
 
``` 
Response:\
    Sukces - 201\
    Fail - 400
- `/records/birth/:localization_id`
dodawanie wpisu z księgi chrztów. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
    jak w POST `/records/marriage/`\
Response:\
    Sukces - 201\
    Fail - 400
- `/records/death/:localization_id`
dodawanie wpisu z księgi zgonów. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
    jak w POST `/records/marriage/`\
Response:\
    Sukces - 201\
    Fail - 400

- `/records/marriage/translation/{id}/:localization_id`
dodanie tłumaczenia do wpisu z księgi małżeństw. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
    jak w POST `/records/marriage/`\
Response:\
    Sukces - 201\
    Fail - 400

- `/records/birth/translation/{id}/:localization_id`
dodanie tłumaczenia do wpisu z księgi małżeństw. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
    jak w POST `/records/marriage/`\
Response:\
    Sukces - 201\
    Fail - 400

- `/records/death/translation/{id}/:localization_id`
dodanie tłumaczenia do wpisu z księgi małżeństw. Opcjonalny parametr localization_id przechowuje id lokalizacji z tabeli LocalAdress.
który może być użyty zamiast podanej w Request lokalizacji\
Request:
    jak w POST `/records/marriage/`\
Response:\
    Sukces - 201\
    Fail - 400
#### PUT
-  `/records/marriage/{id}`
ustawianie entry jako poprawne i usuwanie drugiego wpisu \
Response:\
    Sukces - 200\
    Fail - 400

-  `/records/birth/{id}`
ustawianie entry jako poprawne i usuwanie drugiego wpisu\
Response:\
    Sukces - 200\
    Fail - 400
-  `/records/death/{id}`
ustawianie entry jako poprawne i usuwanie drugiego wpisu\
Response:\
    Sukces - 200\
    Fail - 400

## Locations
#### GET
- `/locations/`
zwraca dodane wcześniej adresy lokalizacji fizycznej\
Response:
```JSON
{
    "id": "int",
    "country": "string",
    "voivodeship": "string",
    "community": "string",
    "city": "string",
    "address": "string",
    "postalcode": "int",
    "parish": "string"
  }
```