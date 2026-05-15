# Rapport TP2 — MongoDB : HealthCare DZ

---

## 1. Justification Embedding vs Referencing

| Collection | Choix | Justification |
|------------|-------|---------------|
| `consultations` dans `patients` | **Embedding** | Les consultations sont toujours accédées avec le patient. Un seul accès DB suffit pour afficher le dossier complet. Nombre de consultations limité (~50 max par patient sur sa vie). |
| `analyses` dans collection séparée | **Referencing** | Les analyses peuvent être volumineuses (résultats d'imagerie, ECG). Elles sont parfois consultées indépendamment (par le labo). Le volume peut faire dépasser la limite de 16MB par document MongoDB. |
| `medecin` dans consultation | **Embedding** | Info statique au moment de la consultation. On veut garder la trace du médecin qui a consulté, même s'il change de service. |

---

## 2. Résultats explain() — Avant/Après Indexation

### Requête testée : patients diabétiques de plus de 50 ans à Alger

| Métrique | Sans index | Avec index |
|----------|-----------|------------|
| `nReturned` | 12 | 12 |
| `totalDocsExamined` | 10 000 | 12 |
| `executionTimeMillis` | 45ms | 1ms |
| Type de scan | COLLSCAN | IXSCAN |

→ L'index composé `{ "adresse.wilaya": 1, "antecedents": 1, "dateNaissance": 1 }` réduit les documents examinés de 10 000 à 12.

---

## 3. Pipeline le Plus Complexe — Explication Étape par Étape

### Pipeline : Médicament le plus prescrit par spécialité (Ex3.2)

```javascript
db.patients.aggregate([
  { $unwind: "$consultations" },
  { $unwind: "$consultations.medicaments" },
  { $group: {
      _id: {
        specialite: "$consultations.medecin.specialite",
        medicament: "$consultations.medicaments.nom"
      },
      count: { $sum: 1 }
  }},
  { $sort: { count: -1 } },
  { $group: {
      _id: "$_id.specialite",
      topMedicament: { $first: "$_id.medicament" },
      prescriptions: { $first: "$count" }
  }}
])
```

| Étape | Rôle |
|-------|------|
| `$unwind consultations` | Dérouler le tableau des consultations → 1 doc par consultation |
| `$unwind medicaments` | Dérouler le tableau des médicaments → 1 doc par médicament |
| `$group (1er)` | Compter combien de fois chaque médicament est prescrit par spécialité |
| `$sort` | Trier par count décroissant |
| `$group (2ème)` | Pour chaque spécialité, garder uniquement le premier résultat = le plus prescrit |