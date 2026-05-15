# Rapport TP3 — Cassandra : SmartGrid DZ

---

## 1. Justification des Partition Keys

| Table | Partition Key | Justification |
|-------|--------------|---------------|
| `mesures_par_capteur` | `(capteur_id, date)` | On interroge toujours les mesures d'un capteur donné sur une journée. Ajouter `date` évite une partition qui grossit indéfiniment (unbounded partition). |
| `alertes_par_wilaya` | `(wilaya, date)` | Les alertes sont consultées par zone géographique et par jour. Partitionner par wilaya seule créerait une hot partition (Alger concentre plus de trafic). |
| `agregats_horaires` | `(wilaya, date)` | Le dashboard charge les agrégats d'une wilaya pour une journée entière. |

**Risques évités :**
- Sans `date` dans la clé, une partition grossit sans limite → performance dégradée au-delà de ~100MB par partition.
- Partitionner uniquement par `wilaya` crée des **hot partitions** car certaines wilayas ont beaucoup plus de capteurs.

---

## 2. Pourquoi ALLOW FILTERING est Dangereux en Production

`ALLOW FILTERING` force Cassandra à scanner **toutes les partitions** de la table pour trouver les lignes correspondantes. C'est équivalent à un `FULL TABLE SCAN` en SQL.

**Conséquences :**
- Sur 10 000 capteurs × 90 jours de données = des centaines de millions de lignes à parcourir.
- Latence imprévisible pouvant dépasser plusieurs secondes.
- Charge excessive sur tous les nœuds du cluster simultanément.
- En cas de pic de trafic, peut provoquer un timeout ou crash du cluster.

**Solution correcte :** créer une table dédiée dont la Partition Key correspond exactement aux filtres de la requête.

---

## 3. Comparaison TWCS vs STCS vs LCS

| Stratégie | Cas d'usage | Avantages | Inconvénients |
|-----------|-------------|-----------|---------------|
| **TWCS** (TimeWindowCompactionStrategy) | Séries temporelles avec TTL | Compacte les données par fenêtre de temps, supprime les données expirées efficacement | Mauvais pour les données sans TTL ou les mises à jour fréquentes |
| **STCS** (SizeTieredCompactionStrategy) | Workload write-heavy | Très efficace en écriture, par défaut Cassandra | Lecture plus lente, espace disque temporairement doublé pendant compaction |
| **LCS** (LeveledCompactionStrategy) | Workload read-heavy | Lectures rapides, peu de fichiers SSTable | Écriture plus coûteuse en I/O |

**Choix pour SmartGrid :**
- `mesures_par_capteur` → **TWCS** : données temporelles avec TTL 90 jours, insertions massives, peu de mises à jour.
- `agregats_horaires` → **LCS** : lus fréquemment par le dashboard, rarement écrits.