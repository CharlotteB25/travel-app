import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTrips } from "@core/modules/trips/api";
import { Trip } from "@core/modules/trips/types";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
//import "@components/design/Button/Button";
//import "@components/design/Typography/PageTitle";
//import { defaultStyles } from "@styles/styles";

@customElement("trip-overview")
class TripOverview extends LitElement {
  @property({ type: Boolean })
  isLoading: boolean = false;

  @property({ type: Array })
  trips: Array<Trip> | null = null;

  @property({ type: String })
  error: string | null = null;

  // Called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    this.error = null;
    getTrips()
      .then(({ data }) => {
        this.trips = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, trips, error } = this;

    if (isLoading || !trips) {
      return html`<loading-indicator></loading-indicator>`;
    } else if (error) {
      return html`<error-view .error=${error}></error-view>`;
    } else if (trips) {
      return html`
        <h2>Trips</h2>
        <ul>
          //fix ${trips.map((trip) => html`<li>${trip}</li>`)}
        </ul>
      `;
    }
  }
}

export default TripOverview;
