import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { UserBody } from "@core/modules/user/User.types";
import { getCurrentUser, updateUser } from "@core/modules/user/User.api"; // Import the necessary API methods

import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";
import "./SettingsForm"; // Import the form component

@customElement("settings-page")
class SettingsPage extends LitElement {
  @property({ type: Object })
  user: UserBody | null = null;

  @property({ type: Boolean })
  isLoading: boolean = false;

  @property({ type: String })
  error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.fetchUserData();
  }

  async fetchUserData() {
    this.isLoading = true;
    try {
      const response = await getCurrentUser(); // Fetch the current user data
      this.user = response.data;
      this.error = null;
    } catch (error) {
      this.error = "Failed to load user data";
      this.user = null;
    } finally {
      this.isLoading = false;
    }
  }

  handleSuccess = () => {
    this.fetchUserData(); // Refresh user data after a successful update
  };

  render() {
    const { user, isLoading, error } = this;

    if (isLoading) {
      return html`<p>Loading...</p>`;
    }

    if (error) {
      return html`<p>${error}</p>`;
    }

    if (!user) {
      return html`<p>No user data available</p>`;
    }

    return html`
      <app-page-header>
        <app-page-title>Settings</app-page-title>
      </app-page-header>
      <settings-form
        submitLabel="Save"
        .onSuccess=${this.handleSuccess}
        .data=${user}
        .method=${(body: UserBody) => updateUser(user.name, body)}
      ></settings-form>
    `;
  }

  static styles = [defaultStyles];
}

export default SettingsPage;
