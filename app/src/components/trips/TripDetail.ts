import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTripById } from "@core/modules/trips/api";
import { Trip } from "@core/modules/trips/types";
import { router } from "@core/router";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

@customElement("trip-detail")
class TripDetail extends LitElement {
  @property({ type: Boolean })
  isLoading: boolean = false;

  @property({ type: Object })
  trip: Trip | null = null;

  @property({ type: String })
  error: string | null = null;

  @property({ type: Object })
  location = router.location;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    if (
      !this.location.params.id ||
      typeof this.location.params.id !== "string"
    ) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    getTripById(this.location.params.id)
      .then(({ data }) => {
        this.trip = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, trip, error } = this;

    if (error) {
      return html`<error-view .error=${error}></error-view>`;
    }

    if (isLoading || !trip) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`<h2>${trip.title}</h2>`;
  }
}

export default TripDetail;
