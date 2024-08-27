import { LitElement, css, html } from "lit";

import { customElement, property } from "lit/decorators.js";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { register } from "@core/modules/auth/Auth.api";
import * as Storage from "@core/storage";
import { Router } from "@vaadin/router";
import {
  buttonStyles,
  defaultStyles,
  formStyles,
} from "@components/style/styles";

@customElement("register-page")
class Register extends LitElement {
  @property()
  isLoading: boolean = false;

  @property()
  error: string | null = null;

  async handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    this.isLoading = true;

    try {
      const { data } = await register({ email, password, name });
      this.isLoading = false;
      Storage.saveAuthToken(data.token);
      Router.go("/");
    } catch (error: any) {
      this.isLoading = false;
      this.error = error.message;
    }
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
              <label class="form-control__label" for="name">Name</label>
              <input
                class="form-control__input"
                type="text"
                name="name"
                id="name"
                placeholder="John Doe"
                ?disabled=${isLoading}
                required
              />
            </div>
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
            <button class="btn-primary" type="submit" ?disabled=${isLoading}>
              Register
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
        justify-content: center; /* Center content horizontally */
      }

      .split__image {
        width: 60vw;
        height: 100vh;
        object-fit: cover;
        position: absolute; /* Ensure the image is positioned behind content */
        top: 0;
        left: 0;
        z-index: -1; /* Send image to background */
      }

      .split__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5rem 2rem;
        background: rgba(
          255,
          255,
          255,
          0.8
        ); /* Optional: add background color with opacity for better readability */
        border-radius: 8px; /* Optional: add border-radius */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: add shadow */
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

export default Register;
