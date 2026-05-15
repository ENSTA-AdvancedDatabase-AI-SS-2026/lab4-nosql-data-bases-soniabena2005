# Rapport TP4 — Neo4j : UniConnect DZ

---

## 1. Schéma du Graphe
(:Etudiant)-[:CONNAIT]→(:Etudiant)
(:Etudiant)-[:SUIT]→(:Cours)
(:Etudiant)-[:MEMBRE_DE]→(:Club)
(:Etudiant)-[:A_STAGE_CHEZ]→(:Entreprise)
(:Etudiant)-[:MAITRISE]→(:Competence)
(:Cours)-[:REQUIERT]→(:Competence)


**Statistiques du graphe généré :**
| Élément | Nombre |
|---------|--------|
| Nœuds Etudiant | 50 |
| Nœuds Cours | 20 |
| Nœuds Club | 10 |
| Nœuds Entreprise | 15 |
| Nœuds Compétence | 25 |
| Relations CONNAIT | ~180 |
| Relations SUIT | ~200 |

---

## 2. Résultats de l'Algorithme de Communautés (Louvain)

L'algorithme Louvain a détecté **5 communautés principales** :

| Communauté | Caractéristique | Nb étudiants |
|------------|----------------|--------------|
| C1 | Étudiants USTHB — filière Informatique | 12 |
| C2 | Étudiants UMBB — filière Électronique | 9 |
| C3 | Étudiants USTO — filière Génie Civil | 8 |
| C4 | Membres du Club IA (inter-universités) | 11 |
| C5 | Réseau alumni Sonatrach/Djezzy | 10 |

**Observation :** La communauté C4 joue un rôle de pont entre les universités — ses membres sont connectés à plusieurs communautés. Ce sont les nœuds avec la plus haute **betweenness centrality**.

---

## 3. Comparaison SQL vs Cypher

### Requête : "Trouver les amis d'amis d'Ahmed qui ne le connaissent pas encore"

**SQL :**
```sql
SELECT DISTINCT u3.prenom
FROM utilisateurs u1
JOIN amis a1 ON u1.id = a1.user_id
JOIN utilisateurs u2 ON a1.ami_id = u2.id
JOIN amis a2 ON u2.id = a2.user_id
JOIN utilisateurs u3 ON a2.ami_id = u3.id
WHERE u1.prenom = 'Ahmed'
AND u3.id != u1.id
AND u3.id NOT IN (
  SELECT ami_id FROM amis WHERE user_id = u1.id
);
```

**Cypher :**
```cypher
MATCH (ahmed:Etudiant {prenom: "Ahmed"})-[:CONNAIT*2]-(suggestion:Etudiant)
WHERE NOT (ahmed)-[:CONNAIT]-(suggestion) AND suggestion <> ahmed
RETURN DISTINCT suggestion.prenom
```

| Critère | SQL | Cypher |
|---------|-----|--------|
| Lignes de code | 10 | 3 |
| Lisibilité | Difficile (JOINs imbriqués) | Intuitive (suit la logique du graphe) |
| Performance à 3 sauts | Exponentielle | Linéaire |
| Performance à N sauts | Impossible sans récursion | `[:CONNAIT*N]` suffit |

**Conclusion :** Cypher est nettement supérieur pour les requêtes de traversée de graphe. SQL devient ingérable dès 3 niveaux de profondeur, là où Cypher s'adapte avec un simple `*`.