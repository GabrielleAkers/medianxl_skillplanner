/* @refresh reload */
import "bootstrap/scss/bootstrap.scss";

import { render } from "solid-js/web";

import "./style.scss";

import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

const client = new QueryClient();

render(
    () => (
        <QueryClientProvider client={client}>
            <App />
        </QueryClientProvider>
    ),
    root!
);
