import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { router } from "@core/router";
import { defaultStyles } from "@components/style/styles";
import { createContext, provide } from "@lit/context";
import { User } from "@core/modules/user/User.types";
import { getCurrentUser } from "@core/modules/user/User.api";
import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type UserContext = {
  user: User | null;
  refresh: () => void;
};

export const userContext = createContext<UserContext | null>("user");

@customElement("settings-container")
class SettingsContainer extends LitElement {
  @property()
  isLoading: boolean = false;
  @provide({ context: userContext })
  userContext: UserContext | null = null;
  @property()
  error: string | null = null;

  @property({ type: Object }) location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.userContext = {
      user: null,
      refresh: this.fetchItem,
    };
    this.fetchItem();
  }

  // arrow function! otherwise "this" won't work in context provider
  fetchItem = () => {
    if (
      !this.location.params.id ||
      typeof this.location.params.id !== "string"
    ) {
      return;
    }

    this.isLoading = true;

    //this is to get the trip by id from the API and set the tripContext to the response to be able to use it in the child components of this container
    getCurrentUser()
      .then(({ data }) => {
        this.userContext = {
          user: data,
          refresh: this.fetchItem,
        };
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  };

  render() {
    const { isLoading, userContext, error } = this;

    if (!userContext) {
      return html``;
    }

    const { user } = userContext;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !user) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default SettingsContainer;
