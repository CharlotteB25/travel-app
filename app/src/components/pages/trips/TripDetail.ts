import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import { defaultStyles } from "@components/style/styles";

import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/Button";

@customElement("trip-detail")
class TripDetail extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  tripContextValue?: TripContext | null;

  render() {
    const ctx = this.tripContextValue;
    if (!ctx || !ctx.trip) return html`<p>No trip data.</p>`;

    const { trip, weatherData, countdownDays, handleDelete } = ctx;

    const countdownMessage =
      countdownDays >= 0
        ? `Countdown: ${countdownDays} days until the trip starts!`
        : "The trip has already started or ended.";

    return html`
      <div class="container">
        <app-page-header>
          <app-page-title>${trip.location}</app-page-title>
          <p class="countdown-message">${countdownMessage}</p>
        </app-page-header>

        <div class="content">
          <ul class="trip-details">
            <li><strong>Title:</strong> ${trip.title}</li>
            <li><strong>Activity:</strong> ${trip.activity}</li>
            <li><strong>Expenses:</strong> ${trip.expenses}</li>
            <li><strong>Notes:</strong> ${trip.notes}</li>
            <li>
              <strong>Start:</strong> ${new Date(
                trip.startDate
              ).toLocaleDateString()}
            </li>
            <li>
              <strong>End:</strong> ${new Date(
                trip.endDate
              ).toLocaleDateString()}
            </li>
          </ul>

          <div class="weather-info">
            ${weatherData
              ? html`
                  <p>
                    <strong>Weather:</strong> ${weatherData.weather?.[0]
                      ?.description || "N/A"}
                  </p>
                  <p>
                    <strong>Temp:</strong> ${weatherData.main?.temp ?? "N/A"}°C
                  </p>
                `
              : html`<p>Weather data not available.</p>`}
          </div>
        </div>

        <app-button href="/trips/${trip._id}/edit" color="secondary"
          >Edit</app-button
        >
        <app-button @click=${handleDelete} color="tertiary">Delete</app-button>
      </div>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .countdown-message {
        color: #d80000;
        font-weight: bold;
      }

      .content {
        display: flex;
        gap: 1.5rem;
      }

      .trip-details {
        list-style: none;
        padding: 0;
        flex: 1;
        font-size: 1.2rem;
        line-height: 1.6;
      }

      .trip-details li {
        margin-bottom: 0.5rem;
      }

      .weather-info {
        padding: 1rem;
        border-radius: 8px;
        background: #f9f9f9;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    `,
  ];
}

export default TripDetail;
