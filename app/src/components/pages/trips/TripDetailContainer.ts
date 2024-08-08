import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTripById } from "@core/modules/trips/api";
import { Trip } from "@core/modules/trips/types";
import { router } from "@core/router";
import { defaultStyles } from "@styles/styles";
import { createContext, provide } from "@lit/context";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type TripContext = {
  trip: Trip | null;
  refresh: () => void;
};

export const tripContext = createContext<TripContext | null>("trip");

@customElement("trip-detail-container")
class TripDetailContainer extends LitElement {
  @property()
  isLoading: boolean = false;
  @provide({ context: tripContext })
  tripContext: TripContext | null = null;
  @property()
  error: string | null = null;

  @property({ type: Object }) location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.tripContext = {
      trip: null,
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
    getTripById(this.location.params.id)
      .then(({ data }) => {
        this.tripContext = {
          trip: data,
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
    const { isLoading, tripContext, error } = this;

    if (!tripContext) {
      return html``;
    }

    const { trip } = tripContext;

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !trip) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default TripDetailContainer;
