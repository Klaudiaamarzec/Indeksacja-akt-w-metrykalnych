from __future__ import annotations

from datetime import datetime, timedelta
import random
import time


from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import parse_obj_as, ValidationError


import models, schemas, CRUD
from database import SessionLocal, engine

from config import ALGORITHM, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ORIGINS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login",scopes={"user": "Zwykly user", "arbiter": "Arbiter"})

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    user = CRUD.get_user(db, username)
    return user


# funkcja odpowiadajaca za tworzenie tokenow JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# funkcja odpowiadajaca za logowanie uzytkownika
def authenticate_user(db: Session, username: str, password: str):
    user = CRUD.get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


# funkcja odpowiadajaca za autoryzacje
def get_current_user(security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = schemas.TokenData(scopes=token_scopes, username=username)
    except (JWTError, ValidationError):
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


# Endpoint rejestrujacy nowych uzytkownikow
@app.post("/register/", status_code=201)
def register(user: schemas.UserCreate, session: Session = Depends(get_db)):
    existing_user = session.query(models.Users).filter_by(username=user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user.password = get_password_hash(user.password)

    CRUD.create_user(session, user)

    return {"message":"user created successfully"}


"""
    Endpoint sluzacy do logowania. Zwraca token JWT.
    Aby uzytkownik otrzymal stopien uprawnien "user", w bazie danych musi mu byc przypisana rola o nazwie "user".
    Aby uzytkownik otrzymal stopien uprawnien "arbiter", w bazie danych musi mu byc przypisana rola o nazwie "arbiter".
"""
@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    role = db.query(models.Roles).filter(models.Roles.idrole == user.idrole).first()
    if role.name == "user":
        scopes = ["user"]
    elif role.name == "arbiter":
        scopes = ["user", "arbiter"]
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "scopes": scopes}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me/", response_model=schemas.UserReturn)

@app.get("/records/birth/:page")
async def get_birth_page(db: Session = Depends(get_db), page_id: int = 0, current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])):
    try:
        if page_id < 0:
            raise HTTPException(status_code=400, detail="Page number cannot be negative.")

        start_index = page_id * 20

        page = CRUD.get_birth_entries(db,start_index,20)
        return page

    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting birth entries failed: " + str(e))


@app.get("/records/death/:page")
async def get_death_page(db: Session = Depends(get_db), page_id: int = 0, current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])):
    try:
        if page_id < 0:
            raise HTTPException(status_code=400, detail="Page number cannot be negative.")

        start_index = page_id * 20

        page = CRUD.get_death_entries(db,start_index,20)
        return page

    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting death entries failed: " + str(e))


@app.get("/records/marriage/:page")
async def get_birth_page(db: Session = Depends(get_db), page_id: int = 0, current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])):
    try:
        if page_id < 0:
            raise HTTPException(status_code=400, detail="Page number cannot be negative.")

        start_index = page_id * 20

        page = CRUD.get_marriage_entries(db,start_index,20)
        return page

    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting marriage entries failed: " + str(e))


@app.get("/records/")
async def get_relations(name: str, surname: str, db: Session = Depends(get_db)):
    try:
        person_id = db.query(models.Person).filter(models.Person.name == name, models.Person.surname == surname).all()

        person_id = [x.uuid for x in person_id]
        if person_id is None:
            raise HTTPException(status_code=400, detail="Person not found.")
        PersonID_table = []
        for person in person_id:
            PersonID_table.extend(db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.idpersons == person).all())

        BirthEntries_table = []
        DeathEntries_table = []
        MarriageEntries_table = []

        for element in PersonID_table:
            BirthEntries_table.extend(db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.birthentriesuuid != None, models.PersonEntriesRelation.identries == element.identries).all())

        for element in PersonID_table:
            DeathEntries_table.extend(db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.deathentriesuuid != None, models.PersonEntriesRelation.identries == element.identries).all())

        for element in PersonID_table:
            MarriageEntries_table.extend(db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.marriageentriesuuid != None, models.PersonEntriesRelation.identries == element.identries).all())

        RelatedEntries_table = []

        for entry in BirthEntries_table:
            death_entry = CRUD.get_birth_entry(db, entry.birthentriesuuid)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "birth"
            RelatedEntries_table.append(resultDictionary)


        for entry in DeathEntries_table:
            death_entry = CRUD.get_death_entry(db, entry.deathentriesuuid)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "death"
            RelatedEntries_table.append(resultDictionary)

        for entry in MarriageEntries_table:
            death_entry = CRUD.get_marriage_entry(db, entry.marriageentriesuuid)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "marriage"
            RelatedEntries_table.append(resultDictionary)
        return RelatedEntries_table

    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting name and surname related entries failed: " + str(e))


@app.get("/records/temporary")
async def get_temporary(db: Session = Depends(get_db), current_user: schemas.UserReturn = Security(get_current_user, scopes=["arbiter"])):
    try:

        # temps = {"birth":db.query(models.BirthEntries).filter(models.BirthEntries.istemporary == True).all(),
        #     "death":db.query(models.DeathEntries).filter(models.DeathEntries.istemporary == True).all(),
        #     "marriage":db.query(models.MarriageEntries).filter(models.MarriageEntries.istemporary == True).all()}

        birth_id = db.query(models.BirthEntries).filter(models.BirthEntries.istemporary == True).all()
        death_id = db.query(models.DeathEntries).filter(models.DeathEntries.istemporary == True).all()
        marriage_id = db.query(models.MarriageEntries).filter(models.MarriageEntries.istemporary == True).all()

        birth_id = [x.uuid for x in birth_id]
        death_id = [x.uuid for x in death_id]
        marriage_id = [x.uuid for x in marriage_id]

        result = []

        for entry in birth_id:
            death_entry = CRUD.get_birth_entry(db, entry)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "birth"
            result.append(resultDictionary)


        for entry in death_id:
            death_entry = CRUD.get_death_entry(db, entry)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "death"
            result.append(resultDictionary)

        for entry in marriage_id:
            death_entry = CRUD.get_marriage_entry(db, entry)
            keys = ["entry",
                    "url",
                    "local",
                    "physical",
                    "relationship", "person"]

            resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}
            resultDictionary["type"] = "marriage"
            result.append(resultDictionary)

        return result


    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting marriage entries failed: " + str(e))


# Endpoint zwracający informacje o wpisie małżeńskim o danym ID
@app.get("/records/marriage/{id}")
async def get_marriage_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        marrige_entry = CRUD.get_marriage_entry(db, id)
        keys = ["entry",
        "url",
        "local",
        "physical",
        "relationship","person"]

        resultDictionary = {keys[i]: marrige_entry[i] for i, _ in enumerate(marrige_entry)}

        return resultDictionary
    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting marriage entry failed")


@app.get("/records/death/{id}")
async def get_death_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        death_entry = CRUD.get_death_entry(db, id)
        keys = ["entry",
        "url",
        "local",
        "physical",
        "relationship","person"]

        resultDictionary = {keys[i]: death_entry[i] for i, _ in enumerate(death_entry)}

        return resultDictionary
    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting marriage entry failed")


@app.get("/records/birth/{id}")
async def get_birth_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        birth_entry = CRUD.get_birth_entry(db, id)
        keys = ["entry",
        "url",
        "local",
        "physical",
        "relationship","person"]

        resultDictionary = {keys[i]: birth_entry[i] for i, _ in enumerate(birth_entry)}

        return resultDictionary
    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting marriage entry failed")


@app.get("/locations/")
async def get_locations(
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        locations = CRUD.get_local_address_all(db)
        json_locations = parse_obj_as(list[schemas.LocalAddressReturn], locations)
        return json_locations
    except Exception as e:
        raise HTTPException(status_code=400, detail="Getting locations failed: " )


@app.post("/records/marriage/", status_code=201)
def create_marriage_entry(
        entry: schemas.Entries,
        url: list[schemas.URLS] = None,
        local: list[schemas.LocalCreate] = None,
        physical: list[schemas.PhysicalLocations] = None,
        location: schemas.LocalAddress = None,
        persons: list[schemas.PersonCreate] = None,
        localization_id: int | None = None,
        relationships: list[schemas.PersonEntriesRelationCreate] = None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        # Use localization_id if provided, otherwise use location from the request
        CRUD.create_marriage_entry(
            db,
            id_string=f"mar_{time.time()}_{random.randint(0,255)}",
            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,
            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )
        return {"message": "Marriage entry created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create marriage entry: {str(e)}")


@app.post("/records/death", status_code=201)
def create_death_entry(
        entry: schemas.Entries,
        url:list[schemas.URLS]=None,
        local:list[schemas.LocalCreate]=None,
        physical:list[schemas.PhysicalLocations]=None,
        location:schemas.LocalAddress=None,
        persons:list[schemas.PersonCreate]=None,
        localization_id: int | None = None,
        relationships:list[schemas.PersonEntriesRelationCreate]=None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
        ):
    try:
        # Use localization_id if provided, otherwise use location from the request


        CRUD.create_death_entry(
            db,
            id_string=f"dea_{time.time()}_{random.randint(0,255)}",
            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,
            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )
        return {"message": "Death record created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to create death entry")


@app.post("/records/birth/", status_code=201)
async def add_birth_entry(

        entry: schemas.Entries,
        url: list[schemas.URLS] = None,
        local: list[schemas.LocalCreate] = None,
        physical: list[schemas.PhysicalLocations] = None,
        location: schemas.LocalAddress = None,
        persons: list[schemas.PersonCreate] = None,
        localization_id: int | None = None,
        relationships: list[schemas.PersonEntriesRelationCreate] = None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:
        CRUD.create_birth_entry(
            db,
            id_string=f"bir_{time.time()}_{random.randint(0, 255)}",

            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,

            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )
        return {"message": "Translation added to death entry successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to create birth entry")


@app.post("/records/death/translation/{id}", status_code=201)
def add_translation_to_death_entry(
        id: int,
        entry: schemas.Entries,
        url: list[schemas.URLS] = None,
        local: list[schemas.LocalCreate] = None,
        physical: list[schemas.PhysicalLocations] = None,
        location: schemas.LocalAddress = None,
        persons: list[schemas.PersonCreate] = None,
        localization_id: int | None = None,
        relationships: list[schemas.PersonEntriesRelationCreate] = None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:

        # Check if the death entry with the given id exists
        existing_death_entry = CRUD.get_death_entry(db, id)
        if not existing_death_entry:
            raise HTTPException(status_code=404, detail="Death entry not found")
        entry.originalentry = id

        # Create the translation entry
        CRUD.create_death_entry(
            db,
            id_string=f"dea_trans_{time.time()}_{random.randint(0,255)}",
            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,
            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )
        return {"message": "Translation added to death entry successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to add translation to death entry")


@app.post("/records/birth/translation/{id}", status_code=201)
def add_translation_to_birth_entry(
        id: int,
        entry: schemas.Entries,
        url: list[schemas.URLS] = None,
        local: list[schemas.LocalCreate] = None,
        physical: list[schemas.PhysicalLocations] = None,
        location: schemas.LocalAddress = None,
        persons: list[schemas.PersonCreate] = None,
        localization_id: int | None = None,
        relationships: list[schemas.PersonEntriesRelationCreate] = None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:

        # Check if the birth entry with the given id exists
        existing_birth_entry = CRUD.get_birth_entry(db, id)
        if not existing_birth_entry:
            raise HTTPException(status_code=404, detail="birth entry not found")

        entry.originalentry = id

        # Create the translation entry
        CRUD.create_birth_entry(
            db,
            id_string=f"bir_trans_{time.time()}_{random.randint(0,255)}",
            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,
            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )
        return {"message": "Translation added to birth entry successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to add translation to birth entry"+str(e))


@app.post("/records/marriage/translation/{id}", status_code=201)
def add_translation_to_marriage_entry(
        id: int,
        entry: schemas.Entries,
        url: list[schemas.URLS] = None,
        local: list[schemas.LocalCreate] = None,
        physical: list[schemas.PhysicalLocations] = None,
        location: schemas.LocalAddress = None,
        persons: list[schemas.PersonCreate] = None,
        localization_id: int | None = None,
        relationships: list[schemas.PersonEntriesRelationCreate] = None,
        db: Session = Depends(get_db),
        current_user: schemas.UserReturn = Security(get_current_user, scopes=["user"])
):
    try:

        # Check if the marriage entry with the given id exists
        existing_marriage_entry = CRUD.get_marriage_entry(db, id)
        if not existing_marriage_entry:
            raise HTTPException(status_code=404, detail="marriage entry not found")

        entry.originalentry = id

        # Create the translation entry
        CRUD.create_marriage_entry(
            db,
            id_string=f"mar_trans_{time.time()}_{random.randint(0,255)}",
            entry=entry,
            urls=url,
            locals=local,
            physicals=physical,
            location= location,
            location_id=localization_id,
            persons=persons,
            relationships= relationships
        )

        return {"message": "Translation added to marriage entry successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to add translation to marriage entry")


@app.put("/records/birth/{id}")
async def update_birth_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["arbiter"])
):
    try:
        temp = CRUD.get_birth_entry(db, id)
        original_entry = temp[0].originalentry
        CRUD.update_birth_entry(db, id, False, None)
        CRUD.delete_birth_entry(db, original_entry)
        
        return {"message": "Updating birth entry successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Updating birth entry failed: " + str(e))


@app.put("/records/marriage/{id}")
async def update_marriage_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["arbiter"])
):
    try:
        temp = CRUD.get_marriage_entry(db, id)
        original_entry = temp[0].originalentry
        CRUD.update_marige_entry(db, id, False, None)
        CRUD.delete_marriage_entry(db, original_entry)

        return {"message": "Updating marriage entry successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Updating marriage entry failed: " + str(e))


@app.put("/records/death/{id}")
async def update_death_entry(
    id: int,
    db:Session = Depends(get_db),
    current_user: schemas.UserReturn = Security(get_current_user, scopes=["arbiter"])
):
    try:
        temp = CRUD.get_death_entry(db, id)
        original_entry = temp[0].originalentry
        CRUD.update_death_entry(db, id, False, None)
        CRUD.delete_death_entry(db, original_entry)

        return {"message": "Updating death entry successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Updating death entry failed: " + str(e))




