/* ==========================================================================
   CARNET DU WEB : JavaScript unique
   Ce fichier construit le jeu de chaque page de sujet.

   Sommaire
   1. Outils
   2. Données des jeux (à modifier pour changer les questions)
   3. Moteur « quiz » (questions à choix)
   4. Moteur « dates » (glisser les dates sur les événements)
   5. Démarrage

   Comment ça marche : la page HTML contient un bloc <section class="jeu">.
   Ce script lit <body data-page="..."> pour savoir quel jeu fabriquer,
   puis le construit dans ce bloc. Sur les pages sans jeu, il ne fait rien.
   ========================================================================== */
"use strict";


/* 1. OUTILS ---------------------------------------------------------------- */

/* Crée un élément HTML.
   creer("p", { classe: "intro", texte: "Bonjour" }) donne <p class="intro">Bonjour</p> */
function creer(balise, proprietes = {}, enfants = []) {
  const element = document.createElement(balise);
  for (const [nom, valeur] of Object.entries(proprietes)) {
    if (nom === "texte") {
      element.textContent = valeur;
    } else if (nom === "classe") {
      element.className = valeur;
    } else {
      element.setAttribute(nom, valeur);
    }
  }
  for (const enfant of enfants) {
    element.append(enfant);
  }
  return element;
}

/* Renvoie une copie mélangée d'une liste (algorithme de Fisher-Yates) */
function melanger(liste) {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/* Fabrique des questions « que représente cette partie ? » à partir d'une
   adresse découpée. parties = [["https://", "Le protocole"], ...] */
function questionsDecoupage(parties, noms, explications, objet) {
  return parties.map(([texte, nom], k) => ({
    texte: `Dans ${objet}, que représente « ${texte} » ?`,
    code: parties.map(([morceau], j) => ({ texte: morceau, surligne: j === k })),
    options: noms,
    bonne: noms.indexOf(nom),
    explication: explications[nom],
  }));
}


/* 2. DONNÉES DES JEUX -------------------------------------------------------
   Pour modifier un jeu, change les textes ci-dessous. Attention : si tu
   changes le contenu d'une page, pense à changer aussi son jeu ici.        */

/* --- Jeu de la page URL --- */
const NOMS_URL = ["Le protocole", "Le nom de domaine", "Le chemin", "Les paramètres", "L'ancre"];

const EXPLICATIONS_URL = {
  "Le protocole": "Le protocole indique comment le navigateur et le site se parlent.",
  "Le nom de domaine": "Le nom de domaine est le nom du site.",
  "Le chemin": "Le chemin indique l'endroit précis du site où se trouve la page.",
  "Les paramètres": "Les paramètres envoient des informations supplémentaires au site.",
  "L'ancre": "L'ancre amène directement à un endroit de la page.",
};

const ADRESSES = [
  [["https://", "Le protocole"], ["www.example.com", "Le nom de domaine"], ["/blog/article", "Le chemin"], ["?page=2", "Les paramètres"], ["#commentaires", "L'ancre"]],
  [["https://", "Le protocole"], ["monsite.example", "Le nom de domaine"], ["/photos/vacances", "Le chemin"], ["?annee=2025", "Les paramètres"], ["#haut", "L'ancre"]],
  [["https://", "Le protocole"], ["boutique.monsite.example", "Le nom de domaine"], ["/velos/electriques/modele-x", "Le chemin"], ["?couleur=bleu&taille=m", "Les paramètres"]],
  [["http://", "Le protocole"], ["www.example.org", "Le nom de domaine"], ["/cours/web/introduction.html", "Le chemin"], ["#exercices", "L'ancre"]],
  [["https://", "Le protocole"], ["recherche.example.net", "Le nom de domaine"], ["/resultats", "Le chemin"], ["?q=carnet+du+web&page=3", "Les paramètres"], ["#avis", "L'ancre"]],
  [["https://", "Le protocole"], ["example.com", "Le nom de domaine"]],
  [["https://", "Le protocole"], ["blog.example.org", "Le nom de domaine"], ["/2026/10/mon-article", "Le chemin"], ["?utm_source=newsletter", "Les paramètres"], ["#conclusion", "L'ancre"]],
];

/* --- Quiz de la page Domaines ---
   Chaque question : [question, [réponses], numéro de la bonne réponse, explication].
   Le numéro de la bonne réponse compte à partir de 0 : 0 = la 1re réponse (A),
   1 = la 2e (B), 2 = la 3e (C), 3 = la 4e (D).
   Pour ajouter une question, copie un bloc entre crochets et change les textes. */
const QUESTIONS_DOMAINES = [
  [
    "Quelle extension est associée à la Belgique ?",
    [".fr", ".be", ".nl", ".de"],
    1,
    "L'extension .be est associée à la Belgique. On la retrouve notamment sur de nombreux sites belges.",
  ],
  [
    "À quoi sert principalement un nom de domaine ?",
    [
      "À créer automatiquement un site web",
      "À protéger un ordinateur contre les virus",
      "À donner une adresse facile à retenir pour accéder à un site",
      "À augmenter la vitesse d'Internet",
    ],
    2,
    "Un nom de domaine permet aux visiteurs d'accéder plus facilement à un site sans devoir mémoriser son adresse IP.",
  ],
  [
    "Quelle extension est souvent utilisée par les organisations et les associations ?",
    [".org", ".be", ".fr", ".de"],
    0,
    "L'extension .org vient du mot anglais « organization ». Elle est souvent utilisée par des organisations et des associations, mais elle n'est pas réservée à celles-ci.",
  ],
  [
    "Dans monsite.be, quelle partie correspond à l'extension ?",
    ["mon", "site", "monsite", ".be"],
    3,
    "Dans cet exemple, « monsite » est le nom choisi et « .be » est l'extension. Ensemble, ils forment le nom de domaine monsite.be.",
  ],
  [
    "Quelle extension est associée aux Pays-Bas ?",
    [".lu", ".nl", ".ch", ".at"],
    1,
    "L'extension .nl est associée aux Pays-Bas. Elle est utilisée par de nombreux sites liés à ce pays.",
  ],
  [
    "Est-il obligatoire d'utiliser .com pour créer un site web ?",
    [
      "Oui, pour tous les sites",
      "Oui, sauf pour les associations",
      "Non, il existe de nombreuses autres extensions",
      "Non, car .com n'est plus utilisé",
    ],
    2,
    "Il existe de nombreuses extensions, comme .be, .fr, .org et .net. Le choix dépend du projet et de la disponibilité du nom de domaine.",
  ],
  [
    "Où se trouve forcément le serveur d'un site dont le domaine se termine par .be ?",
    [
      "En Belgique",
      "À Bruxelles",
      "Dans le pays où se trouve le propriétaire",
      "Il peut se trouver dans n'importe quel pays",
    ],
    3,
    "L'extension .be est associée à la Belgique, mais elle n'indique pas l'emplacement physique du serveur qui héberge le site.",
  ],
  [
    "Que signifie généralement l'extension .com ?",
    ["Commercial", "Communication", "Communauté", "Compétition"],
    0,
    "L'extension .com vient du mot anglais « commercial ». Aujourd'hui, elle est utilisée pour de nombreux types de sites, pas uniquement les sites commerciaux.",
  ],
  [
    "Une entreprise belge doit-elle obligatoirement choisir l'extension .be ?",
    [
      "Oui, c'est une obligation légale pour toutes les entreprises",
      "Non, elle peut choisir une autre extension adaptée à son projet",
      "Oui, sinon son site ne fonctionnera pas",
      "Non, car .be est réservé aux particuliers",
    ],
    1,
    "Une entreprise belge peut notamment choisir .be ou .com, selon ses besoins et la disponibilité du nom de domaine.",
  ],
  [
    "Quelle est la différence entre un nom de domaine et un hébergement web ?",
    [
      "Il n'y a aucune différence",
      "Le nom de domaine stocke les fichiers du site",
      "Le nom de domaine est l'adresse du site, tandis que l'hébergement permet de stocker et de servir ses fichiers",
      "L'hébergement sert uniquement à acheter une extension",
    ],
    2,
    "Le nom de domaine est l'adresse utilisée pour accéder au site. L'hébergement fournit l'environnement dans lequel les fichiers du site sont stockés et rendus accessibles.",
  ],
  [
    "Que peut-il arriver si tu ne renouvelles pas ton nom de domaine à temps ?",
    [
      "Il devient automatiquement gratuit",
      "Il se transforme en .com",
      "Rien ne peut arriver",
      "Tu risques de perdre le droit de l'utiliser",
    ],
    3,
    "Un nom de domaine est généralement enregistré pour une période déterminée. Sans renouvellement, tu risques de le perdre et il pourrait éventuellement être enregistré par quelqu'un d'autre.",
  ],
  [
    "Deux personnes peuvent-elles posséder simultanément exactement le même nom de domaine monsite.be ?",
    [
      "Oui, si elles créent des sites différents",
      "Non, le même nom de domaine ne peut pas être attribué simultanément à plusieurs titulaires",
      "Oui, si elles habitent dans des pays différents",
      "Oui, si les sites utilisent des hébergements différents",
    ],
    1,
    "Un nom de domaine complet doit être unique dans la zone concernée. En revanche, monsite.be et monsite.com sont deux noms de domaine distincts.",
  ],
  [
    "Quelle extension est historiquement associée aux réseaux informatiques ?",
    [".net", ".fr", ".be", ".it"],
    0,
    "L'extension .net vient du mot anglais « network », qui signifie « réseau ». Son utilisation est aujourd'hui beaucoup plus large que sa destination initiale.",
  ],
  [
    "Un site qui utilise https:// est-il forcément fiable ?",
    [
      "Oui, HTTPS garantit que le site est honnête",
      "Oui, tous les sites en HTTPS sont officiels",
      "Non, HTTPS sécurise la connexion, mais ne garantit pas que le site est digne de confiance",
      "Non, HTTPS signifie que le site est dangereux",
    ],
    2,
    "HTTPS chiffre les échanges entre le navigateur et le site. Cependant, un site frauduleux peut également utiliser HTTPS.",
  ],
  [
    "Quelle affirmation concernant les extensions de noms de domaine est correcte ?",
    [
      "Tous les sites doivent utiliser une extension associée à un pays",
      "Les extensions ne servent qu'à décorer les adresses",
      "Chaque extension indique précisément le type de serveur utilisé",
      "Il existe des extensions associées à des pays et d'autres qui sont génériques",
    ],
    3,
    ".be et .fr sont associées à des pays, tandis que .com, .org et .net sont des extensions génériques.",
  ],
];

/* --- Jeu de la page Sécurité : « Prudent ou Suspect ? ---
   Chaque ligne : [situation, bonne réponse ("Prudent" ou "Suspect"), explication].
   Pour ajouter une question, copie une ligne et change les trois textes.      */
const SITUATIONS_SECURITE = [
  [
    "Tu reçois un e-mail qui t'annonce que tu as gagné un smartphone. Pour le recevoir, tu dois cliquer sur un lien et entrer ton mot de passe.",
    "Suspect",
    "Les cadeaux inattendus peuvent servir d'appât pour voler tes informations. Ne communique jamais ton mot de passe via un lien reçu dans un message.",
  ],
  [
    "Tu reçois un SMS qui prétend venir de ta banque et t'annonce que ton compte sera bloqué si tu ne cliques pas immédiatement sur un lien.",
    "Suspect",
    "Les escrocs utilisent souvent l'urgence pour pousser leurs victimes à agir sans réfléchir. Contacte ta banque via son application officielle ou son numéro habituel.",
  ],
  [
    "Un ami t'envoie un lien étrange. Son adresse e-mail semble correcte, donc tu considères que le lien est forcément sûr.",
    "Suspect",
    "Un compte peut être piraté et utilisé pour envoyer des liens dangereux. Vérifie le message auprès de ton ami par un autre moyen avant de cliquer.",
  ],
  [
    "Un inconnu te propose des objets gratuits dans ton jeu vidéo préféré en échange de ton identifiant et de ton mot de passe.",
    "Suspect",
    "Il peut s'agir d'une tentative de vol de compte. Ne partage jamais tes identifiants, même pour obtenir des récompenses virtuelles.",
  ],
  [
    "Tu utilises un mot de passe différent pour chacun de tes comptes importants.",
    "Prudent",
    "Si un mot de passe est volé, les autres comptes restent mieux protégés. Un gestionnaire de mots de passe peut t'aider à tous les retenir.",
  ],
  [
    "Tu utilises un mot de passe très compliqué pour tous tes comptes. Comme il est difficile à deviner, tu estimes que c'est une bonne pratique.",
    "Suspect",
    "Même un mot de passe très fort devient dangereux s'il est réutilisé partout. Utilise un mot de passe unique pour chaque compte.",
  ],
  [
    "Tu actives la double authentification sur ton compte de messagerie.",
    "Prudent",
    "La double authentification ajoute une protection supplémentaire. Même si quelqu'un découvre ton mot de passe, il lui sera généralement plus difficile d'accéder à ton compte.",
  ],
  [
    "Tu reçois un code de connexion par SMS alors que tu n'essaies pas de te connecter. Tu le communiques à une personne qui prétend travailler pour le service concerné.",
    "Suspect",
    "Quelqu'un essaie peut-être de se connecter à ton compte. Ne communique jamais un code de vérification à une autre personne, même si elle prétend travailler pour le service.",
  ],
  [
    "Un site affiche un cadenas à côté de son adresse. Tu peux donc lui faire confiance sans vérifier le reste.",
    "Suspect",
    "Le cadenas indique principalement que la connexion est chiffrée. Un site frauduleux peut aussi en posséder un. Vérifie l'adresse et la fiabilité du site.",
  ],
  [
    "Avant de saisir tes identifiants, tu vérifies l'adresse du site pour t'assurer que tu es sur le bon domaine.",
    "Prudent",
    "Certains faux sites imitent parfaitement les sites officiels. Vérifier le nom de domaine aide à repérer les adresses trompeuses.",
  ],
  [
    "Dans un café, tu te connectes au premier réseau Wi-Fi gratuit trouvé sans vérifier son nom.",
    "Suspect",
    "Un réseau inconnu peut être contrôlé par une personne malveillante ou imiter le réseau du café. Vérifie son nom auprès du personnel avant de te connecter.",
  ],
  [
    "Tu utilises le Wi-Fi public d'un café pour consulter un site bancaire officiel en HTTPS. Cette situation est automatiquement dangereuse.",
    "Suspect",
    "Le Wi-Fi public n'est pas automatiquement dangereux, et HTTPS protège les données échangées avec le site. Il reste toutefois préférable de vérifier le réseau et d'utiliser le site ou l'application officielle de ta banque.",
  ],
  [
    "Tu télécharges un logiciel depuis le site officiel de son éditeur plutôt que depuis une plateforme inconnue.",
    "Prudent",
    "Le site officiel réduit le risque de télécharger un programme modifié ou malveillant. Vérifie tout de même l'adresse du site avant de télécharger.",
  ],
  [
    "Une publicité promet de rendre ton ordinateur dix fois plus rapide si tu installes gratuitement un programme inconnu. Tu le télécharges immédiatement.",
    "Suspect",
    "Les promesses exagérées peuvent cacher des logiciels indésirables ou malveillants. Recherche des informations fiables sur le programme avant de l'installer.",
  ],
  [
    "Tu télécharges une application depuis une boutique officielle. Tu peux donc accepter toutes les autorisations qu'elle demande sans les vérifier.",
    "Suspect",
    "Même une application provenant d'une boutique officielle peut demander des autorisations excessives. Vérifie si elles sont nécessaires à son fonctionnement.",
  ],
  [
    "Ton navigateur te propose une mise à jour depuis ses paramètres officiels. Tu l'installes pour bénéficier des dernières corrections de sécurité.",
    "Prudent",
    "Les mises à jour corrigent souvent des failles de sécurité et améliorent la protection du navigateur. Installe-les depuis les paramètres officiels ou le site officiel de l'éditeur.",
  ],
  [
    "Tu publies publiquement ton adresse, ton numéro de téléphone et les dates de tes prochaines vacances sur les réseaux sociaux.",
    "Suspect",
    "Ces informations peuvent être utilisées pour t'identifier, te contacter ou repérer tes absences. Évite de publier des données personnelles et des informations précises sur tes déplacements.",
  ],
  [
    "Ton profil sur les réseaux sociaux est privé. Tu peux donc publier toutes les informations personnelles que tu veux sans risque.",
    "Suspect",
    "Un profil privé limite la visibilité, mais ne garantit pas une confidentialité totale. Une personne peut toujours copier, enregistrer ou partager tes publications.",
  ],
  [
    "Tu verrouilles ton ordinateur lorsque tu quittes ton bureau, même pour quelques minutes.",
    "Prudent",
    "Le verrouillage empêche une personne de consulter facilement tes fichiers ou d'utiliser tes comptes pendant ton absence.",
  ],
  [
    "Tu sauvegardes régulièrement tes fichiers importants sur un support séparé ou un service de sauvegarde sécurisé.",
    "Prudent",
    "Les sauvegardes permettent de récupérer tes fichiers en cas de panne, de vol ou d'attaque informatique. Garde-les sécurisées et vérifie de temps en temps que tu peux restaurer tes données.",
  ],
];

/* --- Quiz de la page Standards : « HTML, CSS ou JavaScript ? ---
   Chaque ligne : [ce qu'on veut faire, bon langage ("HTML", "CSS" ou "JavaScript"), explication].
   Pour ajouter une question, copie une ligne et change les trois textes.      */
const QUESTIONS_STANDARDS = [
  ["Ajouter un titre et un paragraphe à la page", "HTML", "Le HTML décrit le contenu et la structure de la page."],
  ["Mettre le titre en vert", "CSS", "Le CSS s'occupe des couleurs et de l'apparence."],
  ["Afficher un message quand on clique sur un bouton", "JavaScript", "JavaScript fait réagir la page aux actions de la personne."],
  ["Choisir la police du texte", "CSS", "Les polices se choisissent avec le CSS."],
  ["Insérer une image dans la page", "HTML", "Une image s'ajoute avec le HTML."],
  ["Mettre à jour un compteur sans recharger la page", "JavaScript", "C'est un comportement : il relève de JavaScript."],
  ["Créer un lien vers une autre page", "HTML", "Un lien se crée avec la balise <a> : c'est du contenu, donc du HTML."],
  ["Ajouter une marge autour d'un paragraphe", "CSS", "Les marges et les espacements relèvent de l'apparence : c'est le rôle du CSS."],
  ["Mélanger des questions au hasard à chaque partie d'un quiz", "JavaScript", "Tirer au hasard et décider quoi afficher est un comportement, donc du JavaScript."],
  ["Créer une liste à puces", "HTML", "Les listes se décrivent en HTML, avec les balises <ul> et <li>."],
  ["Placer des éléments côte à côte sur la page", "CSS", "La mise en page, par exemple avec Flexbox ou Grid, se règle en CSS."],
  ["Calculer un score et l'afficher à la fin d'un jeu", "JavaScript", "Calculer et afficher un résultat se fait avec JavaScript."],
  ["Ajouter un formulaire avec un champ pour écrire son nom", "HTML", "Un formulaire et ses champs sont décrits en HTML, avec les balises <form> et <input>."],
  ["Adapter la mise en page à la taille d'un écran de téléphone", "CSS", "Le CSS peut changer la mise en page selon la taille de l'écran, grâce aux media queries."],
  ["Réagir quand la personne appuie sur une touche du clavier", "JavaScript", "Détecter une touche du clavier, c'est réagir à une action : c'est le rôle de JavaScript."],
];

/* --- Tous les jeux, rangés par page (valeur de data-page) --- */
const JEUX = {

  timeline: {
    type: "dates",
    consigne: "Glisse chaque date vers l'événement qui lui correspond. Au clavier : Entrée sur une date, puis Entrée sur un événement.",
    /* Rien d'autre à écrire : les événements et les dates sont lus dans la frise de la page. */
  },

  url: {
    type: "quiz",
    nombre: 8,
    questions: ADRESSES.flatMap((parties) =>
      questionsDecoupage(parties, NOMS_URL, EXPLICATIONS_URL, "cette adresse")
    ),
  },

  domaines: {
    type: "quiz",
    /* Nombre de questions posées à chaque partie, tirées au hasard parmi toutes
       celles de la liste QUESTIONS_DOMAINES. Supprime cette ligne pour les poser toutes. */
    nombre: 5,
    questions: QUESTIONS_DOMAINES.map(([texte, options, bonne, explication]) => ({
      texte,
      options,
      bonne,
      explication,
    })),
  },

  standards: {
    type: "quiz",
    /* Nombre de questions posées à chaque partie, tirées au hasard parmi toutes
       celles de la liste QUESTIONS_STANDARDS. Supprime cette ligne pour les poser toutes. */
    nombre: 5,
    questions: QUESTIONS_STANDARDS.map(([texte, langage, explication]) => {
      const options = ["HTML", "CSS", "JavaScript"];
      return {
        texte: `Quel langage s'en charge : « ${texte} » ?`,
        options,
        bonne: options.indexOf(langage),
        explication,
      };
    }),
  },

  securite: {
    type: "quiz",
    /* Nombre de questions posées à chaque partie, tirées au hasard parmi toutes
       celles de la liste SITUATIONS_SECURITE. Supprime cette ligne pour les poser toutes. */
    nombre: 5,
    questions: SITUATIONS_SECURITE.map(([texte, reponse, explication]) => ({
      texte,
      options: ["Prudent", "Suspect"],
      bonne: reponse === "Prudent" ? 0 : 1,
      explication,
    })),
  },
};


/* 3. MOTEUR « QUIZ » ---------------------------------------------------------
   Pose une question à la fois, corrige tout de suite, puis affiche le score. */
function lancerQuiz(zone, jeu) {
  const conteneur = creer("div", { classe: "jeu__zone" });
  zone.append(conteneur);

  let questions = [];
  let numero = 0;
  let score = 0;

  function demarrer(deplacerFocus) {
    const total = jeu.nombre || jeu.questions.length;
    questions = melanger(jeu.questions).slice(0, total);
    numero = 0;
    score = 0;
    afficherQuestion(deplacerFocus);
  }

  function afficherQuestion(deplacerFocus) {
    const question = questions[numero];
    const estDerniere = numero === questions.length - 1;
    conteneur.replaceChildren();

    conteneur.append(
      creer("p", { classe: "jeu__progression", texte: `Question ${numero + 1} sur ${questions.length}` })
    );

    const enonce = creer("p", { classe: "jeu__question", texte: question.texte, tabindex: "-1" });
    conteneur.append(enonce);

    /* Adresse affichée avec la partie en surbrillance (aide visuelle) */
    if (question.code) {
      const code = creer("p", { classe: "jeu__code" });
      for (const morceau of question.code) {
        code.append(
          morceau.surligne ? creer("span", { classe: "partie", texte: morceau.texte }) : morceau.texte
        );
      }
      conteneur.append(code);
    }

    const groupe = creer("div", { classe: "jeu__options", role: "group", "aria-label": "Réponses possibles" });
    const retour = creer("div", { classe: "jeu__retour", role: "status" });
    const boutons = question.options.map((option, choix) => {
      const bouton = creer("button", { classe: "bouton", type: "button", texte: option });
      bouton.addEventListener("click", () => repondre(choix));
      return bouton;
    });
    groupe.append(...boutons);
    conteneur.append(groupe, retour);

    function repondre(choix) {
      const juste = choix === question.bonne;
      if (juste) {
        score++;
      }

      boutons.forEach((bouton, k) => {
        bouton.disabled = true;
        if (k === question.bonne) {
          bouton.classList.add("reponse--juste");
        } else if (k === choix) {
          bouton.classList.add("reponse--fausse");
        }
      });

      const verdict = juste
        ? "Bonne réponse !"
        : `Pas tout à fait. La bonne réponse : ${question.options[question.bonne]}.`;
      retour.append(creer("p", {}, [creer("strong", { texte: verdict }), ` ${question.explication}`]));

      const suivant = creer("button", {
        classe: "bouton bouton--principal",
        type: "button",
        texte: estDerniere ? "Voir mon résultat" : "Question suivante",
      });
      suivant.addEventListener("click", () => {
        if (estDerniere) {
          afficherResultat();
        } else {
          numero++;
          afficherQuestion(true);
        }
      });
      conteneur.append(suivant);
      suivant.focus();
    }

    if (deplacerFocus) {
      enonce.focus();
    }
  }

  function afficherResultat() {
    const total = questions.length;
    let message = "Pas de panique : relis la page, puis retente ta chance.";
    if (score === total) {
      message = "Parfait, tu as tout juste !";
    } else if (score >= total / 2) {
      message = "Bien joué ! Relis la page pour tout retenir.";
    }

    const titre = creer("p", { classe: "jeu__score", texte: `${score} sur ${total}`, tabindex: "-1" });
    const rejouer = creer("button", { classe: "bouton bouton--principal", type: "button", texte: "Rejouer" });
    rejouer.addEventListener("click", () => demarrer(true));

    conteneur.replaceChildren(titre, creer("p", { texte: message }), rejouer);
    titre.focus();
  }

  demarrer(false);
}


/* 4. MOTEUR « DATES » ----------------------------------------------------------
   Glisser-déposer : on prend une date et on la dépose sur l'événement qui lui
   correspond.

   Les événements et les dates sont LUS DANS LA PAGE : chaque
   <li class="frise__etape"> qui contient un .frise__date et un <h3> devient
   une ligne du jeu. Pour ajouter une date au jeu, il suffit donc d'ajouter une
   étape à la frise de la page : rien à changer dans ce fichier.

   Trois façons de jouer :
   - à la souris ou au doigt : glisser-déposer ;
   - au clavier : Entrée sur une date pour la sélectionner, puis Entrée sur
     la case de l'événement ;
   - un clic sur une case remplie renvoie la date dans la liste.              */

/* Lit les étapes de la frise : [{ id, date, texte }, ...] */
function lireEtapes() {
  const etapes = [];
  document.querySelectorAll(".frise__etape").forEach((li, i) => {
    const date = li.querySelector(".frise__date");
    const titre = li.querySelector("h3");
    if (date && titre) {
      etapes.push({ id: `e${i}`, date: date.textContent.trim(), texte: titre.textContent.trim() });
    }
  });
  return etapes;
}

function lancerDates(zone, jeu) {
  const etapes = lireEtapes();
  if (etapes.length < 2) {
    zone.append(creer("p", { texte: "Ajoute au moins deux étapes à la frise pour que le jeu fonctionne." }));
    return;
  }

  /* « plateau » est reconstruit à chaque changement ; « retour » reste en place
     pour que les lecteurs d'écran annoncent ses messages. */
  const conteneur = creer("div", { classe: "jeu__zone" });
  const plateau = creer("div");
  const retour = creer("div", { classe: "jeu__retour", role: "status" });
  conteneur.append(plateau, retour);
  zone.append(conteneur);

  let evenements = [];   /* les événements, dans un ordre mélangé */
  let banque = [];       /* identifiants des dates pas encore placées */
  let cases = {};        /* identifiant de l'événement -> identifiant de la date posée dessus */
  let selection = null;  /* date sélectionnée au clavier ou au clic */
  let verifie = false;
  let ignorerClic = false;

  const dateDe = (id) => etapes.find((etape) => etape.id === id).date;

  function annoncer(texte, enGras) {
    retour.replaceChildren();
    if (texte) {
      retour.append(creer("p", {}, [enGras ? creer("strong", { texte }) : texte]));
    }
  }

  function recommencer() {
    evenements = melanger(etapes);
    banque = melanger(etapes.map((etape) => etape.id));
    cases = {};
    etapes.forEach((etape) => {
      cases[etape.id] = null;
    });
    selection = null;
    verifie = false;
    annoncer("");
    afficher(null);
  }

  /* --- Déplacer les dates entre la liste et les cases --- */
  function emplacementDe(id) {
    const idCase = Object.keys(cases).find((cle) => cases[cle] === id);
    return idCase ? { type: "case", id: idCase } : { type: "banque" };
  }

  function retirer(id) {
    banque = banque.filter((autre) => autre !== id);
    for (const cle of Object.keys(cases)) {
      if (cases[cle] === id) {
        cases[cle] = null;
      }
    }
  }

  /* Pose une date sur une case. S'il y avait déjà une date, elle prend la place
     libérée (échange) ou retourne dans la liste. */
  function placer(id, idCase) {
    const origine = emplacementDe(id);
    const ancien = cases[idCase];
    retirer(id);
    if (ancien && ancien !== id) {
      if (origine.type === "case") {
        cases[origine.id] = ancien;
      } else {
        banque.push(ancien);
      }
    }
    cases[idCase] = id;
  }

  function remettreEnBanque(id) {
    retirer(id);
    banque.push(id);
  }

  /* --- Clic ou clavier --- */
  function cliquerDate(id) {
    if (ignorerClic) {
      return;
    }
    selection = selection === id ? null : id;
    verifie = false;
    annoncer(selection ? `Date ${dateDe(id)} sélectionnée. Choisis maintenant l'événement correspondant.` : "");
    afficher(`[data-date="${id}"]`);
  }

  function cliquerCase(idCase) {
    if (ignorerClic) {
      return;
    }
    verifie = false;
    if (selection) {
      const id = selection;
      selection = null;
      placer(id, idCase);
      annoncer(`Date ${dateDe(id)} placée.`);
      afficher(`[data-case="${idCase}"]`);
    } else if (cases[idCase]) {
      const id = cases[idCase];
      remettreEnBanque(id);
      annoncer(`Date ${dateDe(id)} remise dans la liste.`);
      afficher(`[data-date="${id}"]`);
    } else {
      annoncer("Choisis d'abord une date dans la liste, ou glisse-la ici.");
      afficher(`[data-case="${idCase}"]`);
    }
  }

  /* --- Glisser-déposer (souris et doigt, grâce aux « pointer events ») --- */
  function commencerGlisse(evenement, id) {
    if (evenement.pointerType === "mouse" && evenement.button !== 0) {
      return;
    }
    const origine = evenement.currentTarget;
    const depart = { x: evenement.clientX, y: evenement.clientY };
    let fantome = null;
    let enCours = false;

    function sousLePointeur(x, y) {
      const cible = document.elementFromPoint(x, y);
      return cible ? cible.closest("[data-case], .dates-banque") : null;
    }

    function surligner(x, y) {
      document.querySelectorAll(".dates-zone--survol").forEach((element) => element.classList.remove("dates-zone--survol"));
      const cible = sousLePointeur(x, y);
      if (cible && cible.hasAttribute("data-case")) {
        cible.classList.add("dates-zone--survol");
      }
    }

    function deplacer(e) {
      /* On ne commence à glisser qu'après quelques pixels : sinon c'est un simple clic */
      if (!enCours && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) > 6) {
        enCours = true;
        fantome = creer("div", { classe: "date-fantome", texte: dateDe(id), "aria-hidden": "true" });
        document.body.append(fantome);
        origine.classList.add("date--en-main");
      }
      if (enCours) {
        fantome.style.left = `${e.clientX}px`;
        fantome.style.top = `${e.clientY}px`;
        surligner(e.clientX, e.clientY);
      }
    }

    function arreter() {
      window.removeEventListener("pointermove", deplacer);
      window.removeEventListener("pointerup", relacher);
      window.removeEventListener("pointercancel", annuler);
    }

    function annuler() {
      arreter();
      if (enCours) {
        fantome.remove();
        origine.classList.remove("date--en-main");
      }
    }

    function relacher(e) {
      arreter();
      if (!enCours) {
        return; /* simple clic : c'est l'événement « click » qui s'en occupe */
      }
      fantome.remove();

      /* Le navigateur envoie un « click » juste après un glisser : on l'ignore */
      ignorerClic = true;
      setTimeout(() => {
        ignorerClic = false;
      }, 0);

      const cible = sousLePointeur(e.clientX, e.clientY);
      selection = null;
      verifie = false;
      if (cible && cible.hasAttribute("data-case")) {
        placer(id, cible.getAttribute("data-case"));
        annoncer(`Date ${dateDe(id)} placée.`);
      } else if (cible) {
        remettreEnBanque(id);
        annoncer(`Date ${dateDe(id)} remise dans la liste.`);
      }
      afficher(null);
    }

    window.addEventListener("pointermove", deplacer);
    window.addEventListener("pointerup", relacher);
    window.addEventListener("pointercancel", annuler);
  }

  /* --- Vérification --- */
  function estJuste(evenement) {
    const id = cases[evenement.id];
    return Boolean(id) && dateDe(id) === evenement.date;
  }

  function verifier() {
    verifie = true;
    selection = null;
    const bien = evenements.filter(estJuste).length;
    const videsRestantes = evenements.some((evenement) => !cases[evenement.id]);
    let message = "Bravo, toutes les dates sont justes !";
    if (bien < evenements.length) {
      message = `${bien} sur ${evenements.length} dates bien placées. `;
      message += videsRestantes
        ? "Il reste des cases vides : place toutes les dates, puis vérifie encore."
        : "Déplace les autres dates et vérifie encore.";
    }
    annoncer(message, true);
    afficher('[data-action="verifier"]');
  }

  /* --- Affichage --- */
  function afficher(selecteurFocus) {
    plateau.replaceChildren();
    plateau.append(creer("p", { classe: "jeu__question", texte: jeu.consigne }));

    /* La liste des dates à placer */
    const zoneBanque = creer("div", { classe: "dates-banque", role: "group", "aria-label": "Dates à placer" });
    if (banque.length === 0) {
      zoneBanque.append(creer("p", { classe: "dates-banque__vide", texte: "Toutes les dates sont placées." }));
    }
    for (const id of banque) {
      const pastille = creer("button", {
        classe: "date-pastille",
        type: "button",
        texte: dateDe(id),
        "aria-pressed": String(selection === id),
        "data-date": id,
      });
      pastille.addEventListener("pointerdown", (e) => commencerGlisse(e, id));
      pastille.addEventListener("click", () => cliquerDate(id));
      zoneBanque.append(pastille);
    }
    plateau.append(zoneBanque);

    /* Les événements, chacun avec sa case */
    const liste = creer("ol", { classe: "ordre" });
    for (const evenement of evenements) {
      const li = creer("li");
      li.append(creer("span", { classe: "ordre__texte", texte: evenement.texte }));

      if (verifie) {
        const juste = estJuste(evenement);
        li.classList.add(juste ? "reponse--juste" : "reponse--fausse");
        let statut = "Pas la bonne date";
        if (juste) {
          statut = "Bonne date";
        } else if (!cases[evenement.id]) {
          statut = "Pas de date";
        }
        li.append(creer("span", { classe: "ordre__statut", texte: statut }));
      }

      const idDate = cases[evenement.id];
      const bouton = creer("button", { type: "button", "data-case": evenement.id });
      if (idDate) {
        bouton.className = "dates-zone dates-zone--pleine";
        bouton.textContent = dateDe(idDate);
        bouton.setAttribute("aria-label", `${evenement.texte} : ${dateDe(idDate)}. Cliquer pour remettre cette date dans la liste.`);
        bouton.addEventListener("pointerdown", (e) => commencerGlisse(e, idDate));
      } else {
        bouton.className = "dates-zone";
        bouton.textContent = "Dépose la date ici";
        bouton.setAttribute("aria-label", `${evenement.texte} : aucune date placée.`);
      }
      bouton.addEventListener("click", () => cliquerCase(evenement.id));
      li.append(bouton);
      liste.append(li);
    }
    plateau.append(liste);

    const verifierBouton = creer("button", {
      classe: "bouton bouton--principal",
      type: "button",
      texte: "Vérifier",
      "data-action": "verifier",
    });
    verifierBouton.addEventListener("click", verifier);
    const recommencerBouton = creer("button", { classe: "bouton", type: "button", texte: "Recommencer" });
    recommencerBouton.addEventListener("click", recommencer);
    plateau.append(creer("div", { classe: "jeu__options" }, [verifierBouton, recommencerBouton]));

    /* Après une action, on redonne le focus à l'élément utilisé (utile au clavier) */
    if (selecteurFocus) {
      const element = conteneur.querySelector(selecteurFocus);
      if (element) {
        element.focus();
      }
    }
  }

  recommencer();
}


/* 5. DÉMARRAGE ------------------------------------------------------------- */
function demarrerJeu() {
  const jeu = JEUX[document.body.dataset.page];
  const zone = document.querySelector(".jeu");
  if (!jeu || !zone) {
    return;
  }

  /* On retire le texte d'attente (« a besoin de JavaScript ») */
  zone.querySelectorAll(":scope > p").forEach((paragraphe) => paragraphe.remove());

  if (jeu.type === "dates") {
    lancerDates(zone, jeu);
  } else {
    lancerQuiz(zone, jeu);
  }
}

demarrerJeu();