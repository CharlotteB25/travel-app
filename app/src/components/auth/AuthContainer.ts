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

// Guard to avoid duplicate interceptor registration in dev HMR
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
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      });

      API.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            this.user = null;
            logout();
          }
          return Promise.reject(error);
        }
      );

      interceptorsAttached = true;
    }

    // fetch user
    this.isLoading = true;
    getCurrentUser()
      .then(({ data }) => {
        this.user = data;
        this.error = null;
      })
      .catch((error) => {
        this.error = error?.message ?? "Failed to load user";
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, error, user } = this;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !user) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`
      <!-- Accessible skip link for keyboard users -->
      <a class="skip-link" href="#main">Skip to content</a>

      <!-- Top header navigation (now sticky in its own component) -->
      <app-navigation></app-navigation>

      <!-- Page content -->
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

      /* Skip link */
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

      /* Content area flows under the sticky topbar; no nested scrolling */
      .content {
        padding: 1rem;
      }

      .container {
        margin: 0 auto;
        max-width: 1200px;
        background: transparent; /* Let children (e.g., cards) set surfaces */
      }

      /* Mobile spacing niceties */
      @media (max-width: 520px) {
        .content {
          padding: 0.75rem;
        }
      }
    `,
  ];
}

export default AuthContainer;
