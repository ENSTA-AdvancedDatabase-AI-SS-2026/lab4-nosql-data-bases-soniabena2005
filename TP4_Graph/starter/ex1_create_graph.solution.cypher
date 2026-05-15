// TP4 - Exercice 1 : Création du graphe UniConnect DZ

// Effacer la base
MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────────────────────

CREATE CONSTRAINT etudiant_id IF NOT EXISTS
FOR (e:Etudiant)
REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT cours_code IF NOT EXISTS
FOR (c:Cours)
REQUIRE c.code IS UNIQUE;

CREATE CONSTRAINT competence_nom IF NOT EXISTS
FOR (c:Competence)
REQUIRE c.nom IS UNIQUE;


// ─── 1.2 : Créer les compétences ─────────────────────────────────────────────

UNWIND [
  {nom: "Python", categorie: "Programmation"},
  {nom: "Java", categorie: "Programmation"},
  {nom: "SQL", categorie: "Bases de Données"},
  {nom: "NoSQL", categorie: "Bases de Données"},
  {nom: "Machine Learning", categorie: "IA"},
  {nom: "Deep Learning", categorie: "IA"},
  {nom: "React", categorie: "Web"},
  {nom: "Docker", categorie: "DevOps"},
  {nom: "Linux", categorie: "Systèmes"},
  {nom: "Réseaux", categorie: "Infrastructure"}
] AS comp

MERGE (:Competence {
  nom: comp.nom,
  categorie: comp.categorie
});


// ─── 1.3 : Créer les cours ───────────────────────────────────────────────────

UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées", credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle", credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web", credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués", credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing", credits: 4, dept: "Informatique"}
] AS cours

MERGE (:Cours {
  code: cours.code,
  intitule: cours.intitule,
  credits: cours.credits,
  departement: cours.dept
});


// ─── 1.4 : Créer les étudiants ───────────────────────────────────────────────

UNWIND [

{id:"E001",prenom:"Ahmed",nom:"Bensalem",universite:"USTHB",filiere:"Informatique",annee:3,ville:"Alger"},
{id:"E002",prenom:"Fatima",nom:"Ouali",universite:"USTHB",filiere:"Informatique",annee:3,ville:"Alger"},
{id:"E003",prenom:"Yacine",nom:"Mansouri",universite:"UMBB",filiere:"GL",annee:2,ville:"Boumerdes"},
{id:"E004",prenom:"Sara",nom:"Kaci",universite:"USTO",filiere:"Telecoms",annee:4,ville:"Oran"},
{id:"E005",prenom:"Nadir",nom:"Bouzid",universite:"UMC",filiere:"Electronique",annee:1,ville:"Constantine"},
{id:"E006",prenom:"Lina",nom:"Meziane",universite:"UBMA",filiere:"Mathématiques",annee:2,ville:"Annaba"},
{id:"E007",prenom:"Walid",nom:"Hamidi",universite:"USTHB",filiere:"GL",annee:5,ville:"Alger"},
{id:"E008",prenom:"Imene",nom:"Zerrouki",universite:"USTO",filiere:"Informatique",annee:3,ville:"Oran"},
{id:"E009",prenom:"Karim",nom:"Ait Ali",universite:"UMBB",filiere:"Telecoms",annee:4,ville:"Boumerdes"},
{id:"E010",prenom:"Amira",nom:"Benali",universite:"UMC",filiere:"Electronique",annee:2,ville:"Constantine"},

{id:"E011",prenom:"Riad",nom:"Touati",universite:"USTHB",filiere:"Informatique",annee:3,ville:"Alger"},
{id:"E012",prenom:"Nesrine",nom:"Saidi",universite:"UBMA",filiere:"Mathématiques",annee:1,ville:"Annaba"},
{id:"E013",prenom:"Bilal",nom:"Rahmani",universite:"USTO",filiere:"GL",annee:5,ville:"Oran"},
{id:"E014",prenom:"Aya",nom:"Mekki",universite:"UMBB",filiere:"Informatique",annee:4,ville:"Boumerdes"},
{id:"E015",prenom:"Samir",nom:"Belaid",universite:"USTHB",filiere:"Telecoms",annee:2,ville:"Alger"},
{id:"E016",prenom:"Ines",nom:"Ferhat",universite:"UMC",filiere:"GL",annee:3,ville:"Constantine"},
{id:"E017",prenom:"Hocine",nom:"Merabet",universite:"UBMA",filiere:"Electronique",annee:1,ville:"Annaba"},
{id:"E018",prenom:"Meriem",nom:"Cherif",universite:"USTHB",filiere:"Mathématiques",annee:4,ville:"Alger"},
{id:"E019",prenom:"Adel",nom:"Gherbi",universite:"USTO",filiere:"Informatique",annee:5,ville:"Oran"},
{id:"E020",prenom:"Yasmine",nom:"Djebbar",universite:"UMBB",filiere:"GL",annee:2,ville:"Boumerdes"},

{id:"E021",prenom:"Omar",nom:"Rezig",universite:"UMC",filiere:"Telecoms",annee:3,ville:"Constantine"},
{id:"E022",prenom:"Siham",nom:"Brahimi",universite:"UBMA",filiere:"Informatique",annee:4,ville:"Annaba"},
{id:"E023",prenom:"Kamel",nom:"Aouadi",universite:"USTHB",filiere:"Electronique",annee:1,ville:"Alger"},
{id:"E024",prenom:"Nawal",nom:"Messaoudi",universite:"USTO",filiere:"Mathématiques",annee:5,ville:"Oran"},
{id:"E025",prenom:"Farid",nom:"Benkhaled",universite:"UMBB",filiere:"Informatique",annee:2,ville:"Boumerdes"},
{id:"E026",prenom:"Dina",nom:"Bouras",universite:"UMC",filiere:"GL",annee:3,ville:"Constantine"},
{id:"E027",prenom:"Rachid",nom:"Kherfi",universite:"UBMA",filiere:"Telecoms",annee:4,ville:"Annaba"},
{id:"E028",prenom:"Loubna",nom:"Taleb",universite:"USTHB",filiere:"Informatique",annee:5,ville:"Alger"},
{id:"E029",prenom:"Hakim",nom:"Abidi",universite:"USTO",filiere:"Electronique",annee:1,ville:"Oran"},
{id:"E030",prenom:"Sonia",nom:"Belkacem",universite:"UMBB",filiere:"Mathématiques",annee:2,ville:"Boumerdes"},

{id:"E031",prenom:"Anis",nom:"Bettahar",universite:"UMC",filiere:"GL",annee:3,ville:"Constantine"},
{id:"E032",prenom:"Nour",nom:"Kouider",universite:"UBMA",filiere:"Informatique",annee:4,ville:"Annaba"},
{id:"E033",prenom:"Mehdi",nom:"Sebti",universite:"USTHB",filiere:"Telecoms",annee:5,ville:"Alger"},
{id:"E034",prenom:"Kenza",nom:"Larbi",universite:"USTO",filiere:"Informatique",annee:2,ville:"Oran"},
{id:"E035",prenom:"Tarek",nom:"Mimouni",universite:"UMBB",filiere:"Electronique",annee:1,ville:"Boumerdes"},
{id:"E036",prenom:"Rym",nom:"Haddad",universite:"UMC",filiere:"Mathématiques",annee:3,ville:"Constantine"},
{id:"E037",prenom:"Salim",nom:"Chaib",universite:"UBMA",filiere:"GL",annee:4,ville:"Annaba"},
{id:"E038",prenom:"Mouna",nom:"Boudiaf",universite:"USTHB",filiere:"Informatique",annee:5,ville:"Alger"},
{id:"E039",prenom:"Lotfi",nom:"Zaidi",universite:"USTO",filiere:"Telecoms",annee:2,ville:"Oran"},
{id:"E040",prenom:"Assia",nom:"Benmoussa",universite:"UMBB",filiere:"Informatique",annee:1,ville:"Boumerdes"},

{id:"E041",prenom:"Nabil",nom:"Guessoum",universite:"UMC",filiere:"Electronique",annee:3,ville:"Constantine"},
{id:"E042",prenom:"Lydia",nom:"Bensaid",universite:"UBMA",filiere:"Mathématiques",annee:4,ville:"Annaba"},
{id:"E043",prenom:"Younes",nom:"Kerroum",universite:"USTHB",filiere:"GL",annee:5,ville:"Alger"},
{id:"E044",prenom:"Amina",nom:"Dahmani",universite:"USTO",filiere:"Informatique",annee:2,ville:"Oran"},
{id:"E045",prenom:"Islam",nom:"Mokrani",universite:"UMBB",filiere:"Telecoms",annee:1,ville:"Boumerdes"},
{id:"E046",prenom:"Nihal",nom:"Gacem",universite:"UMC",filiere:"Electronique",annee:3,ville:"Constantine"},
{id:"E047",prenom:"Mourad",nom:"Boulahia",universite:"UBMA",filiere:"Informatique",annee:4,ville:"Annaba"},
{id:"E048",prenom:"Farah",nom:"Tebbal",universite:"USTHB",filiere:"Mathématiques",annee:5,ville:"Alger"},
{id:"E049",prenom:"Sofiane",nom:"Madani",universite:"USTO",filiere:"GL",annee:2,ville:"Oran"},
{id:"E050",prenom:"Ikram",nom:"Hamlaoui",universite:"UMBB",filiere:"Informatique",annee:1,ville:"Boumerdes"}

] AS data

MERGE (e:Etudiant {id: data.id})
SET e += data;


// ─── 1.5 : Relations CONNAIT ────────────────────────────────────────────────
// Graphe connexe : chaque étudiant connaît au moins le suivant

MATCH (e1:Etudiant), (e2:Etudiant)
WHERE toInteger(substring(e2.id,1)) = toInteger(substring(e1.id,1)) + 1
MERGE (e1)-[:CONNAIT]->(e2);


// ─── Relations SUIT ─────────────────────────────────────────────────────────

MATCH (e:Etudiant), (c:Cours)
WHERE rand() < 0.4
MERGE (e)-[:SUIT {
  note: round(10 + rand() * 10, 1),
  semestre: "S" + toString(toInteger(rand()*2)+1)
}]->(c);


// ─── Relations MAITRISE ────────────────────────────────────────────────────

MATCH (e:Etudiant), (c:Competence)
WHERE rand() < 0.3
MERGE (e)-[:MAITRISE {
  niveau: toInteger(rand()*5) + 1
}]->(c);


// ─── Vérification ──────────────────────────────────────────────────────────

MATCH (n)
RETURN labels(n)[0] AS type, count(n) AS total
ORDER BY total DESC;

MATCH ()-[r]->()
RETURN type(r) AS relation, count(r) AS total
ORDER BY total DESC;