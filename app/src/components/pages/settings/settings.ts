// settings-page.ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { UserBody, User } from "@core/modules/user/User.types";
import { getCurrentUser, updateUser } from "@core/modules/user/User.api";
import { consume } from "@lit/context";
import { UserContext, userContext } from "./settingsContainer";
import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";
import "./SettingsForm";

@customElement("settings-page")
class SettingsPage extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  public userContextValue?: UserContext | null;

  @property({ type: Object }) user: User | null = null;
  @property({ type: Boolean }) isLoading = false;
  @property({ type: String }) error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.fetchUserData();
  }

  async fetchUserData() {
    this.isLoading = true;
    try {
      const response = await getCurrentUser();
      this.user = response.data;
      this.error = null;
    } catch {
      this.error = "Failed to load user data";
      this.user = null;
    } finally {
      this.isLoading = false;
    }
  }

  private handleSuccess = () => this.fetchUserData();

  render() {
    if (this.isLoading) return html`<p class="muted center-msg">Loading…</p>`;
    if (this.error)
      return html`<p class="error-msg center-msg">${this.error}</p>`;
    if (!this.user)
      return html`<p class="muted center-msg">No user data available.</p>`;

    return html`
      <section class="page">
        <app-page-header class="page__header">
          <app-page-title>Settings</app-page-title>
        </app-page-header>

        <!-- Centered viewport area -->
        <div class="page__center">
          <div class="page__center-inner">
            <settings-form
              submitLabel="Save"
              .onSuccess=${this.handleSuccess}
              .data=${this.user}
              .method=${(body: UserBody) => updateUser(this.user!._id, body)}
            ></settings-form>
          </div>
        </div>
      </section>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      :host {
        display: block;
      }

      .page {
        min-height: 100svh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .page__header {
        padding-inline: clamp(1rem, 2vw, 2rem);
      }
      .page__center {
        display: flex;
        justify-content: center;
        padding: clamp(1rem, 2vw, 2rem);
      }
      .page__center-inner {
        width: min(720px, 100%);
      }

      .center-msg {
        text-align: center;
        padding: 2rem;
      }

      .error-msg {
        color: var(--red);
      }
    `,
  ];
}

export default SettingsPage;
