const form = document.querySelector("#registration-form");
const errorMessage = document.querySelector("#error-message");
const summary = document.querySelector("#summary");
const summaryList = document.querySelector("#summary-list");

// Champs affichés dans le récapitulatif final.
const fields = [
  { id: "login", label: "Login" },
  { id: "nom", label: "Nom" },
  { id: "prenom", label: "Prénom" },
  { id: "adresse", label: "Adresse" },
  { id: "email", label: "Email" },
  { id: "telephone", label: "Téléphone" },
  { id: "date-naissance", label: "Date de naissance" },
];

// Intercepte l'envoi pour valider les données sans recharger la page.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  errorMessage.textContent = "";

  const errors = [];
  const values = {};

  // Vérifie que chaque champ obligatoire contient une valeur.
  [...fields, { id: "password", label: "Mot de passe" }, { id: "confirm-password", label: "Confirmation du mot de passe" }].forEach(
    ({ id, label }) => {
      const field = document.querySelector(`#${id}`);
      values[id] = field.value.trim();

      if (!values[id]) {
        errors.push(`Le champ « ${label} » est obligatoire.`);
      }
    },
  );

  // Vérifie le format de l'adresse email.
  const emailField = document.querySelector("#email");
  if (values.email && !emailField.checkValidity()) {
    errors.push("Veuillez saisir une adresse email valide.");
  }

  // Vérifie que les deux mots de passe sont identiques.
  if (values.password && values["confirm-password"] && values.password !== values["confirm-password"]) {
    errors.push("Le mot de passe et sa confirmation ne correspondent pas.");
  }

  // Affiche toutes les erreurs détectées et conserve le formulaire visible.
  if (errors.length > 0) {
    errorMessage.innerHTML = `<ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>`;
    errorMessage.hidden = false;
    summary.hidden = true;
    return;
  }

  // Construit le récapitulatif sans inclure les mots de passe.
  summaryList.replaceChildren();
  fields.forEach(({ id, label }) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = values[id];
    summaryList.append(term, description);
  });

  // Remplace le formulaire par le récapitulatif.
  form.hidden = true;
  summary.hidden = false;
});