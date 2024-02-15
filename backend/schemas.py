from pydantic import BaseModel
from datetime import datetime

class Role(BaseModel):
    idrole: int
    name: str

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    idrole: int


class UserCreate(UserBase):
    password: str


class UserReturn(UserBase):
    uuid: int
    roles: Role
    class Config:
        orm_mode = True

class PersonCreate(BaseModel):
    pfid: int | None = None
    cfid: int | None = None
    marriage: int | None = None
    name: str | None = None
    surname: str | None = None
    birth: datetime | None = None
    death: datetime | None = None

class PersonReturn(PersonCreate):
    uuid: int
    class Config:
        orm_mode = True

class PersonEntriesRelationCreate(BaseModel):
    insiderole: str | None = None
    idpersons: int
    marriageentriesuuid: int | None = None
    birthentriesuuid: int | None = None
    deathentriesuuid: int | None = None

class PersonEntriesRelationReturn(PersonEntriesRelationCreate):
    identries: int
    class Config:
        orm_mode = True

class PhysicalLocations(BaseModel):
    tomenumber: int | None = None
    page: int | None = None
    condition: str | None = None
    type: str | None = None
    signature: str | None = None
    actnumber: int | None = None
    idphys: int
    localaddressid: int

class PhysicalLocationsReturn(PhysicalLocations):
    id: int

    class Config:
        orm_mode = True

class LocalCreate(BaseModel):
    idpath: int
    localpath: str
    condition: str

class LocalReturn(LocalCreate):
    id: int

    class Config:
        orm_mode = True

class LocalAddress(BaseModel):
    country: str  | None = None
    voivodeship: str | None = None
    community: str | None = None
    city: str | None = None
    address: str | None = None
    postalcode: int | None = None
    parish: str | None = None

class LocalAddressReturn(LocalAddress):
    id: int

    class Config:
        orm_mode = True

class URLS(BaseModel):
    idurl: int
    url: str
    condition: str | None = None

class URLSReturn(URLS):
    id: int

    class Config:
        orm_mode = True

class Entries(BaseModel):
    date: datetime | None = None
    text: str | None = None
    language: str | None = None
    originallanguage: str | None = None
    translator: str | None = None
    celebrant: str | None = None
    istemporary: bool | None = None
    city: str | None = None
    idstring: str | None = None
    localization: int | None = None
    originalentry: int | None = None

class EntriesReturn(Entries):
    uuid: int
    persons:list[PersonReturn] = []
    phys_location: list[PhysicalLocationsReturn] = []
    urls: list[URLSReturn] = []
    local: list[LocalReturn] = []

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []
