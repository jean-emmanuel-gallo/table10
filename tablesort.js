$(function() {
    // Gestionnaire d'événements pour la sélection de la date de début
    $('#new-date-debut').on('change', function() {
        // Récupérer la date de début sélectionnée
        let startDate = $(this).datepicker('getDate');

        // Si la date de début est valide
        if (startDate) {
            // Trouver la durée du thème sélectionné
            let selectedThemeName = $('#new-theme').val();
            let selectedTheme = Object.values(themesData).find(theme => theme.name === selectedThemeName);

            // Vérifier la durée du thème et mettre à jour la date de fin en conséquence
            let endDate = new Date(startDate.getTime());
            if (selectedTheme) {
                if (selectedTheme.duration === 2) {
                    // Ajouter un jour à la date de début pour obtenir la date de fin
                    endDate.setDate(endDate.getDate() + 1);
                }
                // Formater la date de fin au format "dd/mm/yyyy"
                let formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
                // Mettre à jour la valeur de l'entrée de date de fin
                $('#new-date-fin').val(formattedEndDate);
            }
        }
    });

    // Gestionnaire d'événements pour la sélection du thème
    $('#new-theme').on('change', function() {
        let selectedThemeName = $(this).val();
        let selectedTheme = Object.values(themesData).find(theme => theme.name === selectedThemeName);

        if (selectedTheme) {
            // Mettre à jour la case "financement"
            $('#new-finan').val(selectedTheme.type);

            // Optionnel : Réinitialiser la date de début et de fin
            $('#new-date-debut').val('');
            $('#new-date-fin').val('');
        }
    });

    // Gestionnaire d'événements pour l'ouverture de la modal d'ajout d'événement
    $('#add-event-btn').on('click', function() {
        // Afficher la modal
        $('#addEventModal').modal('show');
    });

    // Initialiser les datepickers
    $(".datepicker").datepicker({
        dateFormat: "dd/mm/yy"
    });
});

function attachRowClickEvents() {
    // Code pour attacher des événements de clic aux lignes du tableau
    // Par exemple :
    $('.event-row').on('click', function() {
        // Votre logique pour gérer le clic sur une ligne de tableau
    });
}


let eventsArray = [];
let themesData = {};
let formateursData = {};

// Fonction pour construire le tableau
// ... (le reste du code existant)

function buildTable(data) {
    let table = document.getElementById('myTable');
    table.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        let event = data[i];
        let theme = themesData[event.theme_id];
        let formateur = formateursData[event.formateur_id];
        let row = `<tr class="event-row" data-event-id="${event.id}" style="background-color: ${theme.bck_color || '#fff'};">
            <td>${theme.name}</td>
            <td>${event.date_debut}</td>
            <td>${event.date_fin}</td>
            <td>${event.ville}</td>
            <td>${theme.type}</td>
            <td>${formateur.nom} ${formateur.prenom}</td>
            <td>${event.num_s}</td>
        </tr>`;
        table.innerHTML += row;
    }
    displayFormateurListAlphabetique();
    attachRowClickEvents(); // Attacher les événements de clic
}





function displayFormateurListAlphabetique() {
    let formateurList = document.getElementById('formateurs-list-alphabetique');
    let formateursArray = Object.values(formateursData).sort((a, b) => {
        let nameA = `${a.nom} ${a.prenom}`.toLowerCase();
        let nameB = `${b.nom} ${b.prenom}`.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });

    formateurList.innerHTML = '';
    for (let formateur of formateursArray) {
        let listItem = document.createElement('li');
        listItem.textContent = `${formateur.nom} ${formateur.prenom}`;
        formateurList.appendChild(listItem);
    }
}

// Fonction pour récupérer les données JSON et construire le tableau
function fetchJsonData() {
    fetch("./db.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            eventsArray = data.events;
            themesData = Object.fromEntries(data.themes.map(theme => [theme.id, theme]));
            formateursData = Object.fromEntries(data.formateurs.map(formateur => [formateur.id, formateur]));
            buildTable(eventsArray);
        })
        .catch((error) => {
            console.error("Unable to fetch data:", error);
        });
}

// ... (le reste du code existant)


// Appeler fetchJsonData pour initialiser le tableau
fetchJsonData();

// Filtrage par dates
$('#filter-dates-btn').on('click', function() {
    let startDate = $('#date-debut-input').datepicker('getDate');
    let endDate = $('#date-fin-input').datepicker('getDate');
    if (startDate && endDate) {
        let filteredData = filterByDate(startDate, endDate, eventsArray);
        buildTable(filteredData);
    } else {
        alert('Veuillez sélectionner des dates valides.');
    }
});

// Rechercher par thème
$('#themes-input').on('input', function() {
    let value = $(this).val();
    let data = searchTheme(value, eventsArray);
    buildTable(data);
});

function searchTheme(value, data) {
    let filteredTheme = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let theme = themesData[data[i].theme_id].name.toLowerCase();
        if (theme.includes(value)) {
            filteredTheme.push(data[i]);
        }
    }
    return filteredTheme;
}

// Rechercher par financement
$('#finan-input').on('input', function() {
    let value = $(this).val();
    let data = searchFinan(value, eventsArray);
    buildTable(data);
});

function searchFinan(value, data) {
    let filteredFinan = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let themeType = themesData[data[i].theme_id].type.toLowerCase();
        if (themeType.includes(value)) {
            filteredFinan.push(data[i]);
        }
    }
    return filteredFinan;
}

// Rechercher par formateur
$('#formateur-input').on('input', function() {
    let value = $(this).val();
    let data = searchForma(value, eventsArray);
    buildTable(data);
});

function searchForma(value, data) {
    let filteredForma = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let formateur = formateursData[data[i].formateur_id];
        let formateurName = `${formateur.nom} ${formateur.prenom}`.toLowerCase();
        if (formateurName.includes(value)) {
            filteredForma.push(data[i]);
        }
    }
    return filteredForma;
}

// Rechercher par ville
$('#ville-input').on('input', function() {
    let value = $(this).val();
    let data = searchVille(value, eventsArray);
    buildTable(data);
});

function searchVille(value, data) {
    let filteredVille = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let ville = data[i].ville.toLowerCase();
        if (ville.includes(value)) {
            filteredVille.push(data[i]);
        }
    }
    return filteredVille;
}

// Rechercher par numéro de session
$('#num-session-input').on('input', function() {
    let value = $(this).val();
    let data = searchNumSession(value, eventsArray);
    buildTable(data);
});

function searchNumSession(value, data) {
    let filteredNumSession = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let numSession = (data[i].num_s || '').toString().toLowerCase();
        if (numSession.includes(value)) {
            filteredNumSession.push(data[i]);
        }
    }
    return filteredNumSession;
}

// Tri des colonnes
$('th').on('click', function() {
    let column = $(this).data('colname');
    let order = $(this).data('order');
    let text = $(this).html();
    text = text.substring(0, text.length - 1);
    if (order === 'desc') {
        eventsArray = eventsArray.sort((a, b) => a[column] > b[column] ? 1 : -1);
        $(this).data("order", "asc");
        text += '&#9660';
    } else {
        eventsArray = eventsArray.sort((a, b) => a[column] < b[column] ? 1 : -1);
        $(this).data("order", "desc");
        text += '&#9650';
    }
    $(this).html(text);
    buildTable(eventsArray);
});

// Fonction de validation pour vérifier les doublons et les numéros de session
function isDuplicateEvent(newEvent, eventsArray) {
    for (let event of eventsArray) {
        // Vérifier si le formateur est le même et si les dates se chevauchent
        if (event.formateur_id === newEvent.formateur_id) {
            let eventStartDate = new Date(event.date_debut.split('/').reverse().join('-'));
            let eventEndDate = new Date(event.date_fin.split('/').reverse().join('-'));
            let newStartDate = new Date(newEvent.date_debut.split('/').reverse().join('-'));
            let newEndDate = new Date(newEvent.date_fin.split('/').reverse().join('-'));

            // Vérification des chevauchements de dates
            if ((newStartDate <= eventEndDate && newStartDate >= eventStartDate) || 
                (newEndDate <= eventEndDate && newEndDate >= eventStartDate)) {
                return true;
            }
        }
        // Vérifier si le numéro de session est déjà utilisé
        if (event.num_s === newEvent.num_s) {
            return true;
        }
    }
    return false;
}

// Fonction pour obtenir le dernier numéro de session
const getLastSessionNumber = (events) => {
    let lastSessionNumber = 0;
    for (let event of events) {
        if (event.num_s > lastSessionNumber) {
            lastSessionNumber = event.num_s;
        }
    }
    return lastSessionNumber;
};

document.getElementById('add-theme-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let newThemeName = document.getElementById('new-theme').value;
    let newDateDebut = document.getElementById('new-date-debut').value;
    let newDateFin = document.getElementById('new-date-fin').value;
    let newVille = document.getElementById('new-ville').value;
    let newFinan = document.getElementById('new-finan').value;
    let newForma = document.getElementById('new-forma').value;

    let theme = Object.values(themesData).find(theme => theme.name === newThemeName);
    let formateur = Object.values(formateursData).find(formateur => `${formateur.nom} ${formateur.prenom}` === newForma);

    if (!theme || !newDateDebut || !newDateFin || !newVille || !newFinan || !formateur) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Récupérer le dernier numéro de session utilisé
    let lastSessionNumber = getLastSessionNumber(eventsArray);
    
    // Fonction pour générer le prochain numéro de session
    const generateNextSessionNumber = () => lastSessionNumber + 1;

    // Générer le prochain numéro de session
    let newNumSession = generateNextSessionNumber();

    let newEntry = {
        theme_id: theme.id,
        date_debut: newDateDebut,
        date_fin: newDateFin,
        ville: newVille,
        finan: newFinan,
        formateur_id: formateur.id,
        num_s: newNumSession // Ajout du numéro de session
    };

    // Vérifier les doublons
    if (isDuplicateEvent(newEntry, eventsArray)) {
        alert("Ce formateur a déjà une formation prévue aux mêmes dates.");
        return;
    }

    // Ajouter la nouvelle entrée au tableau de données
    eventsArray.push(newEntry);
    buildTable(eventsArray);

    // Réinitialiser le formulaire
    document.getElementById('add-theme-form').reset();
});
