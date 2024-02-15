from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, UniqueConstraint, Sequence
from sqlalchemy.orm import relationship
from database import Base

class Users(Base):
    __tablename__ = 'users'
    uuid = Column(Integer, primary_key=True, autoincrement=True)
    password = Column(String(64), nullable=False)
    username = Column(String(16), nullable=False, unique=True)
    idrole = Column(ForeignKey("roles.idrole"), nullable=False)

    roles = relationship("Roles", back_populates='users')


class BirthEntries(Base):
    __tablename__ = 'birthentries'
    uuid = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String(255), nullable=False)
    Date = Column(Date)
    text = Column(String(255))
    language = Column(String(20))
    originallanguage = Column(String(20))
    translator = Column(String(30))
    originalentry = Column(Integer)
    celebrant = Column(String(30))
    istemporary = Column(Boolean)
    localization = Column(Integer, nullable=False)
    idstring = Column(String(50), nullable=False, unique=True)

class LocalLink(Base):
    __tablename__ = 'locallink'
    id = Column(Integer, primary_key=True, autoincrement=True)
    idphys = Column(Integer, Sequence('idphys_seq'), autoincrement=True)
    idurl = Column(Integer, Sequence('idurl_seq'), autoincrement=True)
    idpath = Column(Integer, Sequence('idpath_seq'), autoincrement=True)

class PhysicalLocations(Base):
    __tablename__ = 'physicallocations'
    id = Column(Integer, primary_key=True, autoincrement=True)
    idphys = Column(Integer, nullable=False)
    tomenumber = Column(Integer)
    page = Column(Integer)
    Condition = Column(String(30))
    type = Column(String(20))
    signature = Column(String(30))
    actnumber = Column(Integer)
    localaddressid = Column(Integer, nullable=False)

class URLS(Base):
    __tablename__ = 'urls'
    id = Column(Integer, primary_key=True, autoincrement=True)
    idurl = Column(Integer, nullable=False)
    url = Column(String(255), nullable=False)
    Condition = Column(String(255))

class Person(Base):
    __tablename__ = 'person'
    uuid = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255))
    pfid = Column(Integer)
    cfid = Column(Integer)
    marriage = Column(Integer)
    surname = Column(String(255))
    birth = Column(Date)
    death = Column(Date)

class Local(Base):
    __tablename__ = 'local'
    id = Column(Integer, primary_key=True, autoincrement=True)
    idpath = Column(Integer, nullable=False)
    localpath = Column(String(255), nullable=False)
    Condition = Column(String(255))

class DeathEntries(Base):
    __tablename__ = 'deathentries'
    uuid = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String(255), nullable=False)
    Date = Column(Date)
    text = Column(String(255))
    language = Column(String(20))
    originallanguage = Column(String(20))
    translator = Column(String(30))
    originalentry = Column(Integer)
    celebrant = Column(String(30))
    istemporary = Column(Boolean)
    localization = Column(Integer, nullable=False)
    idstring = Column(String(50), nullable=False, unique=True)

class MarriageEntries(Base):
    __tablename__ = 'marriageentries'
    uuid = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String(255), nullable=False)
    Date = Column(Date)
    text = Column(String(255))
    language = Column(String(20))
    originallanguage = Column(String(20))
    translator = Column(String(30))
    originalentry = Column(Integer)
    celebrant = Column(String(30))
    istemporary = Column(Boolean)
    localization = Column(Integer, nullable=False)
    idstring = Column(String(50), nullable=False, unique=True)

class LocalAddress(Base):
    __tablename__ = 'localaddress'
    id = Column(Integer, primary_key=True, autoincrement=True)
    country = Column(String(30))
    voivodeship = Column(String(30))
    community = Column(String(30))
    city = Column(String(30))
    address = Column(String(40))
    postalcode = Column(Integer)
    parish = Column(String(40))

class PersonEntriesRelation(Base):
    __tablename__ = 'personentriesrelation'
    identries = Column(Integer, primary_key=True, autoincrement=True)
    idpersons = Column(Integer, nullable=False)
    insiderole = Column(String(25))
    marriageentriesuuid = Column(Integer, ForeignKey('marriageentries.uuid'), nullable=True)
    birthentriesuuid = Column(Integer, ForeignKey('birthentries.uuid'), nullable=True)
    deathentriesuuid = Column(Integer, ForeignKey('deathentries.uuid'), nullable=True)

class Roles(Base):
    __tablename__ = 'roles'
    idrole = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)

    users = relationship("Users", back_populates='roles')

