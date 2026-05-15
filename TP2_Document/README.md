# TP2 — MongoDB : Plateforme de Gestion de Dossiers Médicaux
## Use Case : HealthCare DZ — Hôpital Numérique

---

## 📖 Contexte

**HealthCare DZ** est un système d'information hospitalier. Les dossiers patients sont complexes : chaque patient a des consultations, des ordonnances, des résultats d'analyses, des antécédents. Avec un schéma relationnel, on compte 12 tables et des JOINs coûteux.

**Mission :** Modéliser et requêter ces dossiers médicaux avec MongoDB.

---

## 🎯 Objectifs Pédagogiques

- Concevoir un schéma documentaire (embedding vs referencing)
- Maîtriser les requêtes MongoDB (find, filter, projection)
- Écrire des pipelines d'agrégation avancés
- Gérer les index pour l'optimisation

---

## 📚 Rappel Théorique

### Embedding vs Referencing

\`\`\`
EMBEDDING (tout dans un document)
{
  _id: ObjectId("..."),
  patient: "Ahmed Bensalem",
  consultations: [
    { date: "2024-01-15", diagnostic: "Grippe", medicaments: [...] },
    { date: "2024-03-20", diagnostic: "Tension", medicaments: [...] }
  ]
}
→ ✅ Un seul accès DB pour tout le dossier
→ ❌ Document peut devenir énorme

REFERENCING (documents séparés)
{ _id: ObjectId("p1"), patient: "Ahmed" }
{ patient_id: ObjectId("p1"), date: "2024-01-15", diagnostic: "Grippe" }
→ ✅ Documents légers
→ ❌ Plusieurs requêtes ou $lookup
\`\`\`

### Pipeline d'Agrégation

\`\`\`javascript
db.patients.aggregate([
  { $match: { age: { $gte: 60 } } },
  { $unwind: "$consultations" },
  { $group: { _id: "$consultations.diagnostic", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
\`\`\`

---

## 🏗️ Schéma de la Base

\`\`\`javascript
// Collection : patients
{
  _id: ObjectId,
  cin: "198765432100",
  nom: "Bensalem",
  prenom: "Ahmed",
  dateNaissance: ISODate,
  sexe: "M" | "F",
  adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
  groupeSanguin: "O+",
  antecedents: ["Diabète", "HTA"],
  allergies: ["Pénicilline"],
  consultations: [
    {
      id: UUID,
      date: ISODate,
      medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
      diagnostic: "Hypertension artérielle",
      tension: { systolique: 145, diastolique: 92 },
      medicaments: [
        { nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }
      ],
      notes: "Surveillance tensionnelle recommandée"
    }
  ],
  analyses: [
    { analyse_id: ObjectId("...") }
  ]
}

// Collection : analyses
{
  _id: ObjectId,
  patient_id: ObjectId,
  date: ISODate,
  type: "Glycémie" | "NFS" | "Lipidogramme" | "ECG",
  resultats: { /* Flexible selon type */ },
  laboratoire: "Labo Central Alger",
  valide: Boolean
}
\`\`\`

---

## 📝 Exercices

### Ex1 — Modélisation et Insertion (5 pts) → `starter/ex1_modelisation.js`
### Ex2 — Requêtes de Base (5 pts) → `starter/ex2_queries.js`
### Ex3 — Agrégation Avancée (8 pts) → `starter/ex3_aggregation.js`
### Ex4 — Index et Optimisation (4 pts) → `starter/ex4_indexes.js`
### Ex5 — $lookup et Données Référencées (3 pts) → `starter/ex5_lookup.js`

---

## 🧪 Lancement

\`\`\`bash
docker exec -it nosql_mongodb mongosh -u admin -p admin123
load("/tp2/starter/ex1_modelisation.js")
\`\`\`

---

## 🏆 Barème : 25 pts | Bonus +3 pts (Transactions multi-documents)