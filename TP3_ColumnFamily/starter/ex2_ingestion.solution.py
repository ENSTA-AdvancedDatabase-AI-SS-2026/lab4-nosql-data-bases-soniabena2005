"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""

from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

# Configuration
CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5

WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]

COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}


def connect():
    """Connexion au cluster Cassandra"""
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster


def generate_mesure(capteur_id, wilaya, commune, timestamp):
    """Générer une mesure réaliste pour un capteur"""

    tension_base = 220  # Volts

    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": round(tension_base + random.gauss(0, 5), 2),
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": random.random() < 0.05,
    }


# Prepared statement globale
INSERT_MESURE = None


def prepare_statements(session):
    global INSERT_MESURE

    INSERT_MESURE = session.prepare("""
        INSERT INTO mesures_par_capteur (
            capteur_id,
            date_jour,
            timestamp,
            wilaya,
            commune,
            tension_v,
            courant_a,
            puissance_kw,
            frequence_hz,
            temperature,
            alerte
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """)


def insert_single(session, mesure):
    """
    Insérer une seule mesure avec prepared statement
    """

    session.execute(
        INSERT_MESURE,
        (
            mesure["capteur_id"],
            mesure["date_jour"],
            mesure["timestamp"],
            mesure["wilaya"],
            mesure["commune"],
            mesure["tension_v"],
            mesure["courant_a"],
            mesure["puissance_kw"],
            mesure["frequence_hz"],
            mesure["temperature"],
            mesure["alerte"],
        )
    )


def insert_batch(session, mesures: list):
    """
    Insérer un batch efficacement
    Utilisation de UNLOGGED BATCH
    Max 50 éléments
    """

    batch = BatchStatement(batch_type=BatchType.UNLOGGED)

    for mesure in mesures:
        batch.add(
            INSERT_MESURE,
            (
                mesure["capteur_id"],
                mesure["date_jour"],
                mesure["timestamp"],
                mesure["wilaya"],
                mesure["commune"],
                mesure["tension_v"],
                mesure["courant_a"],
                mesure["puissance_kw"],
                mesure["frequence_hz"],
                mesure["temperature"],
                mesure["alerte"],
            )
        )

    session.execute(batch)


def run_ingestion(session):
    """
    Générer et insérer NB_CAPTEURS × MINUTES_HISTORIQUE mesures
    """

    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")

    start = time.time()

    # Préparer les requêtes
    prepare_statements(session)

    # Génération des capteurs
    capteurs = []

    for _ in range(NB_CAPTEURS):

        wilaya = random.choice(WILAYAS)
        commune = random.choice(COMMUNES[wilaya])

        capteurs.append({
            "capteur_id": uuid.uuid4(),
            "wilaya": wilaya,
            "commune": commune
        })

    # Historique des minutes
    now = datetime.now()

    total_insertions = 0

    for minute in range(MINUTES_HISTORIQUE):

        timestamp = now - timedelta(minutes=minute)

        mesures_batch = []

        for capteur in capteurs:

            mesure = generate_mesure(
                capteur["capteur_id"],
                capteur["wilaya"],
                capteur["commune"],
                timestamp
            )

            mesures_batch.append(mesure)

            # Batch max 50
            if len(mesures_batch) == 50:
                insert_batch(session, mesures_batch)
                total_insertions += len(mesures_batch)
                mesures_batch = []

        # Dernier batch
        if mesures_batch:
            insert_batch(session, mesures_batch)
            total_insertions += len(mesures_batch)

    elapsed = time.time() - start

    print(f"\n✅ {total_insertions:,} mesures insérées en {elapsed:.1f}s")
    print(f"   Débit : {total_insertions/elapsed:,.0f} mesures/seconde")


if __name__ == "__main__":

    session, cluster = connect()

    run_ingestion(session)

    cluster.shutdown()