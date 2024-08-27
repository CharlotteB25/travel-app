import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { login } from "@core/modules/auth/Auth.api";
import * as Storage from "@core/storage";
import { Router } from "@vaadin/router";
import {
  buttonStyles,
  defaultStyles,
  formStyles,
} from "@components/style/styles";

@customElement("login-page")
class Login extends LitElement {
  @property()
  isLoading: boolean = false;

  @property()
  error: string | null = null;

  handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    this.isLoading = true;

    login({ email, password })
      .then(({ data }) => {
        this.isLoading = false;
        Storage.saveAuthToken(data.token);
        Router.go("/");
      })
      .catch((error) => {
        this.isLoading = false;

        // Handle specific error responses
        if (error.response) {
          const { status, data } = error.response;

          if (status === 401) {
            this.error = "Invalid email or password. Please try again.";
          } else if (status === 404) {
            this.error =
              "No account found with this email. Please register first.";
          } else {
            this.error =
              data.message ||
              "An error occurred during login. Please try again.";
          }
        } else {
          this.error =
            error.message || "An unexpected error occurred. Please try again.";
        }
      });
  }

  render() {
    const { isLoading, error } = this;

    return html`
      <div class="container">
        <div class="form-wrapper">
          <app-logo></app-logo>
          ${error ? html`<error-view error="${error}"></error-view>` : ""}
          <form @submit=${this.handleSubmit}>
            <div class="form-control">
              <label class="form-control__label" for="email">Email</label>
              <input
                class="form-control__input"
                type="email"
                name="email"
                id="email"
                placeholder="john.doe@mail.com"
                ?disabled=${isLoading}
                required
              />
            </div>
            <div class="form-control">
              <label class="form-control__label" for="password">Password</label>
              <input
                class="form-control__input"
                type="password"
                name="password"
                id="password"
                ?disabled=${isLoading}
                required
              />
            </div>
            <div class="form-control">
              <a href="/register">Don't have an account? Register</a>
            </div>
            <button class="btn-primary" type="submit" ?disabled=${isLoading}>
              Login
            </button>
          </form>
        </div>
      </div>
    `;
  }

  static styles = [
    defaultStyles,
    formStyles,
    buttonStyles,
    css`
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background: var(
          --background-color,
          #f0f0f0
        ); /* Optional background color */
      }

      .form-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .form-control {
        margin-top: 1rem;
        width: 100%;
      }

      .form-control__label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }

      .form-control__input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .form-control a {
        display: block;
        margin-top: 1rem;
        color: var(--primary);
        text-decoration: none;
      }

      .form-control a:hover {
        text-decoration: underline;
      }
    `,
  ];
}

export default Login;
