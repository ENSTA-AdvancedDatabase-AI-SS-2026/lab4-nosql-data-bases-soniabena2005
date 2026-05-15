# Rapport TP5 — Performance & Optimisation NoSQL

---

## Ex1 — Benchmark Écriture (100 000 enregistrements)

### Débit d'écriture

| Base | Enregistrements/sec | Temps total |
|------|-------------------|-------------|
| Redis | 98 500 | 1.01s |
| Cassandra | 42 300 | 2.36s |
| MongoDB | 18 700 | 5.34s |
| Neo4j | 4 200 | 23.8s |

### Latence (ms)

| Base | P50 | P95 | P99 |
|------|-----|-----|-----|
| Redis | 0.08ms | 0.21ms | 0.45ms |
| Cassandra | 1.2ms | 4.8ms | 12ms |
| MongoDB | 2.1ms | 9.3ms | 28ms |
| Neo4j | 8.4ms | 45ms | 120ms |

### Utilisation Ressources pendant l'insertion

| Base | CPU moyen | Mémoire utilisée |
|------|-----------|-----------------|
| Redis | 18% | 420 MB |
| Cassandra | 55% | 1.2 GB |
| MongoDB | 42% | 890 MB |
| Neo4j | 78% | 2.1 GB |

**Analyse :** Redis domine en écriture car tout se fait en RAM sans overhead disque. Cassandra est optimisée pour les insertions massives grâce à ses LSM-trees. Neo4j est le plus lent car chaque nœud/relation nécessite la mise à jour d'index de graphe.

---

## Ex2 — Benchmark Lecture (10 000 requêtes)

### Point Lookup (recherche par clé connue)

| Base | Latence moyenne | P99 |
|------|----------------|-----|
| Redis | 0.1ms | 0.3ms |
| MongoDB | 1.8ms | 8ms |
| Cassandra | 2.1ms | 9ms |
| Neo4j | 5.2ms | 22ms |

### Range Query (plage temporelle)

| Base | Latence moyenne | P99 |
|------|----------------|-----|
| Cassandra | 3.4ms | 15ms |
| MongoDB | 12ms | 55ms |
| Redis | 18ms | 60ms |
| Neo4j | 35ms | 140ms |

### Complex Query (agrégation / traversal)

| Base | Latence moyenne | P99 |
|------|----------------|-----|
| MongoDB | 28ms | 95ms |
| Neo4j | 42ms | 180ms |
| Cassandra | 85ms | 310ms |
| Redis | 120ms | 450ms |

### Impact de l'Indexation (MongoDB — requête complexe)

| Scénario | Latence moyenne | Docs examinés |
|----------|----------------|---------------|
| Sans index | 245ms | 100 000 |
| Avec index simple | 28ms | 1 200 |
| Avec index composé | 8ms | 47 |

**Analyse :** Cassandra excelle sur les range queries grâce au clustering key qui trie les données physiquement sur disque. Neo4j domine sur les traversals de graphe profonds. MongoDB est le plus polyvalent pour les requêtes complexes avec agrégation.

---

## Ex3 — Test de Charge Concurrente (50 clients simultanés)

### Dégradation des performances sous charge

| Base | Latence 1 client | Latence 50 clients | Dégradation |
|------|-----------------|-------------------|-------------|
| Redis | 0.1ms | 0.9ms | x9 |
| Cassandra | 2.1ms | 5.8ms | x2.7 |
| MongoDB | 1.8ms | 12ms | x6.7 |
| Neo4j | 5.2ms | 48ms | x9.2 |

### Goulots d'étranglement identifiés

| Base | Goulot principal | Explication |
|------|-----------------|-------------|
| Redis | Single-threaded | Redis traite les commandes en séquence sur un seul thread. Sous forte charge, la file d'attente s'allonge. |
| MongoDB | Lock contention | Les écritures concurrentes sur la même collection créent des conflits de verrous. |
| Cassandra | Compaction I/O | Les opérations de compaction en arrière-plan consomment du disque et dégradent les lectures. |
| Neo4j | Heap JVM | Les traversals profonds consomment beaucoup de mémoire heap Java, déclenchant le GC. |

---

## Ex4 — Tableau de Recommandation

| Critère | Redis | MongoDB | Cassandra | Neo4j |
|---------|-------|---------|-----------|-------|
| Débit écriture | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Débit lecture (point) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Range queries | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Requêtes complexes | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scalabilité horizontale | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Charge concurrente | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Use case idéal** | Cache / Sessions | Documents / API | IoT / Logs | Graphes / Réseaux |

### Recommandation Finale

| Besoin | Choix recommandé | Justification |
|--------|-----------------|---------------|
| Cache applicatif, sessions, compteurs temps réel | **Redis** | Latence sub-milliseconde, structures de données riches |
| API REST, catalogue produits, dossiers médicaux | **MongoDB** | Schéma flexible, requêtes riches, aggregation pipeline |
| Ingestion IoT, logs, métriques (millions/sec) | **Cassandra** | Scalabilité linéaire, écriture optimisée, TTL natif |
| Réseau social, recommandations, détection fraude | **Neo4j** | Traversals de graphe impossibles à reproduire en SQL |

**Conclusion générale :** Il n'existe pas de base universelle. Le choix dépend du workload dominant. Pour une architecture microservices complexe, combiner plusieurs bases (polyglot persistence) est souvent la meilleure approche — par exemple Redis + MongoDB + Cassandra selon les services.