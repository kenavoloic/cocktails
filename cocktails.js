// Listener initial 
document.addEventListener('DOMContentLoaded', () => {
  
  let onglets = document.getElementsByClassName('onglet');

  Array.from(onglets).map(x => {
    x.addEventListener('click', navigationOnglets);
    x.cible = x.id.replace('bouton_','');
  });

  //Simule un clic sur le bouton [Cocktail du jour]
  let explosion = new Event("click", {'bubbles':true, 'cancelable':false});
  document.getElementById('bouton_quotidien').dispatchEvent(explosion);
  //document.getElementById('bouton_sansAlcool').dispatchEvent(explosion);
});

// Constantes et fonctions

//Version
const version = () => 0.51;

const jsonNotes = (version) => {
  return {
    "API": "https://www.thecocktaildb.com/api.php",
    "Version": version,
    "Description": "Base de données de cocktails. Pour chaque cocktail, il est proposé une image ainsi qu’une liste des ingrédients et des quantités requises. Toutes les indications sont rédigées en langue anglaise. Il n’existe pas de traduction en français. Cependant, les instructions sont aisément compréhensibles pour qui désire découvrir ces cocktails.",
    "Fonctions implémentées": "Recherche par ID, recherche par nom, recherche par initiale, cocktail aléatoire, liste d’ingrédients, liste cocktails sans alcool.",
    "Langages": "Html5, CSS3, JavaScript.",
    "Outils et techniques JavaScript": "POO, programmation fonctionnelle, curryfication, fetch, promesses, regex, callbacks, DOM, gestion d’événements, dataset."
  };
};

const listeNotes = liste => {
  
  let clefs = Object.keys(liste);
  let retour = clefs.map(x => {
    let titre = document.createElement('dt');
    titre.appendChild(document.createTextNode(x));
    let libelle = document.createElement('dd');
    libelle.appendChild(document.createTextNode(liste[x]));
    return [titre, libelle];
  });

  const reducteur = (acc, valeur) => acc.concat(valeur);
  let tous = retour.reduce(reducteur, []);
  
  let dl = document.createElement('dl');
  tous.forEach(x => dl.appendChild(x));
  return dl;
};

const _creationNotes = (fonctionListeNotes, fonctionJson, fonctionVersion) => fonctionListeNotes(fonctionJson(fonctionVersion()));

const creationNotes = () =>_creationNotes(listeNotes, jsonNotes, version);

const liens = lien => {

  const liensAPI = {
    initiale: {url:"https://www.thecocktaildb.com/api/json/v1/1/search.php?f=", parametre:true},
    avecAlcool: {url:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic", parametre:false},
    sansAlcool: {url:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic", parametre:false},
    nom: {url:"https://www.thecocktaildb.com/api/json/v1/1/search.php?s=", parametre:true},
    id: {url:"https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=", parametre:true},
    aleatoire: {url:"https://www.thecocktaildb.com/api/json/v1/1/random.php", parametre:false},
    ingredient: {url:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=", parametre:true},
    // List the categories, glasses, ingredients or alcoholic filters
    cocktailsCategories: {url:"https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list", parametre:false},
    cocktailsVerres: {url:"https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list", parametre:false},
    cocktailsIngredients:{url:"https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list", parametre:false},
    cocktailsAlcools: {url:"https://www.thecocktaildb.com/api/json/v1/1/list.php?a=list", parametre:false}
  };

  //Prédicats
  let url_p = liensAPI[lien].url;
  let parametre_p = liensAPI[lien].parametre;

  const requeteComplexe = lien => donnee => {
    const options = {method:'GET'};
    return new Request(lien+donnee, options);
  };
  
  const requeteSimple = lien => {
    const options = {method:'GET'};
    return new Request(lien, options);
  };
  
  return url_p ? (parametre_p ? requeteComplexe(url_p) : requeteSimple(url_p)) : {url: null, parametre:false};
};

const requeteAvecAlcool = () => liens('avecAlcool'); 
const requeteSansAlcool = () => liens('sansAlcool');
const requeteAleatoire = () => liens('aleatoire');

const cocktailsCategories = () => liens('cocktailsCategories'); 
const cocktailsVerres = () => liens('cocktailsVerres');
const cocktailsIngredients = () => liens('cocktailsIngredients');
const cocktailsAlcools = () => liens('cocktailsAlcools');

//Fonctions "curried" 
const requeteParInitiale = liens('initiale');
const requeteParNom = liens('nom');
const requeteParId = liens('id');
const requeteParIngredient = liens('ingredient');

const nettoyageChaine = envoi =>{
  let tri1 = envoi.toString().replace(/[\n\r]+/g, '').replace(/,+/g, ",").replace(/ +/g, ' ').replace(/(^,)|(,$)/g, "").replace(/(^)|( $)/g, "").replace(" ,", ",");
  let tri2 = tri1.split(",").map(x => x.trim());
  return tri2.join(", ");
};

const filtreListe = (motif, filtre) => cocktail => {
  const predicat_p = x => x.startsWith(motif);
  let retour = Object.keys(cocktail).filter(predicat_p).map(x => cocktail[x]).filter(x => x);
  return filtre(retour);
};

const listeIngredients = filtreListe("strIngredient", nettoyageChaine);
const listeQuantites = filtreListe("strMeasure", nettoyageChaine);

//Curried 
const _elementsCocktail = (extractionIngredients, extractionQuantites) => cocktail => {
  //en provenance de rechercheParID >=> lookup.php?i=
  let {idDrink:id, strAlcoholic:type, strCategory:categorie, strDrink:nom, strDrinkThumb:vignette, strGlass:verre, strInstructions:instructions} = cocktail;
  let ingredients = extractionIngredients(cocktail);
  let quantites = extractionQuantites(cocktail);
  let onoff = "portrait"; 
  return {id:id, nom:nom, vignette:vignette, verre:verre, instructions:instructions, ingredients:ingredients, quantites:quantites, categorie:categorie, type:type, onoff:onoff};
};

const elementsCocktail = _elementsCocktail(listeIngredients, listeQuantites);

const validationReponse = reponse => {
  if(!reponse.ok){
    throw Error(reponse.statusText);
  }
  return reponse.json();
};

const traitementErreurFetch = message => erreur => {
  console.log(message, erreur.message);
};

// Par nom
const selectorChoixInconnu = (libelle, numeroId) => {
  let selector = document.createElement('select');
  let optionInconnue =  new Option(libelle, numeroId);
  optionInconnue.setAttribute("disabled", ""); // équivaut à TRUE
  optionInconnue.setAttribute("selected", ""); // équivaut à TRUE
  selector.appendChild(optionInconnue);
  return selector;
};

const selectorChoixMultiples = liste => {  
  let selector = document.createElement('select');
  let choix0 = new Option("Cocktails", "000");
  choix0.setAttribute("disabled", "");
  choix0.setAttribute("selected", "");
  selector.appendChild(choix0);
  liste.forEach(x => {
    selector.appendChild(new Option(x.strDrink, x.idDrink));
  });
  return selector;
};

const traitementRequeteNom = reponse => {
  return reponse.drinks === undefined ?  {'drinks':null} : reponse.drinks;
};

const traitementRequeteIngredient = reponse => {
  return reponse.drinks == null ?  {'drinks':null} : reponse.drinks;
};

//////////////////////////////////////////////////////////////////////////////////
//Objet Cocktail
//À la manière de Douglas Crockford
//////////////////////////////////////////////////////////////////////////////////

const Cocktail = function (arguments) {

  const {id, nom, vignette, categorie, instructions, verre, type, ingredients, quantites, onoff} = arguments;

  const getCadre = () => {
    let cadre = document.createElement('div');
    cadre.dataset.id = id;
    cadre.dataset.nom = nom;
    cadre.dataset.categorie = categorie;
    cadre.dataset.instructions = instructions;
    cadre.dataset.verre = verre;
    cadre.dataset.type = type;
    cadre.dataset.vignette = vignette;
    cadre.dataset.ingredients = ingredients;
    cadre.dataset.quantites = quantites;
    cadre.dataset.onoff = onoff;
    cadre.setAttribute('class','cadre');
    cadre.setAttribute('id',cadre.dataset.id);        
    return cadre;
  };
  
  const portrait = function(cadre) {
    cadre.dataset.onoff = "portrait";
    let pix = document.createElement('img');
    pix.setAttribute('src',cadre.dataset.vignette);

    let titre = document.createElement('p');
    titre.appendChild(document.createTextNode(cadre.dataset.nom));
    titre.setAttribute('class','titre');

    cadre.appendChild(pix);
    cadre.appendChild(titre);
    return cadre;
  };

  const descriptif = function(cadre) {

    cadre.setAttribute('id', `d_${cadre.dataset.id}`);
    cadre.dataset.onoff = "descriptif";
    let titre = document.createElement('p');
    titre.appendChild(document.createTextNode(cadre.dataset.nom));
    titre.setAttribute('class','titreDescription');

    let instructions = document.createElement('p');
    instructions.setAttribute('class','instructions');
    instructions.appendChild(document.createTextNode(cadre.dataset.instructions));

    let categorie = document.createElement('p');
    categorie.setAttribute('class','categorie');
    categorie.appendChild(document.createTextNode(cadre.dataset.categorie));

    let ingredients = document.createElement('p');
    ingredients.setAttribute('class','ingredients');
    ingredients.appendChild(document.createTextNode(cadre.dataset.ingredients));

    let quantites = document.createElement('p');
    quantites.setAttribute('class','quantites');
    quantites.appendChild(document.createTextNode(cadre.dataset.quantites));

    let titreIngredients = document.createElement('p');
    titreIngredients.setAttribute('class','section');
    titreIngredients.appendChild(document.createTextNode('Ingredients'));
    
    let titreQuantites = document.createElement('p');	
    titreQuantites.setAttribute('class','section');
    titreQuantites.appendChild(document.createTextNode('Measures'));

    cadre.appendChild(titre);
    cadre.appendChild(categorie);
    cadre.appendChild(instructions);
    cadre.appendChild(titreIngredients);
    cadre.appendChild(ingredients);
    cadre.appendChild(titreQuantites);
    cadre.appendChild(quantites);
    
    return cadre;
  };

  //Retourne les éléments du constructeur
  const getConstructeur = function(){
    return {id:id, nom:nom, vignette:vignette, categorie:categorie, instructions:instructions, verre:verre, type:type, ingredients:ingredients, quantites:quantites, onoff:onoff};
  };

  const getPortrait = () => {
    let cadre = getCadre();
    return portrait(cadre);
  };
  
  const getPortraitDescriptif = () => {
    let cadre1 = getCadre();
    let cadre2 = getCadre();
    let p = portrait(cadre1);
    let d = descriptif(cadre2);
    return {portrait:p,descriptif:d};
  };

  const getCocktailId = () => id;
  
  //Fonctions publiques
  return {getPortrait, getPortraitDescriptif, getConstructeur, getCocktailId};
};


// Tri propriété de type STRING
const triParPropriete = propriete => (x, y) => {
  return (x[propriete]).localeCompare(y[propriete]);
};

const triCocktailParNom = triParPropriete('nom');
const triCocktailParStrDrink = triParPropriete('strDrink');

//////////////////////////////////////////////////////////////////////////////////
// Système de navigation par onglets
//////////////////////////////////////////////////////////////////////////////////

function navigationOnglets(e){

  let ppl = document.getElementById('principal');
  let bouton = e.target;

  let onglets = document.getElementsByClassName('onglet');
  Array.from(onglets).map(x => {
    x.classList.remove('actif');
  });
  
  bouton.classList.add('actif');

  if(document.querySelector('section')){  
    while(ppl.firstChild){
      ppl.removeChild(ppl.firstChild);
    }
  }
  
  let destination = null;
  
  switch(e.target.id){
  case 'bouton_quotidien':
    destination = pageCocktailDuJour('quotidien');
    ppl.appendChild(destination);
    break;
  case 'bouton_parIndex':
    destination  = rechercheCocktailsParIndex('parIndex');
    ppl.appendChild(destination);
    break;
  case 'bouton_parNom':
    destination  = rechercheCocktailsParNom('parNom');
    ppl.appendChild(destination);
    break;
  case 'bouton_parIngredient':
    destination  = rechercheCocktailsParIngredient('parIngredient');
    ppl.appendChild(destination);
    break;
  case 'bouton_sansAlcool':
    destination = pageSansAlcool('sansAlcool');
    ppl.appendChild(destination);
    break;
  case 'bouton_notes':
    destination = pageNotes('notes', creationNotes());
    ppl.appendChild(destination);
    break;


  }
}

//selecteur : ingredients, categories, verres, avec/sans alcool

const traitementListeJSON = (intitule, propriete, articleID, evenementEcouteur, ecouteur) => reponseJSON => {
  let liste = reponseJSON.drinks;
  let df = new DocumentFragment();

  let selecteur = document.createElement('select');
  let ingredient0 = new Option("Liste","000");
  ingredient0.setAttribute("disabled",""); //équivaut à true
  ingredient0.setAttribute("selected","");
  selecteur.appendChild(ingredient0);

  let proprietes = liste.map(x => x[propriete]).sort().filter(x => x); // [filter] pour les cas où x = null

  let options = proprietes.map(x => {
    let option = document.createElement('option');
    option.appendChild(document.createTextNode(x));
    return option;
  });

  options.forEach(x => {
    selecteur.appendChild(x);
  });

  selecteur.addEventListener(evenementEcouteur, ecouteur);
  
  df.appendChild(selecteur);
  return df;
};

const traitementListeExtraction = (requete, extracteur) => {
  return fetch(requete)
    .then(reponse => {
      if(!reponse.ok){
	return [{drinks:"Inconnu"}];
      }
      return reponse;
    })
    .then(reponse => reponse.json())
    .then(extracteur)
    .catch(erreur => {console.log(erreur);});
};

//////////////////////////////////////////////////////////////////////////////////
// Page Sans Alcool
//////////////////////////////////////////////////////////////////////////////////

function pageSansAlcool(idOnglet){
  let requete = requeteSansAlcool();

  let df = new DocumentFragment();
  let sortie = document.createElement('section');
  sortie.setAttribute('id', idOnglet);
  sortie.setAttribute('class',idOnglet);

  let affichage = document.createElement('article');
  affichage.setAttribute('id','affichage');
  sortie.appendChild(affichage);

  fetch(requete)
    .then(validationReponse)
    .then(retour => {
      let liste = retour['drinks'].sort(triCocktailParStrDrink);
      liste.forEach(x => {
	let id = x.idDrink;
	let requeteId = requeteParId(id);
	fetch(requeteId)
	  .then(validationReponse)
	  .then(retourId => {
	    let cocktail = new Cocktail(elementsCocktail(retourId['drinks'][0]));
	    let {portrait, descriptif} = cocktail.getPortraitDescriptif();
	    let article = document.createElement('div');
	    article.setAttribute('class','cadre');
	    portrait.setAttribute('class','portrait');
	    descriptif.setAttribute('class','descriptif disparitionPortraitDescriptif');
	    article.appendChild(portrait);
	    article.appendChild(descriptif);
	    article.addEventListener('click', togglePortraitDescriptif);
	    df.appendChild(article);
	    affichage.appendChild(df);
	  })
	  .catch(echec => console.log('Échec recherche par Id ', echec));
      });
    })
    .catch(erreur => console.log('Sans alcool ', erreur));    
  return sortie;
}

//////////////////////////////////////////////////////////////////////////////////
// Page notes
//////////////////////////////////////////////////////////////////////////////////

function pageNotes(idOnglet, notes){
  let df = new DocumentFragment();
  let sortie = document.createElement('section');
  sortie.setAttribute('id',idOnglet);
  sortie.setAttribute('class',idOnglet);
  sortie.appendChild(notes);
  df.appendChild(sortie);
  return df;
}

//////////////////////////////////////////////////////////////////////////////////
// Cocktail du jour
//////////////////////////////////////////////////////////////////////////////////

function pageCocktailDuJour(idOnglet){
  
  let requete = requeteAleatoire();
  
  let sortie = document.createElement('section');
  sortie.setAttribute('id',idOnglet);
  sortie.setAttribute('class',idOnglet);
  
  let df = new DocumentFragment();

  fetch(requete)
    .then(validationReponse)
    .then(retour => {
      let liste = retour.drinks;
      let cible = document.getElementById(sortie);      
      liste.map(x => {
	let cocktail = new Cocktail(elementsCocktail(x));
	let {portrait, descriptif} = cocktail.getPortraitDescriptif();
	df.appendChild(portrait);
	df.appendChild(descriptif);
      });
      sortie.appendChild(df);
    })
    .catch(traitementErreurFetch("Cocktail du jour"));
  return sortie;
}

//////////////////////////////////////////////////////////////////////////////////
// Par index/initiale
//////////////////////////////////////////////////////////////////////////////////

function rechercheCocktailsParIndex(idOnglet){
  let sortie = document.getElementById(idOnglet);

  let df = new DocumentFragment();
  let section = document.createElement('section');
  section.setAttribute('id',idOnglet);
  section.setAttribute('class',idOnglet);

  let header = document.createElement('article');
  header.setAttribute('id','header');

  let article = document.createElement('article');
  article.setAttribute('id','affichage');

  let formulaire = document.createElement('form');
  formulaire.setAttribute('id','initiale');

  let label = document.createElement('label');
  label.appendChild(document.createTextNode('Recherche par index (0-9) (A-Z)'));

  let texte = document.createElement('input');
  texte.setAttribute('id','lettre');
  texte.setAttribute('type','search');
  texte.setAttribute('name','lettre');
  texte.setAttribute('maxlength',1);
  texte.setAttribute('size',3);
  texte.setAttribute('destination','affichage');
  texte.setAttribute('sortie',idOnglet);

  formulaire.appendChild(label);
  formulaire.appendChild(texte);
  header.appendChild(formulaire);
  
  section.appendChild(header);
  section.appendChild(article);
  df.appendChild(section);

  texte.addEventListener('input', rechercheParInitiale);
  return df;
}

function rechercheParInitiale(e){

  if(e.data === "" || e.data === " " || e.data == null){
    return;
  }
  
  let origine = e.target;
  let idOnglet = e.srcElement.attributes.sortie.value;
  let donnee = e.data;  

  let cible = document.getElementById('affichage');
  let requete = requeteParInitiale(donnee);

  while(cible.hasChildNodes()){
    cible.removeChild(cible.lastChild);
  }

  let df = new DocumentFragment();
  let contenant = document.createElement('article');
  contenant.setAttribute('id','contenant');
  
  fetch(requete)
    .then(validationReponse)
    .then(retour => {
      let liste = retour;
      console.log(liste['drinks']);
      liste['drinks'].map(x => {
	let cocktail = new Cocktail(elementsCocktail(x));
	let {portrait, descriptif} = cocktail.getPortraitDescriptif();
	let article = document.createElement('div');
	article.setAttribute('class','cadre');
	portrait.setAttribute('class','portrait');
	descriptif.setAttribute('class','descriptif disparitionPortraitDescriptif');

	article.appendChild(portrait);
	article.appendChild(descriptif);
	df.appendChild(article);
	article.addEventListener('click', togglePortraitDescriptif);
      });
      contenant.appendChild(df);
      cible.appendChild(contenant);
    }).then( () => {
      // Remise à zéro
      origine.value = "";
    })
    .catch(traitementErreurFetch("Recherche par initiale"));
}

//////////////////////////////////////////////////////////////////////////////////
// Par nom
//////////////////////////////////////////////////////////////////////////////////

function rechercheCocktailsParNom(idOnglet){

  let df = new DocumentFragment();
  let section = document.createElement('section');
  section.setAttribute('id',idOnglet);
  section.setAttribute('class',idOnglet);

  let header = document.createElement('article');
  header.setAttribute('id','header');
  
  let formulaire = document.createElement('form');
  formulaire.setAttribute('id','formulaire');
  formulaire.dataset.sortie = idOnglet;
  
  let label = document.createElement('label');
  label.appendChild(document.createTextNode('Recherche par nom'));

  let bouton = document.createElement('button');
  bouton.appendChild(document.createTextNode('Envoi'));
  bouton.setAttribute('type','submit');

  let texte = document.createElement('input');
  texte.setAttribute('id','nom');
  texte.setAttribute('type','search');
  texte.setAttribute('name','nom');

  let article = document.createElement('article');
  article.setAttribute('id','affichage');

  let contenant = document.createElement('article');
  contenant.setAttribute('id','contenant');

  article.appendChild(contenant);

  formulaire.appendChild(label);
  formulaire.appendChild(texte);
  formulaire.appendChild(bouton);
  header.appendChild(formulaire);
  section.appendChild(header);
  section.appendChild(article);
  df.appendChild(section);
  
  formulaire.addEventListener('submit', selecteurCocktailParNom);

  return df;
}

function selecteurCocktailParNom(e){

  e.preventDefault();

  let donnee = e.target.elements.nom.value;
  if(donnee === "" || donnee === " " || donnee == null) {
    return;
  }

  let idOnglet = e.srcElement.dataset.sortie;
  let sortie = document.getElementById(idOnglet);
  let origine = document.getElementById('nom');
  
  let ancienSelecteur = document.getElementById('selecteur');
  if(ancienSelecteur){
    ancienSelecteur.remove();
  }

  let selecteur;  
  let requete = requeteParNom(donnee);  
  
  fetch(requete)
    .then(validationReponse)
    .then(traitementRequeteNom)
    .then(reponse => {
      selecteur = reponse ? selectorChoixMultiples(reponse) : selectorChoixInconnu("Nom inconnu","-1");
      selecteur.dataset.affichage = "affichage";
      selecteur.dataset.contenant = "contenant";
      selecteur.setAttribute('id','selecteur');
      selecteur.addEventListener('change',selectionCocktailParNom);
      document.getElementById("formulaire").appendChild(selecteur);    
    })
    .then(() => {
      origine.value = "";
    })
    .catch(traitementErreurFetch("Selecteur par nom"));
}

function selectionCocktailParNom(e){
  let numeroId = e.target.options[e.target.selectedIndex].value;
  let affichage = document.getElementById(e.srcElement.dataset.affichage);
  let contenant = document.getElementById(e.srcElement.dataset.contenant);

  let requete = requeteParId(numeroId);

  if(contenant){
    while(contenant.firstChild){
      contenant.removeChild(contenant.firstChild);
    }
  }
  
  fetch(requete)
    .then(validationReponse)
    .then(retour => {
      let x = retour['drinks'][0];
      let cocktail = new Cocktail(elementsCocktail(x));
      let {portrait, descriptif} = cocktail.getPortraitDescriptif();
      contenant.appendChild(portrait);
      contenant.appendChild(descriptif);      
    });
}

//////////////////////////////////////////////////////////////////////////////////
// Par ingrédient
//////////////////////////////////////////////////////////////////////////////////

function rechercheCocktailsParIngredient(idOnglet){  
  let df = new DocumentFragment();
  let section = document.createElement('section');
  section.setAttribute('id',idOnglet);
  section.setAttribute('class',idOnglet);

  let header = document.createElement('article');
  header.setAttribute('id','header');

  let formulaire = document.createElement('form');
  formulaire.setAttribute('id','formulaire');
  formulaire.dataset.sortie = idOnglet;

  let label = document.createElement('label');
  label.appendChild(document.createTextNode('Recherche par ingrédient'));

  let article = document.createElement('article');
  article.setAttribute('id','affichage');

  let contenant = document.createElement('article');
  contenant.setAttribute('id','contenant');

  article.appendChild(contenant);
  formulaire.appendChild(label);

  const selIngredient = traitementListeJSON("Ingrédients", "strIngredient1", "ingredients", "change", ecouteurListeCocktailsIngredients);

  Promise.all([traitementListeExtraction(cocktailsIngredients(), selIngredient)])
    .then(retour => {
      retour.forEach(x => {
	formulaire.appendChild(x);
      });
    });

  header.appendChild(formulaire);
  section.appendChild(header);
  section.appendChild(article);
  df.appendChild(section);
  return df;
}

function selectionCocktailParIngredient(e){
  let numeroId = e.target.options[e.target.selectedIndex].value;
  let affichage = document.getElementById(e.srcElement.dataset.affichage);
  let contenant = document.getElementById(e.srcElement.dataset.contenant);
  
  let requete = requeteParId(numeroId);

  if(contenant){
    while(contenant.firstChild){
      contenant.removeChild(contenant.firstChild);
    }
  }

  fetch(requete)
    .then(validationReponse)
    .then(retour => {
      let x = retour['drinks'][0];
      let y = new Cocktail(elementsCocktail(x));
      let {portrait, descriptif} = y.getPortraitDescriptif();
      contenant.appendChild(portrait);
      contenant.appendChild(descriptif);      
    });
}

function ecouteurListeCocktailsIngredients(e){

  if(e.target.tagName.toLowerCase() != 'select') {
    return ;
  }

  let donnee = e.target.value;
  let requete = requeteParIngredient(donnee);
  let selecteur = null;

  let ancienSelecteur = document.getElementById("selecteur");
  if(ancienSelecteur){
    ancienSelecteur.remove();
  }
  
  fetch(requete)
    .then(validationReponse)
    .then(reponse => {
      selecteur = reponse ? selectorChoixMultiples(reponse.drinks) : selectorChoixInconnu("Ingrédient inconnu", "-1");
      selecteur.dataset.affichage = "affichage";
      selecteur.dataset.contenant = "contenant";
      selecteur.setAttribute("id", "selecteur");
      selecteur.addEventListener("change", selectionCocktailParIngredient);
      document.getElementById("formulaire").appendChild(selecteur);
    })
    .catch(traitementErreurFetch("Dubstep"));

}

//////////////////////////////////////////////////////////////////////////////////
// Gestion des événements
//////////////////////////////////////////////////////////////////////////////////

function togglePortraitDescriptif(e){

  let origine = e.srcElement.parentElement;

  let ancetre = origine.closest('.cadre');
  let descendants = ancetre.children;
  
  Array.from(descendants).forEach(x => x.classList.toggle('disparitionPortraitDescriptif'));
}
