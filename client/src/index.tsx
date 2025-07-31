/* @refresh reload */
import "bootstrap/scss/bootstrap.scss";

import { render } from "solid-js/web";

import "./style.scss";

import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { CharacterStoreProvider } from "./components/CharacterStoreProvider";
import { SavedCharacterStoreProvider } from "./components/SavedCharacterStoreProvider";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

const client = new QueryClient();

render(
    () => (
        <QueryClientProvider client={client}>
            <CharacterStoreProvider>
                <SavedCharacterStoreProvider>
                    <App />
                </SavedCharacterStoreProvider>
            </CharacterStoreProvider>
        </QueryClientProvider>
    ),
    root!
);
