/**
 * TP2 - Exercice 4 : Index et Optimisation
 */

use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents
db.patients.createIndex({
  "adresse.wilaya": 1,
  antecedents: 1
});

// Index 2 : Recherche par date de consultation
db.patients.createIndex({
  dateConsultation: 1
});

// Index 3 : Texte sur diagnostics pour recherche full-text
db.patients.createIndex({
  diagnostics: "text"
});

// Index 4 : Analyses par patient (lookup)
db.analyses.createIndex({
  patientId: 1
});


// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────

// Requête de test
const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

print("=== AVANT index ===");

// Exécution avec explain avant index
db.patients.find(requeteTest)
  .explain("executionStats");

print("\n=== APRÈS index ===");

// Après création des index
db.patients.find(requeteTest)
  .explain("executionStats");

// Comparaison des métriques :
// - nReturned
// - totalDocsExamined
// - executionTimeMillis


// ─── 4.4 : Index TTL pour archivage ───────────────────────────────────────────

// 5 ans = 5 × 365 × 24 × 60 × 60
db.analyses.createIndex(
  { date: 1 },
  { expireAfterSeconds: 157680000 }
);