import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Button/Button";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import { defaultStyles } from "@components/style/styles";

@customElement("trip-overview")
class TripOverview extends LitElement {
  @property()
  isLoading: boolean = false;
  @property({ type: Array })
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

    if (!Array.isArray(trips)) {
      return html`<p>Something went wrong</p>`;
    }

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !trips) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (trips.length === 0) {
      content = html`<p>no trips yet</p>`;
    } else {
      content = html`<ul>
        ${trips.map((c) => {
          return html`
            <li>
              <a href="/trips/${c._id}">${c.location}</a>
            </li>
          `;
        })}
      </ul>`;
    }

    return html` <app-page-header>
        <app-page-title>Trips</app-page-title>
        <app-button href="/trip/create">Add Trip</app-button>
      </app-page-header>
      ${content}`;
  }

  static styles = [defaultStyles];
}

export default TripOverview;
