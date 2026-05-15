/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */

use("medical_db");

// ─── 1.1 : Créer la collection avec validation ────────────────────────────────
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe", "adresse", "groupeSanguin"],
      properties: {
        cin: {
          bsonType: "string",
          minLength: 12,
          maxLength: 18,
          description: "Numéro CIN algérien — obligatoire, chaîne 12-18 caractères"
        },
        nom: {
          bsonType: "string",
          minLength: 2,
          description: "Nom de famille — obligatoire"
        },
        prenom: {
          bsonType: "string",
          minLength: 2,
          description: "Prénom — obligatoire"
        },
        dateNaissance: {
          bsonType: "date",
          description: "Date de naissance — obligatoire, type Date"
        },
        sexe: {
          bsonType: "string",
          enum: ["M", "F"],
          description: "Sexe — obligatoire, 'M' ou 'F'"
        },
        adresse: {
          bsonType: "object",
          required: ["wilaya"],
          properties: {
            wilaya:  { bsonType: "string" },
            commune: { bsonType: "string" }
          },
          description: "Adresse avec au minimum la wilaya — obligatoire"
        },
        groupeSanguin: {
          bsonType: "string",
          enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
          description: "Groupe sanguin ABO/Rh — obligatoire"
        },
        antecedents: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Liste des antécédents médicaux"
        },
        allergies: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Liste des allergies connues"
        },
        telephone: {
          bsonType: "string",
          description: "Numéro de téléphone (optionnel)"
        },
        consultations: {
          bsonType: "array",
          description: "Consultations embarquées (pattern imbriqué)",
          items: {
            bsonType: "object",
            required: ["date", "medecin", "diagnostic"],
            properties: {
              id:         { bsonType: "binData" },
              date:       { bsonType: "date" },
              medecin: {
                bsonType: "object",
                required: ["nom", "specialite"],
                properties: {
                  nom:        { bsonType: "string" },
                  specialite: { bsonType: "string" }
                }
              },
              diagnostic:  { bsonType: "string" },
              tension: {
                bsonType: "object",
                properties: {
                  systolique:  { bsonType: "int" },
                  diastolique: { bsonType: "int" }
                }
              },
              medicaments: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  properties: {
                    nom:    { bsonType: "string" },
                    dosage: { bsonType: "string" },
                    duree:  { bsonType: "string" }
                  }
                }
              },
              notes: { bsonType: "string" }
            }
          }
        }
      }
    }
  },
  validationLevel:  "moderate",   // les documents existants ne sont pas re-validés
  validationAction: "error"        // rejeter les insertions/updates invalides
});

// ─── 1.2 : 20 patients algériens ─────────────────────────────────────────────
const patients = [

  // ── Patient 1 ──
  {
    cin: "198001012300",
    nom: "Bensalem", prenom: "Ahmed",
    dateNaissance: new Date("1980-01-01"), sexe: "M",
    telephone: "0551234567",
    adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
    groupeSanguin: "O+",
    antecedents: ["Diabète type 2", "HTA"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-03-10"),
        medecin: { nom: "Dr. Mansouri", specialite: "Médecine générale" },
        diagnostic: "Contrôle glycémique",
        medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "90 jours" }],
        notes: "Glycémie à jeun : 1,42 g/L — régime strict conseillé"
      },
      {
        id: UUID(), date: new Date("2023-09-18"),
        medecin: { nom: "Dr. Mansouri", specialite: "Médecine générale" },
        diagnostic: "Hypertension artérielle",
        tension: { systolique: 148, diastolique: 94 },
        medicaments: [
          { nom: "Amlodipine", dosage: "5mg", duree: "30 jours" },
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" }
        ],
        notes: "Ajout antihypertenseur"
      },
      {
        id: UUID(), date: new Date("2024-01-15"),
        medecin: { nom: "Dr. Khelifi", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle — suivi spécialisé",
        tension: { systolique: 145, diastolique: 92 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Surveillance tensionnelle recommandée"
      }
    ]
  },

  // ── Patient 2 ──
  {
    cin: "199505157800",
    nom: "Bouzid", prenom: "Fatima",
    dateNaissance: new Date("1995-05-15"), sexe: "F",
    telephone: "0661234890",
    adresse: { wilaya: "Oran", commune: "Es Sénia" },
    groupeSanguin: "A+",
    antecedents: ["Asthme"],
    allergies: ["Aspirine", "AINS"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-02-20"),
        medecin: { nom: "Dr. Berrahal", specialite: "Pneumologie" },
        diagnostic: "Crise d'asthme modérée",
        medicaments: [
          { nom: "Salbutamol spray", dosage: "100µg", duree: "En cas de crise" },
          { nom: "Béclométhasone", dosage: "250µg", duree: "60 jours" }
        ],
        notes: "Peak-flow : 72 % du théorique"
      },
      {
        id: UUID(), date: new Date("2023-11-05"),
        medecin: { nom: "Dr. Berrahal", specialite: "Pneumologie" },
        diagnostic: "Asthme stable — contrôle annuel",
        medicaments: [{ nom: "Béclométhasone", dosage: "250µg", duree: "90 jours" }],
        notes: "Peak-flow : 88 % — bonne observance"
      },
      {
        id: UUID(), date: new Date("2024-03-12"),
        medecin: { nom: "Dr. Benali", specialite: "Médecine générale" },
        diagnostic: "Rhinite allergique associée",
        medicaments: [{ nom: "Loratadine", dosage: "10mg", duree: "30 jours" }],
        notes: "Éviction des allergènes recommandée"
      }
    ]
  },

  // ── Patient 3 ──
  {
    cin: "197812034100",
    nom: "Hamdi", prenom: "Mohamed",
    dateNaissance: new Date("1978-12-03"), sexe: "M",
    telephone: "0771122334",
    adresse: { wilaya: "Constantine", commune: "El Khroub" },
    groupeSanguin: "B+",
    antecedents: ["Diabète type 2", "HTA", "Dyslipidémie"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-01-08"),
        medecin: { nom: "Dr. Ferhat", specialite: "Cardiologie" },
        diagnostic: "Bilan cardio-métabolique",
        tension: { systolique: 150, diastolique: 96 },
        medicaments: [
          { nom: "Atorvastatine", dosage: "20mg", duree: "90 jours" },
          { nom: "Ramipril", dosage: "5mg", duree: "90 jours" }
        ],
        notes: "LDL à 1,62 g/L — objectif < 0,7 g/L"
      },
      {
        id: UUID(), date: new Date("2023-07-22"),
        medecin: { nom: "Dr. Ferhat", specialite: "Cardiologie" },
        diagnostic: "Suivi HTA + dyslipidémie",
        tension: { systolique: 138, diastolique: 88 },
        medicaments: [{ nom: "Atorvastatine", dosage: "40mg", duree: "90 jours" }],
        notes: "Majoration de la dose de statine"
      },
      {
        id: UUID(), date: new Date("2024-02-14"),
        medecin: { nom: "Dr. Ferhat", specialite: "Cardiologie" },
        diagnostic: "Contrôle tensionnel satisfaisant",
        tension: { systolique: 132, diastolique: 84 },
        medicaments: [
          { nom: "Ramipril", dosage: "5mg", duree: "90 jours" },
          { nom: "Atorvastatine", dosage: "40mg", duree: "90 jours" }
        ],
        notes: "Continuer le traitement actuel"
      }
    ]
  },

  // ── Patient 4 ──
  {
    cin: "200203298500",
    nom: "Rahmani", prenom: "Amira",
    dateNaissance: new Date("2002-03-29"), sexe: "F",
    telephone: "0551987654",
    adresse: { wilaya: "Blida", commune: "Boufarik" },
    groupeSanguin: "AB-",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-05-03"),
        medecin: { nom: "Dr. Aissaoui", specialite: "Médecine générale" },
        diagnostic: "Angine bactérienne",
        medicaments: [
          { nom: "Amoxicilline", dosage: "1g", duree: "7 jours" },
          { nom: "Ibuprofène", dosage: "400mg", duree: "5 jours" }
        ],
        notes: "TDR streptocoque positif"
      },
      {
        id: UUID(), date: new Date("2024-01-30"),
        medecin: { nom: "Dr. Aissaoui", specialite: "Médecine générale" },
        diagnostic: "Gastro-entérite aiguë",
        medicaments: [{ nom: "Lopéramide", dosage: "2mg", duree: "3 jours" }],
        notes: "Réhydratation orale conseillée"
      }
    ]
  },

  // ── Patient 5 ──
  {
    cin: "196507148900",
    nom: "Ouali", prenom: "Rachid",
    dateNaissance: new Date("1965-07-14"), sexe: "M",
    telephone: "0662233445",
    adresse: { wilaya: "Annaba", commune: "El Bouni" },
    groupeSanguin: "O-",
    antecedents: ["HTA", "Insuffisance rénale chronique stade 3"],
    allergies: ["Contrast iodé"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-04-11"),
        medecin: { nom: "Dr. Bellouti", specialite: "Néphrologie" },
        diagnostic: "Suivi IRC — DFG 42 mL/min",
        tension: { systolique: 155, diastolique: 98 },
        medicaments: [
          { nom: "Furosémide", dosage: "40mg", duree: "30 jours" },
          { nom: "Carbonate de calcium", dosage: "500mg", duree: "90 jours" }
        ],
        notes: "Restriction protéique et sodée"
      },
      {
        id: UUID(), date: new Date("2023-10-20"),
        medecin: { nom: "Dr. Bellouti", specialite: "Néphrologie" },
        diagnostic: "IRC stade 3b — progression lente",
        tension: { systolique: 148, diastolique: 93 },
        medicaments: [{ nom: "Érythropoïétine", dosage: "4000UI", duree: "30 jours" }],
        notes: "Hémoglobine à 9,8 g/dL"
      },
      {
        id: UUID(), date: new Date("2024-04-05"),
        medecin: { nom: "Dr. Bellouti", specialite: "Néphrologie" },
        diagnostic: "Contrôle IRC — stable",
        tension: { systolique: 142, diastolique: 90 },
        medicaments: [{ nom: "Furosémide", dosage: "40mg", duree: "30 jours" }],
        notes: "DFG stable à 40 mL/min"
      }
    ]
  },

  // ── Patient 6 ──
  {
    cin: "199011220600",
    nom: "Tebboune", prenom: "Souad",
    dateNaissance: new Date("1990-11-22"), sexe: "F",
    telephone: "0553344556",
    adresse: { wilaya: "Sétif", commune: "El Eulma" },
    groupeSanguin: "A-",
    antecedents: ["Hypothyroïdie"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-02-08"),
        medecin: { nom: "Dr. Zerrouki", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie — TSH élevée",
        medicaments: [{ nom: "Lévothyroxine", dosage: "75µg", duree: "90 jours" }],
        notes: "TSH : 8,4 mUI/L — contrôle à 3 mois"
      },
      {
        id: UUID(), date: new Date("2023-06-15"),
        medecin: { nom: "Dr. Zerrouki", specialite: "Endocrinologie" },
        diagnostic: "Équilibre thyroïdien partiel",
        medicaments: [{ nom: "Lévothyroxine", dosage: "100µg", duree: "90 jours" }],
        notes: "TSH : 4,2 mUI/L — ajustement de dose"
      },
      {
        id: UUID(), date: new Date("2024-03-20"),
        medecin: { nom: "Dr. Zerrouki", specialite: "Endocrinologie" },
        diagnostic: "Euthyroïdie atteinte",
        medicaments: [{ nom: "Lévothyroxine", dosage: "100µg", duree: "90 jours" }],
        notes: "TSH : 1,8 mUI/L — très bon équilibre"
      }
    ]
  },

  // ── Patient 7 ──
  {
    cin: "198509167100",
    nom: "Cherif", prenom: "Kamel",
    dateNaissance: new Date("1985-09-16"), sexe: "M",
    telephone: "0770011223",
    adresse: { wilaya: "Tizi Ouzou", commune: "Azazga" },
    groupeSanguin: "B-",
    antecedents: ["Épilepsie"],
    allergies: ["Carbamazépine"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-01-25"),
        medecin: { nom: "Dr. Mammeri", specialite: "Neurologie" },
        diagnostic: "Épilepsie partielle — contrôle",
        medicaments: [{ nom: "Valproate de sodium", dosage: "500mg", duree: "90 jours" }],
        notes: "Dernière crise il y a 8 mois"
      },
      {
        id: UUID(), date: new Date("2023-08-10"),
        medecin: { nom: "Dr. Mammeri", specialite: "Neurologie" },
        diagnostic: "Bilan EEG de suivi",
        medicaments: [{ nom: "Valproate de sodium", dosage: "500mg", duree: "90 jours" }],
        notes: "EEG : activité épileptique résiduelle minime"
      },
      {
        id: UUID(), date: new Date("2024-02-28"),
        medecin: { nom: "Dr. Mammeri", specialite: "Neurologie" },
        diagnostic: "Épilepsie bien contrôlée",
        medicaments: [{ nom: "Valproate de sodium", dosage: "500mg", duree: "90 jours" }],
        notes: "Aucune crise depuis 14 mois"
      }
    ]
  },

  // ── Patient 8 ──
  {
    cin: "197302056200",
    nom: "Hadjadj", prenom: "Nadia",
    dateNaissance: new Date("1973-02-05"), sexe: "F",
    telephone: "0664455667",
    adresse: { wilaya: "Béjaïa", commune: "Amizour" },
    groupeSanguin: "AB+",
    antecedents: ["Polyarthrite rhumatoïde"],
    allergies: ["Méthotrexate"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-03-14"),
        medecin: { nom: "Dr. Hamdani", specialite: "Rhumatologie" },
        diagnostic: "Poussée de polyarthrite rhumatoïde",
        medicaments: [
          { nom: "Prednisone", dosage: "20mg", duree: "15 jours" },
          { nom: "Hydroxychloroquine", dosage: "200mg", duree: "90 jours" }
        ],
        notes: "VS : 68 mm/h, CRP : 42 mg/L"
      },
      {
        id: UUID(), date: new Date("2023-09-07"),
        medecin: { nom: "Dr. Hamdani", specialite: "Rhumatologie" },
        diagnostic: "Rémission partielle PR",
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "90 jours" }],
        notes: "CRP normalisée — continuer traitement de fond"
      },
      {
        id: UUID(), date: new Date("2024-04-18"),
        medecin: { nom: "Dr. Hamdani", specialite: "Rhumatologie" },
        diagnostic: "Suivi PR stable",
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "90 jours" }],
        notes: "Pas de poussée depuis 7 mois"
      }
    ]
  },

  // ── Patient 9 ──
  {
    cin: "199207308300",
    nom: "Belkacemi", prenom: "Youcef",
    dateNaissance: new Date("1992-07-30"), sexe: "M",
    telephone: "0552233445",
    adresse: { wilaya: "Batna", commune: "Ain Touta" },
    groupeSanguin: "O+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-06-01"),
        medecin: { nom: "Dr. Saadi", specialite: "Traumatologie" },
        diagnostic: "Fracture radius distal",
        medicaments: [
          { nom: "Paracétamol", dosage: "1g", duree: "10 jours" },
          { nom: "Ibuprofène", dosage: "400mg", duree: "7 jours" }
        ],
        notes: "Plâtre 6 semaines — rééducation après"
      },
      {
        id: UUID(), date: new Date("2023-08-20"),
        medecin: { nom: "Dr. Saadi", specialite: "Traumatologie" },
        diagnostic: "Contrôle fracture — consolidation",
        medicaments: [],
        notes: "Radio : cal osseux visible — kinésithérapie"
      }
    ]
  },

  // ── Patient 10 ──
  {
    cin: "196901127400",
    nom: "Meziane", prenom: "Fatma",
    dateNaissance: new Date("1969-01-12"), sexe: "F",
    telephone: "0665566778",
    adresse: { wilaya: "Skikda", commune: "Azzaba" },
    groupeSanguin: "A+",
    antecedents: ["Diabète type 2", "Rétinopathie diabétique"],
    allergies: ["Sulfamides"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-02-15"),
        medecin: { nom: "Dr. Zeghdoud", specialite: "Ophtalmologie" },
        diagnostic: "Rétinopathie diabétique non proliférante",
        medicaments: [{ nom: "Ranibizumab", dosage: "0.5mg", duree: "Injection mensuelle" }],
        notes: "Fond d'œil : microanévrismes bilatéraux"
      },
      {
        id: UUID(), date: new Date("2023-05-18"),
        medecin: { nom: "Dr. Mansouri", specialite: "Médecine générale" },
        diagnostic: "Déséquilibre glycémique",
        medicaments: [
          { nom: "Insuline Glargine", dosage: "20UI", duree: "30 jours" },
          { nom: "Metformine", dosage: "850mg", duree: "90 jours" }
        ],
        notes: "HbA1c : 9,2 % — passage à l'insuline"
      },
      {
        id: UUID(), date: new Date("2024-01-10"),
        medecin: { nom: "Dr. Zeghdoud", specialite: "Ophtalmologie" },
        diagnostic: "Contrôle rétinopathie — stable",
        medicaments: [],
        notes: "Pas de progression — contrôle à 6 mois"
      }
    ]
  },

  // ── Patient 11 ──
  {
    cin: "198806149600",
    nom: "Boukhari", prenom: "Samir",
    dateNaissance: new Date("1988-06-14"), sexe: "M",
    telephone: "0770123456",
    adresse: { wilaya: "Médéa", commune: "Berrouaghia" },
    groupeSanguin: "B+",
    antecedents: ["Hépatite B chronique"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-03-05"),
        medecin: { nom: "Dr. Benmabrouk", specialite: "Hépato-Gastroentérologie" },
        diagnostic: "Hépatite B chronique active",
        medicaments: [{ nom: "Ténofovir", dosage: "300mg", duree: "90 jours" }],
        notes: "Charge virale VHB : 12 000 UI/mL"
      },
      {
        id: UUID(), date: new Date("2023-09-20"),
        medecin: { nom: "Dr. Benmabrouk", specialite: "Hépato-Gastroentérologie" },
        diagnostic: "Suivi VHB — réponse virologique",
        medicaments: [{ nom: "Ténofovir", dosage: "300mg", duree: "90 jours" }],
        notes: "Charge virale : 450 UI/mL — bonne réponse"
      },
      {
        id: UUID(), date: new Date("2024-03-15"),
        medecin: { nom: "Dr. Benmabrouk", specialite: "Hépato-Gastroentérologie" },
        diagnostic: "VHB — suppression virologique",
        medicaments: [{ nom: "Ténofovir", dosage: "300mg", duree: "90 jours" }],
        notes: "Charge virale indétectable — continuer traitement"
      }
    ]
  },

  // ── Patient 12 ──
  {
    cin: "200106238700",
    nom: "Mekki", prenom: "Lina",
    dateNaissance: new Date("2001-06-23"), sexe: "F",
    telephone: "0551122334",
    adresse: { wilaya: "Tipaza", commune: "Cherchell" },
    groupeSanguin: "O+",
    antecedents: ["Anémie ferriprive"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-04-22"),
        medecin: { nom: "Dr. Chibane", specialite: "Médecine générale" },
        diagnostic: "Anémie ferriprive modérée",
        medicaments: [
          { nom: "Sulfate ferreux", dosage: "80mg", duree: "60 jours" },
          { nom: "Vitamine C", dosage: "500mg", duree: "60 jours" }
        ],
        notes: "Hb : 9,4 g/dL — ferritine effondrée"
      },
      {
        id: UUID(), date: new Date("2023-08-30"),
        medecin: { nom: "Dr. Chibane", specialite: "Médecine générale" },
        diagnostic: "Correction de l'anémie",
        medicaments: [{ nom: "Sulfate ferreux", dosage: "80mg", duree: "30 jours" }],
        notes: "Hb : 12,1 g/dL — ferritine en cours de reconstruction"
      }
    ]
  },

  // ── Patient 13 ──
  {
    cin: "197404308000",
    nom: "Guerfi", prenom: "Abdelkader",
    dateNaissance: new Date("1974-04-30"), sexe: "M",
    telephone: "0667788990",
    adresse: { wilaya: "Jijel", commune: "Taher" },
    groupeSanguin: "A-",
    antecedents: ["BPCO", "Tabagisme sevré"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-01-18"),
        medecin: { nom: "Dr. Belhadj", specialite: "Pneumologie" },
        diagnostic: "BPCO Gold II — exacerbation",
        medicaments: [
          { nom: "Tiotropium spray", dosage: "18µg", duree: "30 jours" },
          { nom: "Prednisolone", dosage: "40mg", duree: "5 jours" }
        ],
        notes: "VEMS 58 % du théorique"
      },
      {
        id: UUID(), date: new Date("2023-07-12"),
        medecin: { nom: "Dr. Belhadj", specialite: "Pneumologie" },
        diagnostic: "BPCO — état stable",
        medicaments: [{ nom: "Tiotropium spray", dosage: "18µg", duree: "30 jours" }],
        notes: "Pas d'exacerbation depuis 6 mois"
      },
      {
        id: UUID(), date: new Date("2024-01-22"),
        medecin: { nom: "Dr. Belhadj", specialite: "Pneumologie" },
        diagnostic: "BPCO stable — contrôle annuel",
        medicaments: [{ nom: "Tiotropium spray", dosage: "18µg", duree: "30 jours" }],
        notes: "VEMS stable — sevrage tabagique maintenu"
      }
    ]
  },

  // ── Patient 14 ──
  {
    cin: "199908279000",
    nom: "Boudiaf", prenom: "Imene",
    dateNaissance: new Date("1999-08-27"), sexe: "F",
    telephone: "0772233445",
    adresse: { wilaya: "M'Sila", commune: "Bou Saada" },
    groupeSanguin: "AB+",
    antecedents: [],
    allergies: ["Pollen"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-04-01"),
        medecin: { nom: "Dr. Kaci", specialite: "Allergologie" },
        diagnostic: "Rhinite allergique saisonnière",
        medicaments: [
          { nom: "Cétirizine", dosage: "10mg", duree: "30 jours" },
          { nom: "Béconase spray nasal", dosage: "50µg", duree: "30 jours" }
        ],
        notes: "Tests cutanés positifs graminées et olivier"
      },
      {
        id: UUID(), date: new Date("2024-04-08"),
        medecin: { nom: "Dr. Kaci", specialite: "Allergologie" },
        diagnostic: "Rhinite allergique — récidive saisonnière",
        medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "30 jours" }],
        notes: "Désensibilisation envisagée"
      }
    ]
  },

  // ── Patient 15 ──
  {
    cin: "196203145300",
    nom: "Amroun", prenom: "Omar",
    dateNaissance: new Date("1962-03-14"), sexe: "M",
    telephone: "0668899001",
    adresse: { wilaya: "Chlef", commune: "Ténès" },
    groupeSanguin: "O-",
    antecedents: ["Diabète type 2", "HTA", "Insuffisance coronarienne"],
    allergies: ["Clopidogrel"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-02-03"),
        medecin: { nom: "Dr. Djeddi", specialite: "Cardiologie" },
        diagnostic: "Angor stable — suivi coronarien",
        tension: { systolique: 158, diastolique: 100 },
        medicaments: [
          { nom: "Aspirine", dosage: "100mg", duree: "Indefini" },
          { nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" },
          { nom: "Nitroglycérine spray", dosage: "0.4mg", duree: "Si douleur" }
        ],
        notes: "ECG : séquelles d'IDM antérieur"
      },
      {
        id: UUID(), date: new Date("2023-08-16"),
        medecin: { nom: "Dr. Djeddi", specialite: "Cardiologie" },
        diagnostic: "Insuffisance coronarienne stable",
        tension: { systolique: 142, diastolique: 88 },
        medicaments: [
          { nom: "Aspirine", dosage: "100mg", duree: "Indefini" },
          { nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" }
        ],
        notes: "Test effort négatif"
      },
      {
        id: UUID(), date: new Date("2024-02-22"),
        medecin: { nom: "Dr. Djeddi", specialite: "Cardiologie" },
        diagnostic: "Contrôle cardio — stable",
        tension: { systolique: 136, diastolique: 84 },
        medicaments: [
          { nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" },
          { nom: "Aspirine", dosage: "100mg", duree: "Indefini" }
        ],
        notes: "Bon équilibre tensionnel et coronarien"
      }
    ]
  },

  // ── Patient 16 ──
  {
    cin: "198710189100",
    nom: "Touati", prenom: "Meriem",
    dateNaissance: new Date("1987-10-18"), sexe: "F",
    telephone: "0553456789",
    adresse: { wilaya: "Mostaganem", commune: "Sidi Ali" },
    groupeSanguin: "B+",
    antecedents: ["Dépression"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-05-20"),
        medecin: { nom: "Dr. Rouabhi", specialite: "Psychiatrie" },
        diagnostic: "Épisode dépressif majeur modéré",
        medicaments: [
          { nom: "Sertraline", dosage: "50mg", duree: "90 jours" },
          { nom: "Alprazolam", dosage: "0.25mg", duree: "30 jours" }
        ],
        notes: "Score PHQ-9 : 14/27 — suivi bimensuel"
      },
      {
        id: UUID(), date: new Date("2023-09-05"),
        medecin: { nom: "Dr. Rouabhi", specialite: "Psychiatrie" },
        diagnostic: "Amélioration clinique",
        medicaments: [{ nom: "Sertraline", dosage: "100mg", duree: "90 jours" }],
        notes: "PHQ-9 : 7 — augmentation posologique"
      },
      {
        id: UUID(), date: new Date("2024-01-17"),
        medecin: { nom: "Dr. Rouabhi", specialite: "Psychiatrie" },
        diagnostic: "Rémission dépressive",
        medicaments: [{ nom: "Sertraline", dosage: "100mg", duree: "90 jours" }],
        notes: "PHQ-9 : 3 — très bonne évolution"
      }
    ]
  },

  // ── Patient 17 ──
  {
    cin: "197608249500",
    nom: "Belabbas", prenom: "Hocine",
    dateNaissance: new Date("1976-08-24"), sexe: "M",
    telephone: "0669900112",
    adresse: { wilaya: "Relizane", commune: "Mazouna" },
    groupeSanguin: "A+",
    antecedents: ["Lithiase urinaire récidivante"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-06-11"),
        medecin: { nom: "Dr. Boumendil", specialite: "Urologie" },
        diagnostic: "Colique néphrétique droite",
        medicaments: [
          { nom: "Diclofénac", dosage: "75mg", duree: "5 jours" },
          { nom: "Phloroglucinol", dosage: "80mg", duree: "5 jours" }
        ],
        notes: "Echo : calcul 6mm pyélocaliciel droit"
      },
      {
        id: UUID(), date: new Date("2023-11-25"),
        medecin: { nom: "Dr. Boumendil", specialite: "Urologie" },
        diagnostic: "Lithiase — LEC programmée",
        medicaments: [{ nom: "Tamsulosine", dosage: "0.4mg", duree: "30 jours" }],
        notes: "Lithotritie extracorporelle effectuée"
      },
      {
        id: UUID(), date: new Date("2024-03-01"),
        medecin: { nom: "Dr. Boumendil", specialite: "Urologie" },
        diagnostic: "Contrôle post-LEC — fragmenté",
        medicaments: [],
        notes: "Echo : fragments < 2mm — élimination spontanée"
      }
    ]
  },

  // ── Patient 18 ──
  {
    cin: "199404065600",
    nom: "Sahraoui", prenom: "Zineb",
    dateNaissance: new Date("1994-04-06"), sexe: "F",
    telephone: "0773344556",
    adresse: { wilaya: "Tlemcen", commune: "Ghazaouet" },
    groupeSanguin: "O+",
    antecedents: ["Lupus érythémateux systémique"],
    allergies: ["AINS"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-02-28"),
        medecin: { nom: "Dr. Bendaoud", specialite: "Rhumatologie" },
        diagnostic: "Poussée lupique cutanée",
        medicaments: [
          { nom: "Hydroxychloroquine", dosage: "400mg", duree: "90 jours" },
          { nom: "Méthylprednisolone", dosage: "16mg", duree: "30 jours" }
        ],
        notes: "Anti-ADN : 1/320 — complément C3 bas"
      },
      {
        id: UUID(), date: new Date("2023-08-01"),
        medecin: { nom: "Dr. Bendaoud", specialite: "Rhumatologie" },
        diagnostic: "Lupus en rémission",
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "400mg", duree: "90 jours" }],
        notes: "Anti-ADN en baisse — C3 normalisé"
      },
      {
        id: UUID(), date: new Date("2024-02-12"),
        medecin: { nom: "Dr. Bendaoud", specialite: "Rhumatologie" },
        diagnostic: "Suivi LES stable",
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "400mg", duree: "90 jours" }],
        notes: "Pas de poussée depuis 6 mois"
      }
    ]
  },

  // ── Patient 19 ──
  {
    cin: "196110157200",
    nom: "Khelif", prenom: "Tahar",
    dateNaissance: new Date("1961-10-15"), sexe: "M",
    telephone: "0554567890",
    adresse: { wilaya: "Boumerdès", commune: "Dellys" },
    groupeSanguin: "AB-",
    antecedents: ["Diabète type 2", "HTA", "Dyslipidémie", "Obésité grade 2"],
    allergies: ["Glipizide"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-01-30"),
        medecin: { nom: "Dr. Amir", specialite: "Médecine interne" },
        diagnostic: "Syndrome métabolique complet",
        tension: { systolique: 162, diastolique: 104 },
        medicaments: [
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" },
          { nom: "Losartan", dosage: "50mg", duree: "90 jours" },
          { nom: "Rosuvastatine", dosage: "10mg", duree: "90 jours" }
        ],
        notes: "IMC : 36,2 kg/m² — tour de taille 112 cm"
      },
      {
        id: UUID(), date: new Date("2023-07-04"),
        medecin: { nom: "Dr. Amir", specialite: "Médecine interne" },
        diagnostic: "Suivi syndrome métabolique",
        tension: { systolique: 148, diastolique: 94 },
        medicaments: [
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" },
          { nom: "Losartan", dosage: "100mg", duree: "90 jours" }
        ],
        notes: "Augmentation Losartan — HbA1c 8,1 %"
      },
      {
        id: UUID(), date: new Date("2024-01-09"),
        medecin: { nom: "Dr. Amir", specialite: "Médecine interne" },
        diagnostic: "Amélioration progressive",
        tension: { systolique: 138, diastolique: 88 },
        medicaments: [
          { nom: "Metformine", dosage: "1000mg", duree: "90 jours" },
          { nom: "Losartan", dosage: "100mg", duree: "90 jours" },
          { nom: "Rosuvastatine", dosage: "20mg", duree: "90 jours" }
        ],
        notes: "HbA1c : 7,4 % — poids -4 kg"
      }
    ]
  },

  // ── Patient 20 ──
  {
    cin: "199312307600",
    nom: "Laib", prenom: "Sara",
    dateNaissance: new Date("1993-12-30"), sexe: "F",
    telephone: "0775566778",
    adresse: { wilaya: "Bouira", commune: "Lakhdaria" },
    groupeSanguin: "A-",
    antecedents: ["Migraine chronique"],
    allergies: ["Triptylines"],
    consultations: [
      {
        id: UUID(), date: new Date("2023-03-25"),
        medecin: { nom: "Dr. Guendouz", specialite: "Neurologie" },
        diagnostic: "Migraine avec aura — fréquente",
        medicaments: [
          { nom: "Sumatriptan", dosage: "50mg", duree: "En cas de crise" },
          { nom: "Propranolol", dosage: "40mg", duree: "90 jours" }
        ],
        notes: "8 crises/mois — traitement de fond instauré"
      },
      {
        id: UUID(), date: new Date("2023-09-14"),
        medecin: { nom: "Dr. Guendouz", specialite: "Neurologie" },
        diagnostic: "Migraine — amélioration partielle",
        medicaments: [
          { nom: "Sumatriptan", dosage: "100mg", duree: "En cas de crise" },
          { nom: "Propranolol", dosage: "80mg", duree: "90 jours" }
        ],
        notes: "4 crises/mois — augmentation prophylaxie"
      },
      {
        id: UUID(), date: new Date("2024-03-30"),
        medecin: { nom: "Dr. Guendouz", specialite: "Neurologie" },
        diagnostic: "Migraine bien contrôlée",
        medicaments: [
          { nom: "Sumatriptan", dosage: "50mg", duree: "En cas de crise" },
          { nom: "Propranolol", dosage: "80mg", duree: "90 jours" }
        ],
        notes: "1-2 crises/mois — très bonne réponse"
      }
    ]
  }
];

db.patients.insertMany(patients);


// ─── 1.3 : Collection analyses (référencée) ───────────────────────────────────
// On récupère les _id insérés pour les utiliser dans les références
const p = db.patients.find({}, { _id: 1, cin: 1 }).toArray();
const byIndex = (i) => p[i]._id;

const analyses = [

  // Patient 1 (Bensalem Ahmed) — Glycémie + HbA1c
  {
    patient_id: byIndex(0),
    type: "Glycémie",
    date: new Date("2023-03-08"),
    laboratoire: "Bio-Labo Alger Centre",
    resultats: [
      { parametre: "Glycémie à jeun", valeur: 1.42, unite: "g/L", reference: "0.70 - 1.10" }
    ],
    interprete_par: "Dr. Mansouri",
    statut: "Anormal"
  },
  {
    patient_id: byIndex(0),
    type: "Lipidogramme",
    date: new Date("2024-01-12"),
    laboratoire: "Bio-Labo Alger Centre",
    resultats: [
      { parametre: "Cholestérol total", valeur: 2.10, unite: "g/L", reference: "< 2.00" },
      { parametre: "LDL",              valeur: 1.35, unite: "g/L", reference: "< 1.30" },
      { parametre: "HDL",              valeur: 0.45, unite: "g/L", reference: "> 0.40" },
      { parametre: "Triglycérides",    valeur: 1.80, unite: "g/L", reference: "< 1.50" }
    ],
    interprete_par: "Dr. Khelifi",
    statut: "Anormal"
  },

  // Patient 2 (Bouzid Fatima) — EFR
  {
    patient_id: byIndex(1),
    type: "EFR",
    date: new Date("2023-02-18"),
    laboratoire: "CHU Oran Pneumologie",
    resultats: [
      { parametre: "VEMS",         valeur: 74, unite: "%", reference: "> 80 %" },
      { parametre: "CVF",          valeur: 85, unite: "%", reference: "> 80 %" },
      { parametre: "Ratio VEMS/CVF", valeur: 72, unite: "%", reference: "> 70 %" }
    ],
    interprete_par: "Dr. Berrahal",
    statut: "Anormal — trouble ventilatoire obstructif modéré"
  },

  // Patient 3 (Hamdi Mohamed) — NFS + Lipidogramme
  {
    patient_id: byIndex(2),
    type: "NFS",
    date: new Date("2023-01-05"),
    laboratoire: "Laboratoire Hippocrate Constantine",
    resultats: [
      { parametre: "Hémoglobine", valeur: 13.2, unite: "g/dL", reference: "13.5 - 17.5" },
      { parametre: "Leucocytes",  valeur: 7800, unite: "/mm³", reference: "4000 - 10000" },
      { parametre: "Plaquettes",  valeur: 210000, unite: "/mm³", reference: "150000 - 400000" }
    ],
    interprete_par: "Dr. Ferhat",
    statut: "Normal"
  },
  {
    patient_id: byIndex(2),
    type: "Lipidogramme",
    date: new Date("2023-01-05"),
    laboratoire: "Laboratoire Hippocrate Constantine",
    resultats: [
      { parametre: "LDL",           valeur: 1.62, unite: "g/L", reference: "< 0.70" },
      { parametre: "Triglycérides", valeur: 2.10, unite: "g/L", reference: "< 1.50" }
    ],
    interprete_par: "Dr. Ferhat",
    statut: "Anormal"
  },

  // Patient 5 (Ouali Rachid) — Créatinine
  {
    patient_id: byIndex(4),
    type: "Créatinine",
    date: new Date("2023-04-08"),
    laboratoire: "CHU Annaba Biochimie",
    resultats: [
      { parametre: "Créatinine",      valeur: 165,  unite: "µmol/L", reference: "62 - 115" },
      { parametre: "Urée",            valeur: 12.4, unite: "mmol/L", reference: "2.5 - 7.5" },
      { parametre: "DFG (CKD-EPI)",   valeur: 42,   unite: "mL/min/1.73m²", reference: "> 60" }
    ],
    interprete_par: "Dr. Bellouti",
    statut: "Anormal — IRC stade 3"
  },

  // Patient 10 (Meziane Fatma) — Glycémie + HbA1c
  {
    patient_id: byIndex(9),
    type: "Glycémie",
    date: new Date("2023-05-15"),
    laboratoire: "Labo BioSanté Skikda",
    resultats: [
      { parametre: "Glycémie à jeun", valeur: 2.15, unite: "g/L", reference: "0.70 - 1.10" },
      { parametre: "HbA1c",          valeur: 9.2,  unite: "%",   reference: "< 7.0 %" }
    ],
    interprete_par: "Dr. Mansouri",
    statut: "Anormal — diabète déséquilibré"
  },

  // Patient 11 (Boukhari Samir) — Bilan hépatique
  {
    patient_id: byIndex(10),
    type: "Bilan hépatique",
    date: new Date("2023-03-02"),
    laboratoire: "Laboratoire Médéa Biologie",
    resultats: [
      { parametre: "ASAT",            valeur: 78,    unite: "UI/L", reference: "< 40" },
      { parametre: "ALAT",            valeur: 92,    unite: "UI/L", reference: "< 41" },
      { parametre: "Bilirubine totale", valeur: 1.8, unite: "mg/dL", reference: "< 1.2" },
      { parametre: "AgHBs",           valeur: "Positif", unite: null, reference: "Négatif" }
    ],
    interprete_par: "Dr. Benmabrouk",
    statut: "Anormal — cytolyse hépatique"
  },

  // Patient 12 (Mekki Lina) — NFS
  {
    patient_id: byIndex(11),
    type: "NFS",
    date: new Date("2023-04-20"),
    laboratoire: "Cabinet Analyses Tipaza",
    resultats: [
      { parametre: "Hémoglobine", valeur: 9.4,  unite: "g/dL", reference: "12.0 - 16.0" },
      { parametre: "VGM",         valeur: 72,   unite: "fL",   reference: "80 - 100" },
      { parametre: "Ferritine",   valeur: 6,    unite: "µg/L", reference: "20 - 200" },
      { parametre: "CST",         valeur: 12,   unite: "%",    reference: "20 - 50" }
    ],
    interprete_par: "Dr. Chibane",
    statut: "Anormal — anémie ferriprive"
  },

  // Patient 13 (Guerfi Abdelkader) — EFR
  {
    patient_id: byIndex(12),
    type: "EFR",
    date: new Date("2023-01-15"),
    laboratoire: "CHU Jijel Pneumologie",
    resultats: [
      { parametre: "VEMS",            valeur: 58, unite: "%", reference: "> 80 %" },
      { parametre: "CVF",             valeur: 76, unite: "%", reference: "> 80 %" },
      { parametre: "Ratio VEMS/CVF",  valeur: 62, unite: "%", reference: "> 70 %" }
    ],
    interprete_par: "Dr. Belhadj",
    statut: "Anormal — BPCO Gold II"
  },

  // Patient 19 (Khelif Tahar) — Bilan métabolique complet
  {
    patient_id: byIndex(18),
    type: "Lipidogramme",
    date: new Date("2023-01-28"),
    laboratoire: "Labo Avicenne Boumerdès",
    resultats: [
      { parametre: "Cholestérol total", valeur: 2.45, unite: "g/L", reference: "< 2.00" },
      { parametre: "LDL",              valeur: 1.72, unite: "g/L", reference: "< 0.70" },
      { parametre: "HDL",              valeur: 0.38, unite: "g/L", reference: "> 0.40" },
      { parametre: "Triglycérides",    valeur: 2.50, unite: "g/L", reference: "< 1.50" }
    ],
    interprete_par: "Dr. Amir",
    statut: "Anormal"
  },
  {
    patient_id: byIndex(18),
    type: "Glycémie",
    date: new Date("2023-01-28"),
    laboratoire: "Labo Avicenne Boumerdès",
    resultats: [
      { parametre: "Glycémie à jeun", valeur: 1.98, unite: "g/L", reference: "0.70 - 1.10" },
      { parametre: "HbA1c",          valeur: 8.7,  unite: "%",   reference: "< 7.0 %" }
    ],
    interprete_par: "Dr. Amir",
    statut: "Anormal — diabète très déséquilibré"
  },

  // Patient 15 (Amroun Omar) — ECG
  {
    patient_id: byIndex(14),
    type: "ECG",
    date: new Date("2023-02-01"),
    laboratoire: "CHU Chlef Cardiologie",
    resultats: [
      { parametre: "Rythme",            valeur: "Sinusal",       unite: null, reference: "Sinusal" },
      { parametre: "FC",                valeur: 62,              unite: "bpm", reference: "60 - 100" },
      { parametre: "Onde Q",            valeur: "V1-V4 présente", unite: null, reference: "Absente" },
      { parametre: "Axe",               valeur: -20,             unite: "°",  reference: "-30 à +90" }
    ],
    interprete_par: "Dr. Djeddi",
    statut: "Séquelles d'IDM antérieur"
  }
];

db.analyses.insertMany(analyses);

// ─── Rapport final ────────────────────────────────────────────────────────────
print("✅ Modélisation terminée. Patients insérés:", db.patients.countDocuments());
print("✅ Analyses insérées:", db.analyses.countDocuments());