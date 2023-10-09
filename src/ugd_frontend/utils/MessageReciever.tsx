import React, { useEffect, useState } from 'react';
import { ugd_backend } from "../../declarations/ugd_backend";

const MessageReceiver: React.FC = () => {
  const [greeting, setGreeting] = useState<string>("");

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const button: HTMLButtonElement | null = form.querySelector("button");
    const nameInput: HTMLInputElement | null = document.getElementById("name") as HTMLInputElement | null;
    
    if (!button || !nameInput) {
      console.error("Elements not found");
      return;
    }

    const name = nameInput.value;
    button.setAttribute("disabled", "true");

    const responseGreeting = await ugd_backend.greet(name);
    setGreeting(responseGreeting);
    button.removeAttribute("disabled");
  };

  useEffect(() => {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    return () => {
      if (form) {
        form.removeEventListener("submit", handleFormSubmit);
      }
    };
  }, []);

  return <div id="greeting">{greeting}</div>;
};

export default MessageReceiver;
