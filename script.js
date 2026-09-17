const form = document.querySelector("#registration-form");
const errorMessage = document.querySelector("#error-message");
const summary = document.querySelector("#summary");
const summaryList = document.querySelector("#summary-list");

const fields = [
  { id: "login", label: "Login" },
  { id: "nom", label: "Nom" },
  { id: "prenom", label: "Prénom" },
  { id: "adresse", label: "Adresse" },
  { id: "email", label: "Email" },
  { id: "telephone", label: "Téléphone" },
  { id: "date-naissance", label: "Date de naissance" },
];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  errorMessage.textContent = "";

  const errors = [];
  const values = {};

  [...fields, { id: "password", label: "Mot de passe" }, { id: "confirm-password", label: "Confirmation du mot de passe" }].forEach(
    ({ id, label }) => {
      const field = document.querySelector(`#${id}`);
      values[id] = field.value.trim();

      if (!values[id]) {
        errors.push(`Le champ « ${label} » est obligatoire.`);
      }
    },
  );

  const emailField = document.querySelector("#email");
  if (values.email && !emailField.checkValidity()) {
    errors.push("Veuillez saisir une adresse email valide.");
  }

  if (values.password && values["confirm-password"] && values.password !== values["confirm-password"]) {
    errors.push("Le mot de passe et sa confirmation ne correspondent pas.");
  }

  if (errors.length > 0) {
    errorMessage.innerHTML = `<ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>`;
    errorMessage.hidden = false;
    summary.hidden = true;
    return;
  }

  summaryList.replaceChildren();
  fields.forEach(({ id, label }) => {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = values[id];
    summaryList.append(term, description);
  });

  form.hidden = true;
  summary.hidden = false;
});