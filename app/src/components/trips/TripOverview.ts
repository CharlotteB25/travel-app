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
  @property()
  isLoading: boolean = false;
  @property()
  trips: Array<Trip> | null = null;
  @property()
  error: string | null = null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
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

    if (error) {
      return html`<error-view error=${error} />`;
    }

    if (isLoading || !trips) {
      return html`<loading-indicator></loading-indicator>`;
    }

    return html`
      <app-page-title>Trips</app-page-title>
      <ul>
        ${trips.map((trip) => {
          return html`
            <li>
              <a href="/trips/${trip._id}">${trip.title}</a>
            </li>
          `;
        })}
      </ul>
    `;
  }
}

export default TripOverview;
