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
      <div class="split">
        <div class="split__content">
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
      .split {
        display: flex;
        height: 100vh;
        width: 100vw;
        align-items: center;
      }
      .split__image {
        width: 60vw;
        height: 100vh;
        object-fit: cover;
      }
      .split__content {
        flex: 1;
        padding: 5rem 2rem;
      }
      .form-control {
        margin-top: 1rem;
      }
    `,
  ];
}

export default Login;
