# Rapport TP1 — Redis : ShopFast

---

## 1. Comparaison de Performance (Hit vs Miss)

| Scénario | Temps de réponse |
|----------|-----------------|
| Cache MISS (accès PostgreSQL) | ~350ms |
| Cache HIT (accès Redis) | ~2ms |
| Gain | x175 |

- Le cache HIT est quasi instantané car Redis stocke tout en mémoire RAM.
- Le cache MISS oblige un aller-retour vers PostgreSQL + une écriture dans Redis.

---

## 2. Justification des Choix de Modélisation

| Donnée | Structure choisie | Justification |
|--------|------------------|---------------|
| Produit | Hash | Un produit = un objet avec plusieurs champs (nom, prix, stock). HSET permet de modifier un seul champ sans réécrire tout l'objet. |
| Panier | Hash | Clé = produit_id, valeur = quantité. Facile à incrémenter avec HINCRBY. |
| Historique navigation | List | Ordre chronologique naturel. LPUSH ajoute en tête, LTRIM garde les N derniers. |
| Produits par catégorie | Set | Pas de doublons, opérations ensemblistes (SINTER pour trouver produits communs à 2 catégories). |
| Classement ventes | Sorted Set | Score = nombre de ventes. ZREVRANGE retourne le top automatiquement trié. |
| Sessions | String + TTL | Simple clé/valeur avec expiration automatique. |

---

## 3. Réponses aux Questions de Réflexion

### Q1 — Que se passe-t-il si Redis redémarre ?

Par défaut, Redis est **volatile** : toutes les données en mémoire sont perdues au redémarrage. Pour éviter cela, deux options :
- **RDB (snapshot)** : sauvegarde périodique sur disque (toutes les X minutes). Risque de perdre les dernières écritures.
- **AOF (Append Only File)** : chaque écriture est journalisée sur disque. Plus fiable mais plus lent.

Dans notre cas e-commerce, une perte du cache est acceptable (on recharge depuis PostgreSQL), mais une perte des sessions utilisateur est problématique → il faut activer AOF pour les sessions.

---

### Q2 — Comment gérer la cohérence cache/DB en cas d'accès concurrent ?

Le problème classique est le **cache stampede** : si 1000 utilisateurs demandent le même produit au même moment pendant un MISS, ils vont tous taper PostgreSQL simultanément.

Solutions :
- **Mutex/Lock** : le premier thread qui détecte le MISS pose un verrou, les autres attendent.
- **Probabilistic early expiration** : renouveler le cache un peu avant l'expiration réelle.
- **Write-through** : à chaque modification en DB, on met à jour Redis immédiatement (cohérence forte mais plus de latence en écriture).

---

### Q3 — Quand un TTL trop court est-il problématique ?

Un TTL trop court provoque :
- **Trop de cache MISS** → la DB est surchargée, le cache ne sert à rien.
- **Cache stampede** plus fréquent.
- **Mauvaise expérience utilisateur** : les pages rechargent lentement trop souvent.

Exemple concret : un TTL de 10 secondes sur les fiches produit pendant un pic de trafic (soldes) → chaque produit est rechargé depuis PostgreSQL des centaines de fois par minute, ce qui annule le bénéfice du cache.

**Règle** : TTL = fréquence de mise à jour de la donnée. Une fiche produit qui change 1 fois/jour peut avoir un TTL de plusieurs heures.