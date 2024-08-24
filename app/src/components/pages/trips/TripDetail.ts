import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import { deleteTrip } from "@core/modules/trips/Trip.api"; // Import the deleteTrip API function

import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/Button";

@customElement("trip-detail")
class TripDetail extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  @property()
  submitLabel: string = "Delete";
  // Method to handle trip deletion
  async handleDelete() {
    if (this.tripContextValue && this.tripContextValue.trip) {
      const { _id } = this.tripContextValue.trip;

      try {
        // Call the API to delete the trip
        await deleteTrip(_id);

        // Optionally, navigate away or update the UI after deletion
        window.location.href = "/trips"; // Redirect to trips list page
      } catch (error: any) {
        console.error("Failed to delete trip:", error);
        alert("Failed to delete trip. Please try again.");
      }
    }
  }

  render() {
    const { tripContextValue } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html``;
    }

    const { trip } = tripContextValue;

    if (!trip) {
      return html`<h1>No trip</h1>`;
    }

    return html`
      <app-page-header>
        <app-page-title>${trip.location}</app-page-title>
        <app-button href="/trips/${trip._id}/edit" color="secondary">
          Edit
        </app-button>
        <app-button @click="${this.handleDelete}" color="tertiary">
          ${this.submitLabel}
        </app-button>
      </app-page-header>
    `;
  }

  static styles = [defaultStyles];
}

export default TripDetail;
