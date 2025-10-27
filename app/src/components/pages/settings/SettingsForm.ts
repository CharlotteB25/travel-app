// settings-form.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UserBody } from "@core/modules/user/User.types";
import { AxiosResponse } from "axios";
import {
  defaultStyles,
  inputStyles,
  buttonStyles,
} from "@components/style/styles";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/Button";
import "@components/design/Card/Card";

@customElement("settings-form")
class SettingsForm extends LitElement {
  @property({ type: Boolean }) isLoading = false;
  @property({ type: String }) error: string | null = null;
  @property({ type: String }) successMessage: string | null = null;
  @property({ type: String }) submitLabel = "Save";
  @property() method:
    | ((user: UserBody) => Promise<AxiosResponse<UserBody>>)
    | null = null;

  @property() data: UserBody = { name: "", email: "", password: "" };

  private handleSubmit = (event: Event) => {
    event.preventDefault();
    if (!this.method) return;
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload: UserBody = {
      name: (formData.get("name") as string)?.trim(),
      email: (formData.get("email") as string)?.trim(),
      password: (formData.get("password") as string) || "",
    };
    if (!payload.password) delete (payload as any).password;

    this.isLoading = true;
    this.method(payload)
      .then(() => {
        this.successMessage = "Settings updated successfully!";
        this.error = null;
        this.data = { ...this.data, password: "" };
      })
      .catch((err) => {
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          "An error occurred while saving your settings.";
        this.successMessage = null;
      })
      .finally(() => (this.isLoading = false));
  };

  render() {
    const { isLoading, data, submitLabel, error, successMessage } = this;

    return html`
      <section class="wrap">
        ${error
          ? html`<div class="notice notice--error" role="alert">${error}</div>`
          : null}
        ${successMessage
          ? html`<div class="notice notice--success" role="status">
              ${successMessage}
            </div>`
          : null}

        <app-card class="card">
          <form class="form" @submit=${this.handleSubmit} novalidate>
            <h3 class="card__title">Profile</h3>

            <div class="grid">
              <label class="field">
                <span class="label">Name</span>
                <input
                  class="input"
                  type="text"
                  name="name"
                  autocomplete="name"
                  .value=${data.name}
                  ?disabled=${isLoading}
                  required
                />
              </label>

              <label class="field">
                <span class="label">Email</span>
                <input
                  class="input"
                  type="email"
                  name="email"
                  autocomplete="email"
                  .value=${data.email}
                  ?disabled=${isLoading}
                  required
                />
              </label>

              <label class="field field--full">
                <span class="label">Password</span>
                <input
                  class="input"
                  type="password"
                  name="password"
                  autocomplete="new-password"
                  placeholder="Leave blank to keep current password"
                  .value=${data.password || ""}
                  ?disabled=${isLoading}
                />
                <span class="help"
                  >Leave blank if you don’t want to change it.</span
                >
              </label>
            </div>

            <div class="actions">
              <button class="btn-primary" type="submit" ?disabled=${isLoading}>
                ${isLoading ? "Saving…" : submitLabel}
              </button>
            </div>
          </form>
        </app-card>
      </section>
    `;
  }

  static styles = [
    defaultStyles,
    inputStyles,
    buttonStyles,
    css`
      :host {
        display: block;
      }

      .wrap {
        display: grid;
        gap: 1rem;
      }

      .card {
        --radius-lg: 16px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: clamp(1rem, 2vw, 1.25rem);
      }

      .card__title {
        margin: 0 0 0.75rem;
        font-size: 1.3rem;
        color: var(--primary);
      }

      .form {
        display: grid;
        gap: 1rem;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .field--full {
        grid-column: 1 / -1;
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .field--full {
          grid-column: auto;
        }
      }

      .field {
        display: grid;
        gap: 0.35rem;
      }

      .label {
        font-size: 0.95rem;
        color: var(--text-color-muted);
      }

      .input {
        background: #fff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 0.75rem 1rem;
        color: var(--text-color);
        box-shadow: var(--shadow-sm);
        transition: box-shadow 120ms ease, border-color 120ms ease;
      }
      .input:hover {
        border-color: color-mix(
          in srgb,
          var(--primary) 20%,
          var(--border-color)
        );
      }
      .input:focus-visible {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--primary) 20%, transparent);
      }

      .help {
        font-size: 0.85rem;
        color: var(--text-color-muted);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.25rem;
      }

      .notice {
        padding: 0.75rem 0.9rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        font-size: 0.95rem;
      }
      .notice--error {
        background: var(--red100);
        border-color: var(--red);
        color: var(--red);
      }
      .notice--success {
        background: color-mix(in srgb, var(--secondary) 65%, white);
        border-color: color-mix(
          in srgb,
          var(--primary) 25%,
          var(--border-color)
        );
        color: var(--primary);
      }

      .btn-primary[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `,
  ];
}

export default SettingsForm;
