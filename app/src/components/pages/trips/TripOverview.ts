import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Button/Button";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import { defaultStyles } from "../../style/styles";

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

  async fetchItems() {
    this.isLoading = true;
    try {
      const { data } = await getTrips();
      console.log(data);
      this.trips = data;
      this.error = null;
    } catch (err) {
      this.error = "Failed to fetch trips";
      this.trips = null;
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    const { isLoading, trips, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !trips) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (trips.length === 0) {
      content = html`<p>no trips</p>`;
    } else {
      content = html`<ul>
        ${trips.map((trip) => {
          return html`
            <li>
              <a href="/trips/${trip._id}">${trip.title}</a>
            </li>
          `;
        })}
      </ul>`;
    }

    return html` <app-page-header>
        <app-page-title>Trips</app-page-title>
        <app-button href="/trips/create">Add trip</app-button>
      </app-page-header>
      ${content}`;
  }

  static styles = [defaultStyles];
}

export default TripOverview;
