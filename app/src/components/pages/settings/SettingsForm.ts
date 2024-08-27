import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UserBody } from "@core/modules/user/User.types"; // Import UserBody type
import { AxiosResponse } from "axios";
import {
  defaultStyles,
  inputStyles,
  buttonStyles,
} from "@components/style/styles";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Button/Button";

@customElement("settings-form")
class SettingsForm extends LitElement {
  @property({ type: Boolean })
  isLoading: boolean = false;

  @property({ type: String })
  error: string | null = null;

  @property({ type: String })
  successMessage: string | null = null;

  @property({ type: String })
  submitLabel: string = "Save";

  @property()
  method: ((user: UserBody) => Promise<AxiosResponse<UserBody>>) | null = null;

  @property()
  data: UserBody = {
    name: "",
    email: "",
    password: "", // Add password field
  };

  handleSubmit = (event: Event) => {
    event.preventDefault();

    if (!this.method) {
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);
    const user = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string, // Get password from form
    };

    this.isLoading = true;
    this.method(user)
      .then(() => {
        this.successMessage = "Settings updated successfully!";
        this.error = null;
      })
      .catch((error) => {
        this.error = error.message || "An error occurred";
        this.successMessage = null;
      })
      .finally(() => {
        this.isLoading = false;
      });
  };

  render() {
    const {
      isLoading,
      handleSubmit,
      data,
      submitLabel,
      error,
      successMessage,
    } = this;

    return html`
      ${error ? html`<p class="error">${error}</p>` : ""}
      ${successMessage ? html`<p class="success">${successMessage}</p>` : ""}
      <form @submit=${handleSubmit}>
        <div class="form-control">
          <label class="form-control__label" for="name">Name:</label>
          <input
            class="form-control__input"
            type="text"
            name="name"
            id="name"
            .value=${data.name}
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="email">Email:</label>
          <input
            class="form-control__input"
            type="email"
            name="email"
            id="email"
            .value=${data.email}
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="password">Password:</label>
          <input
            class="form-control__input"
            type="password"
            name="password"
            id="password"
            .value=${data.password}
            ?disabled=${isLoading}
            required
          />
        </div>
        <button class="btn-primary" type="submit" ?disabled=${isLoading}>
          ${submitLabel}
        </button>
      </form>
    `;
  }

  static styles = [defaultStyles, inputStyles, buttonStyles];
}

export default SettingsForm;
