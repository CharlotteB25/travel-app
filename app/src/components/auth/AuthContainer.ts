// frontend/authcontainer

import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as Storage from "../../core/storage";
import { getCurrentUser } from "@core/modules/user/User.api";
import { API } from "@core/network/api";
import { AxiosError, AxiosResponse } from "axios";
import { Router } from "@vaadin/router";
import { defaultStyles } from "@components/style/styles";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { provide } from "@lit/context";
import userContext from "./userContext";
import { User } from "@core/modules/user/User.types";

export const logout = () => {
  Storage.saveAuthToken(null);
  Router.go("/login");
};

let interceptorsAttached = false;

@customElement("auth-container")
class AuthContainer extends LitElement {
  @provide({ context: userContext })
  user: User | null = null;

  @property() isLoading: boolean = false;
  @property() error: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    if (!interceptorsAttached) {
      API.interceptors.request.use((config) => {
        const token = Storage.getAuthToken();
        if (token) config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      });

      API.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
          // Only force-logout on 401s coming from routes that truly require auth.
          if (error.response?.status === 401) {
            // Mark user anonymous; let the container decide what to render.
            this.user = null;
            // IMPORTANT: avoid double-setting error here; treat as anon.
            // Redirect only if we’re currently on a protected page.
            // If this component ONLY wraps protected routes, redirect immediately:
            logout();
          }
          return Promise.reject(error);
        }
      );

      // Optional: keep API calls snappy
      API.defaults.timeout = 8000;

      interceptorsAttached = true;
    }

    // ⬇️ Early decision: if no token, don’t call /users/current at all.
    const token = Storage.getAuthToken();
    if (!token) {
      this.user = null;
      // If this container only wraps protected pages, route to login immediately:
      Router.go("/login");
      return; // no loading state, no blocking
    }

    // With a token: fetch user, but keep the UI responsive.
    this.isLoading = true;
    getCurrentUser()
      .then(({ data }) => {
        this.user = data;
        this.error = null;
      })
      .catch((err: AxiosError | any) => {
        // If it’s a 401, response interceptor already handled logout.
        const status = err?.response?.status;
        if (status && status !== 401) {
          this.error = err?.message ?? "Failed to load user";
        }
        // For 401, don’t set an error; we’re navigating away.
      })
      .finally(() => {
        this.isLoading = false;
        this.requestUpdate();
      });
  }

  render() {
    const { isLoading, error, user } = this;

    // Show a friendly error only for non-auth failures (e.g., 500)
    if (error) {
      return html`<error-view .error=${error} />`;
    }

    // While validating a real token, show a small non-blocking skeleton
    if (isLoading) {
      return html`<loading-indicator></loading-indicator>`;
    }

    // If user is null here, we either redirected already (no token / 401)
    // or you might want to render a login CTA if this container is reused for public pages.
    if (!user) {
      // Render nothing because Router.go('/login') already happened.
      return html``;
    }

    return html`
      <a class="skip-link" href="#main">Skip to content</a>
      <app-navigation></app-navigation>
      <main id="main" class="content">
        <div class="container">
          <slot></slot>
        </div>
      </main>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        min-height: 100dvh;
      }
      .skip-link {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
      .skip-link:focus {
        position: fixed;
        left: 1rem;
        top: 1rem;
        width: auto;
        height: auto;
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 0.5rem 0.75rem;
        box-shadow: var(--shadow-sm);
        z-index: 1100;
      }
      .content {
        padding: 1rem;
      }
      .container {
        margin: 0 auto;
        max-width: 1200px;
        background: transparent;
      }
      @media (max-width: 520px) {
        .content {
          padding: 0.75rem;
        }
      }
    `,
  ];
}

export default AuthContainer;
