/* @refresh reload */
import "bootstrap/scss/bootstrap.scss";

import { render } from "solid-js/web";

import favicon from "../assets/favicon.ico";
import "./style.scss";

import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { CharacterStoreProvider } from "./components/CharacterStoreProvider";
import { SavedCharacterStoreProvider } from "./components/SavedCharacterStoreProvider";
import { Meta, MetaProvider } from "@solidjs/meta";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

const client = new QueryClient();

render(
    () => (
        <MetaProvider>
            <Meta property="og:image" content={`${favicon}`} />
            <Meta property="og:description" content="MedianXL Skillplanner" />
            <Meta property="og:title" content="MedianXL Skillplanner" />
            <Meta property="og:type" content="website" />
            <Meta property="og:url" content="https://gabrielleakers.github.io/medianxl_skillplanner/" />
            <QueryClientProvider client={client}>
                <CharacterStoreProvider>
                    <SavedCharacterStoreProvider>
                        <App />
                    </SavedCharacterStoreProvider>
                </CharacterStoreProvider>
            </QueryClientProvider>
        </MetaProvider>
    ),
    root!
);
