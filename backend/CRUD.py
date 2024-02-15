from pip._internal.utils import urls
from sqlalchemy.orm import Session
from sqlalchemy import update
import models,schemas


def get_user(db: Session, username:str):
    db_user = db.query(models.Users).filter(models.Users.username == username).first()
    return db_user


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.Users(username=user.username,password = user.password, idrole = user.idrole)
    db.add(db_user)
    db.commit()


def get_local_address_record(db: Session, id:int):
    db_local_address = db.query().filter(models.LocalAddress.id == id).first()
    return db_local_address


def get_local_address_all(db: Session):
    db_local_addresses = db.query(models.LocalAddress).all()
    return db_local_addresses


def create_birth_entry(db: Session,id_string:str, entry: schemas.Entries, urls:list[schemas.URLS]=None,
                       locals:list[schemas.LocalCreate]=None, physicals:list[schemas.PhysicalLocations]=None,
                       location:schemas.LocalAddress=None, location_id:int = None,
                       persons:list[schemas.PersonCreate]=None,relationships:list[schemas.PersonEntriesRelationCreate]=None):

    db_local_link = models.LocalLink()
    db.add(db_local_link)
    db.flush()
    db_entry = models.BirthEntries(city= entry.city, Date= entry.date, text= entry.text, language= entry.language, originallanguage= entry.originallanguage, translator = entry.translator, celebrant= entry.celebrant, istemporary = False, localization = db_local_link.id, idstring=id_string, originalentry=entry.originalentry)
    db.add(db_entry)
    db.flush()
    if not location_id and location:
        db_local_address = models.LocalAddress(country = location.country, voivodeship = location.voivodeship, community = location.community, city=location.city, address = location.address, postalcode = location.postalcode, parish = location.parish)
        db.add(db_local_address)
        db.flush()
    if urls:
        for url in urls:
            db_urls = models.URLS(
                idurl=db_local_link.idurl, url=url.url, Condition=url.condition
            )
            db.add(db_urls)
    if physicals:
        for physical in physicals:
            db_physical_location = models.PhysicalLocations(
                tomenumber=physical.tomenumber, page=physical.page, Condition=physical.condition,
                type=physical.type, signature=physical.signature, actnumber=physical.actnumber,
                idphys=db_local_link.idphys, localaddressid=db_local_address.id if not location_id else location_id
            )
            db.add(db_physical_location)
    if locals:
        for local in locals:
            db_local = models.Local(idpath=db_local_link.idpath, localpath=local.localpath, Condition=local.condition)
            db.add(db_local)

    for i in range(len(persons)):
        db_person = models.Person(
            pfid=persons[i].pfid, cfid=persons[i].cfid, marriage=persons[i].marriage,
            name=persons[i].name, surname=persons[i].surname,
            birth=persons[i].birth, death=persons[i].death
        )
        db.add(db_person)
        db.flush()
        db_relationship = models.PersonEntriesRelation(idpersons=db_person.uuid, insiderole=relationships[i].insiderole,
                                                       birthentriesuuid=db_entry.uuid)
        db.add(db_relationship)



    db.commit()


def create_death_entry(db: Session,id_string:str, entry: schemas.Entries, urls:list[schemas.URLS]=None,
                       locals:list[schemas.LocalCreate]=None, physicals:list[schemas.PhysicalLocations]=None,
                       location:schemas.LocalAddress=None, location_id:int = None,
                       persons:list[schemas.PersonCreate]=None, relationships:list[schemas.PersonEntriesRelationCreate]=None):


    db_local_link = models.LocalLink()
    db.add(db_local_link)
    db.flush()
    db_entry = models.DeathEntries(city= entry.city, Date= entry.date, text= entry.text, language= entry.language, originallanguage= entry.originallanguage, translator = entry.translator, celebrant= entry.celebrant, istemporary = False, localization = db_local_link.id, idstring=id_string, originalentry=entry.originalentry)
    db.add(db_entry)
    db.flush()
    if not location_id and location:
        db_local_address = models.LocalAddress(country = location.country, voivodeship = location.voivodeship, community = location.community, city=location.city, address = location.address, postalcode = location.postalcode, parish = location.parish)
        db.add(db_local_address)
        db.flush()
    if urls:
        for url in urls:
            db_urls = models.URLS(
                idurl=db_local_link.idurl, url=url.url, Condition=url.condition
            )
            db.add(db_urls)
    if physicals:
        for physical in physicals:
            db_physical_location = models.PhysicalLocations(
                tomenumber=physical.tomenumber, page=physical.page, Condition=physical.condition,
                type=physical.type, signature=physical.signature, actnumber=physical.actnumber,
                idphys=db_local_link.idphys, localaddressid=db_local_address.id if not location_id else location_id
            )
            db.add(db_physical_location)
    if locals:
        for local in locals:
            db_local = models.Local(idpath=db_local_link.idpath, localpath=local.localpath, Condition=local.condition)
            db.add(db_local)

    for i in range(len(persons)):
        db_person = models.Person(
            pfid=persons[i].pfid, cfid=persons[i].cfid, marriage=persons[i].marriage,
            name=persons[i].name, surname=persons[i].surname,
            birth=persons[i].birth, death=persons[i].death
        )
        db.add(db_person)
        db.flush()
        db_relationship = models.PersonEntriesRelation(idpersons=db_person.uuid, insiderole=relationships[i].insiderole,
                                                       deathentriesuuid=db_entry.uuid)
        db.add(db_relationship)
    db.commit()


def create_marriage_entry(db: Session,id_string:str, entry: schemas.Entries, urls:list[schemas.URLS]=None,
                          locals:list[schemas.LocalCreate]=None, physicals:list[schemas.PhysicalLocations]=None,
                          location:schemas.LocalAddress=None, location_id:int = None,
                          persons:list[schemas.PersonCreate]=None,relationships:list[schemas.PersonEntriesRelationCreate]=None):

    db_local_link = models.LocalLink()
    db.add(db_local_link)
    db.flush()
    db_entry = models.MarriageEntries(city= entry.city, Date= entry.date, text= entry.text, language= entry.language, originallanguage= entry.originallanguage, translator = entry.translator, celebrant= entry.celebrant, istemporary = False, localization = db_local_link.id, idstring=id_string, originalentry=entry.originalentry)
    db.add(db_entry)
    db.flush()
    if not location_id and location:
            db_local_address = models.LocalAddress(country = location.country, voivodeship = location.voivodeship, community = location.community, city=location.city, address = location.address, postalcode = location.postalcode, parish = location.parish)
            db.add(db_local_address)
            db.flush()
    if urls:
        for url in urls:
            db_urls = models.URLS(
                idurl=db_local_link.idurl, url=url.url, Condition=url.condition
            )
            db.add(db_urls)
    if physicals:
        for physical in physicals:
            db_physical_location = models.PhysicalLocations(
                tomenumber=physical.tomenumber, page=physical.page, Condition=physical.condition,
                type=physical.type, signature=physical.signature, actnumber=physical.actnumber,
                idphys=db_local_link.idphys, localaddressid=db_local_address.id if not location_id else location_id
            )
            db.add(db_physical_location)
    if locals:
        for local in locals:
            db_local = models.Local(idpath=db_local_link.idpath, localpath=local.localpath, Condition=local.condition)
            db.add(db_local)

    for i in range(len(persons)):
        db_person = models.Person(
            pfid=persons[i].pfid, cfid=persons[i].cfid, marriage=persons[i].marriage,
            name=persons[i].name, surname=persons[i].surname,
            birth=persons[i].birth, death=persons[i].death
        )
        db.add(db_person)
        db.flush()
        db_relationship = models.PersonEntriesRelation(idpersons=db_person.uuid, insiderole=relationships[i].insiderole,
                                                       marriageentriesuuid=db_entry.uuid)
        db.add(db_relationship)

    db.commit()


def get_birth_entries(db:Session, skip:int, limit:int):
    return db.query(models.BirthEntries).offset(skip).limit(limit).all()


def get_death_entries(db:Session, skip:int, limit:int):
    return db.query(models.DeathEntries).offset(skip).limit(limit).all()


def get_marriage_entries(db:Session, skip:int, limit:int):
    return db.query(models.MarriageEntries).offset(skip).limit(limit).all()

def get_birth_entry(db:Session, entry_id: int):
    db_entry = db.query(models.BirthEntries).filter(models.BirthEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.birthentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
    return db_entry, db_urls, db_local, db_physical,db_relation, db_person


def get_death_entry(db:Session, entry_id: int):
    db_entry = db.query(models.DeathEntries).filter(models.DeathEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.deathentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
    return db_entry, db_urls, db_local, db_physical,db_relation, db_person


def get_marriage_entry(db:Session, entry_id: int):
    db_entry = db.query(models.MarriageEntries).filter(models.MarriageEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.marriageentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
    return db_entry, db_urls, db_local, db_physical,db_relation, db_person


def delete_birth_entry(db:Session,entry_id: int):
    db_entry = db.query(models.BirthEntries).filter(models.BirthEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.birthentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
        db.delete(relation)
        db.commit()


    for person in db_person:
        db.delete(person)


    for phys in db_physical:
        db.delete(phys)
    for local in db_local:
        db.delete(local)
    for url in db_urls:
        db.delete(url)
    db.commit()
    db.delete(db_entry)
    db.delete(db_link)
    db.commit()


def delete_death_entry(db:Session,entry_id: int):
    db_entry = db.query(models.DeathEntries).filter(models.DeathEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.deathentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
        db.delete(relation)
        db.commit()


    for person in db_person:
        db.delete(person)


    for phys in db_physical:
        db.delete(phys)
    for local in db_local:
        db.delete(local)
    for url in db_urls:
        db.delete(url)
    db.commit()
    db.delete(db_entry)
    db.flush()
    db.delete(db_link)
    db.commit()


def delete_marriage_entry(db:Session,entry_id: int):
    db_entry = db.query(models.MarriageEntries).filter(models.MarriageEntries.uuid == entry_id).first()
    db_link = db.query(models.LocalLink).filter(models.LocalLink.id == db_entry.localization).first()
    db_urls = db.query(models.URLS).filter(models.URLS.idurl == db_link.idurl).all()
    db_local = db.query(models.Local).filter(models.Local.idpath == db_link.idpath).all()
    db_physical = db.query(models.PhysicalLocations).filter(models.PhysicalLocations.idphys == db_link.idphys).all()
    db_relation = db.query(models.PersonEntriesRelation).filter(models.PersonEntriesRelation.marriageentriesuuid == db_entry.uuid).all()
    db_person = []
    for relation in db_relation:
        db_person.append(db.query(models.Person).filter(models.Person.uuid == relation.idpersons).first())
        db.delete(relation)
        db.commit()

    for person in db_person:
        db.delete(person)

    for phys in db_physical:
        db.delete(phys)
    for local in db_local:
        db.delete(local)
    for url in db_urls:
        db.delete(url)
    db.commit()
    db.delete(db_entry)
    db.flush()
    db.delete(db_link)
    db.commit()


def update_death_entry(db: Session, entry_id:int, is_termporary:bool, originalentry:int):
    db_entry = db.query(models.DeathEntries).filter(models.DeathEntries.uuid == entry_id)
    db_entry.update(
        {
            "istemporary":is_termporary,
            "originalentry":originalentry
        }
    )
    db.commit()


def update_birth_entry(db: Session, entry_id:int, is_termporary:bool, originalentry:int):
    db_entry = db.query(models.BirthEntries).filter(models.BirthEntries.uuid == entry_id)
    db_entry.update(
        {
            "istemporary":is_termporary,
            "originalentry":originalentry
        }
    )
    db.commit()


def update_marige_entry(db: Session,entry_id:int,is_termporary:bool,originalentry:int):
    db_entry = db.query(models.MarriageEntries).filter(models.MarriageEntries.uuid == entry_id)
    db_entry.update(
        {
            "istemporary":is_termporary,
            "originalentry":originalentry
        }
    )
    db.commit()
