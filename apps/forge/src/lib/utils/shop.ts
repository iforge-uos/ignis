import { User } from "@packages/types/users";

const generateRandomHash = () => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase(),
  ).join("");
};

export const handleTopUp = (user: User) => {
  // ...please enter the last part only
  // e.g. for “Van Der Vaart”, enter “Vaart” or for “Garcia Fernandez-Mendoza”, enter “Fernandez-Mendoza”.
  const lastName = user.last_name?.split(" ").at(-1) || "";

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://onlinepayments.shef.ac.uk/papercut";
  form.target = "_blank"; // Open in new tab

  const fields = {
    username: user.username,
    lastname: lastName,
    tandc: "1",
    [generateRandomHash()]: generateRandomHash(),
    token: "",
  };

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
