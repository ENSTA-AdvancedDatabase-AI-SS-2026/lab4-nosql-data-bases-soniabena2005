/**
 * TP2 - Exercice 3 : Pipelines d'Agrégation
 * Use Case : Statistiques médicales HealthCare DZ
 */

use("medical_db");

// ─── 3.1 : Distribution des diagnostics par wilaya ────────────────────────────
print("=== 3.1 : Top diagnostics par wilaya ===");

const diagParWilaya = db.patients.aggregate([
  // Étape 1 - $unwind sur consultations (décompose le tableau)
  { $unwind: "$consultations" },

  // Étape 2 - $group par wilaya + diagnostic, on compte les occurrences
  {
    $group: {
      _id: {
        wilaya: "$wilaya",
        diagnostic: "$consultations.diagnostic"
      },
      count: { $sum: 1 }
    }
  },

  // Étape 3 - $sort par count décroissant
  { $sort: { count: -1 } },

  // Étape 4 - $limit aux 20 premiers résultats
  { $limit: 20 }
]).toArray();

printjson(diagParWilaya);


// ─── 3.2 : Médicament le plus prescrit par spécialité ─────────────────────────
print("\n=== 3.2 : Top médicaments par spécialité ===");

const medsParSpecialite = db.patients.aggregate([
  // Décomposer le tableau consultations
  { $unwind: "$consultations" },

  // Décomposer le tableau médicaments dans chaque consultation
  { $unwind: "$consultations.medicaments" },

  // Grouper par spécialité du médecin + nom du médicament
  {
    $group: {
      _id: {
        specialite: "$consultations.specialite",
        medicament: "$consultations.medicaments.nom"
      },
      total_prescriptions: { $sum: 1 }
    }
  },

  // Trier par spécialité puis par nombre de prescriptions décroissant
  { $sort: { "_id.specialite": 1, total_prescriptions: -1 } },

  // Re-grouper par spécialité pour garder uniquement le top 1
  {
    $group: {
      _id: "$_id.specialite",
      top_medicament: { $first: "$_id.medicament" },
      total_prescriptions: { $first: "$total_prescriptions" }
    }
  },

  // Trier le résultat final par spécialité
  { $sort: { _id: 1 } }
]).toArray();

printjson(medsParSpecialite);


// ─── 3.3 : Évolution mensuelle des consultations ──────────────────────────────
print("\n=== 3.3 : Consultations par mois (12 derniers mois) ===");

const evolutionMensuelle = db.patients.aggregate([
  { $unwind: "$consultations" },
  {
    $match: {
      "consultations.date": {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      }
    }
  },

  // Grouper par année + mois extraits de la date
  {
    $group: {
      _id: {
        annee: { $year: "$consultations.date" },
        mois:  { $month: "$consultations.date" }
      },
      total_consultations: { $sum: 1 }
    }
  },

  // Trier chronologiquement
  { $sort: { "_id.annee": 1, "_id.mois": 1 } },

  // Formater la date en "YYYY-MM" (avec zero-padding sur le mois)
  {
    $project: {
      _id: 0,
      periode: {
        $concat: [
          { $toString: "$_id.annee" },
          "-",
          {
            $cond: {
              if: { $lt: ["$_id.mois", 10] },
              then: { $concat: ["0", { $toString: "$_id.mois" }] },
              else: { $toString: "$_id.mois" }
            }
          }
        ]
      },
      total_consultations: 1
    }
  }
]).toArray();

printjson(evolutionMensuelle);


// ─── 3.4 : Patients à risque multiple ────────────────────────────────────────
print("\n=== 3.4 : Profil patients à risque élevé ===");

const patientsRisque = db.patients.aggregate([
  {
    $match: {
      antecedents: { $all: ["Diabète type 2", "HTA"] },
      // Filtre âge > 60 : date_naissance < aujourd'hui - 60 ans
      date_naissance: {
        $lt: new Date(new Date().setFullYear(new Date().getFullYear() - 60))
      }
    }
  },

  // Calculer l'âge et le nombre de consultations par patient
  {
    $addFields: {
      age: {
        $floor: {
          $divide: [
            { $subtract: [new Date(), "$date_naissance"] },
            1000 * 60 * 60 * 24 * 365.25   // millisecondes → années
          ]
        }
      },
      nb_consultations: { $size: { $ifNull: ["$consultations", []] } }
    }
  },

  // Statistiques globales sur ce groupe à risque
  {
    $group: {
      _id: null,
      total_patients:          { $sum: 1 },
      age_moyen:               { $avg: "$age" },
      age_min:                 { $min: "$age" },
      age_max:                 { $max: "$age" },
      moy_consultations:       { $avg: "$nb_consultations" },
      total_consultations:     { $sum: "$nb_consultations" }
    }
  },

  // Présentation propre du résultat
  {
    $project: {
      _id: 0,
      total_patients: 1,
      age_moyen:          { $round: ["$age_moyen", 1] },
      age_min: 1,
      age_max: 1,
      moy_consultations:  { $round: ["$moy_consultations", 1] },
      total_consultations: 1
    }
  }
]).toArray();

printjson(patientsRisque);


// ─── 3.5 : Rapport médecins ───────────────────────────────────────────────────
print("\n=== 3.5 : Top 5 médecins & taux de ré-consultation ===");

const rapportMedecins = db.patients.aggregate([
  { $unwind: "$consultations" },

  // Grouper par médecin : patients uniques (addToSet) + total consultations
  {
    $group: {
      _id: "$consultations.medecin",
      patients_uniques:     { $addToSet: "$_id" },   // set de _id patients
      total_consultations:  { $sum: 1 }
    }
  },

  // Calculer le taux de ré-consultation
  {
    $addFields: {
      nb_patients_uniques: { $size: "$patients_uniques" },
      taux_reconsultation: {
        $multiply: [
          {
            $divide: [
              { $subtract: ["$total_consultations", { $size: "$patients_uniques" }] },
              { $size: "$patients_uniques" }
            ]
          },
          100
        ]
      }
    }
  },

  // Trier par taux de ré-consultation décroissant
  { $sort: { taux_reconsultation: -1 } },

  // Garder uniquement le top 5
  { $limit: 5 },

  // Nettoyer le résultat final
  {
    $project: {
      _id: 0,
      medecin:              "$_id",
      nb_patients_uniques:  1,
      total_consultations:  1,
      taux_reconsultation:  { $round: ["$taux_reconsultation", 2] }
    }
  }
]).toArray();

printjson(rapportMedecins);