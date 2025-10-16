```gherkin
Feature: Classement des saisies dans le Delimiter Checker

  Background:
    Given le composant est configuré avec les délimiteurs "," et ";"
    And les validateurs disponibles sont "email", "ipAddress", "personName"

  Rule: Segmenter la saisie selon les délimiteurs fournis
    Scenario Outline: Découper la saisie au fil de la frappe
      Given l’utilisateur saisit "<input>"
      Then les valeurs capturées sont "<tokens>"

      Examples:
        | input                                 | tokens                                 |
        | alice@example.com,192.168.0.1         | alice@example.com | 192.168.0.1         |
        | jean.dupont@example.com;Claire Martin | jean.dupont@example.com | Claire Martin |

  Rule: Catégoriser chaque fragment via les validateurs
    Scenario Outline: Déterminer la catégorie d’un token
      Given le composant reçoit le token "<token>"
      Then le token est classé comme "<category>"

      Examples:
        | token             | category   |
        | alice@example.com | email      |
        | 10.0.0.42         | ipAddress  |
        | Marie Curie       | personName |

    Scenario: Marquer un token non reconnu comme invalide
      Given le composant reçoit le token "foo@bar"
      Then le token est classé comme "invalid"
      And il n’appartient à aucune autre catégorie

  Rule: Afficher les tokens invalides avant les valides
    Scenario: Ordre d’affichage des catégories
      Given les tokens capturés sont "foo", "alice@example.com", "192.168.0.1"
      And "foo" est invalide
      When la liste est rendue
      Then "foo" s’affiche avant "alice@example.com"
      And "alice@example.com" s’affiche avant "192.168.0.1"

  Rule: Cliquer un token pour le rééditer
    Scenario: Réinjection d’un token valide
      Given la liste contient les tokens valides "alice@example.com", "192.168.0.1"
      When l’utilisateur clique "alice@example.com"
      Then "alice@example.com" est retiré de la liste
      And l’input contient "alice@example.com"

    Scenario: Réinjection d’un token invalide
      Given la liste invalide contient "foo"
      When l’utilisateur clique "foo"
      Then "foo" est retiré de la section invalide
      And l’input contient "foo"
      And les autres tokens restent inchangés
```
