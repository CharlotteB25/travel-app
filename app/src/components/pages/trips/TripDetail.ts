import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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

  @state()
  weatherData: any = null; // Store the weather data

  // Method to fetch weather data
  async fetchWeather(location: string) {
    const apiKey = "39b3b8ebe1cee643912002e942701b73"; // Replace with your OpenWeatherMap API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;

    try {
      const response = await fetch(apiUrl); // Correctly define 'response' here
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error(
          `Error fetching weather data: ${response.status} ${response.statusText}`,
          errorDetails
        );
        throw new Error(`Error fetching weather data: ${response.status}`);
      }
      this.weatherData = await response.json();
      console.log("Fetched weather data:", this.weatherData); // Log the fetched weather data
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
      this.weatherData = null;
    }
  }

  // Method to handle trip deletion
  async handleDelete() {
    if (this.tripContextValue?.trip) {
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

  // Method to calculate the countdown days
  getCountdownDays(startDate: string): number {
    const tripStartDate = new Date(startDate);
    const today = new Date();
    const timeDiff = tripStartDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff;
  }

  // Lifecycle method called when the component is first updated
  firstUpdated() {
    this.retryFetchWeather(5); // Retry up to 5 times with a delay
  }

  // Retry mechanism to fetch weather data
  async retryFetchWeather(retries: number, delay: number = 500) {
    if (this.tripContextValue?.trip?.location) {
      console.log("Fetching weather for:", this.tripContextValue.trip.location);
      this.fetchWeather(this.tripContextValue.trip.location);
    } else if (retries > 0) {
      console.warn(
        `Trip location not available, retrying in ${delay}ms... (${retries} retries left)`
      );
      setTimeout(() => this.retryFetchWeather(retries - 1, delay), delay);
    } else {
      console.error(
        "No trip location found after multiple retries, skipping weather fetch."
      );
    }
  }

  render() {
    console.log("tripContextValue:", this.tripContextValue); // Check if context is available

    const { tripContextValue, weatherData } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html`<p>No trip details available.</p>`;
    }

    const { trip } = tripContextValue;

    const countdownDays = this.getCountdownDays(trip.startDate);
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
            <li><strong>Start Date:</strong> ${trip.startDate}</li>
            <li><strong>End Date:</strong> ${trip.endDate}</li>
          </ul>
          <div class="weather-info">
            ${weatherData
              ? html`
                  <p>
                    <strong>Weather in ${trip.location}:</strong>
                    ${weatherData.weather[0].description}
                  </p>
                  <p>
                    <strong>Temperature:</strong> ${weatherData.main.temp}°C
                  </p>
                `
              : html`
                  <p>Failed to load weather data. Please try again later.</p>
                `}
          </div>
        </div>
        <app-button href="/trips/${trip._id}/edit" color="secondary">
          Edit
        </app-button>
        <app-button @click="${this.handleDelete}" color="tertiary">
          ${this.submitLabel}
        </app-button>
      </div>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
        list-style-type: none;
        padding: 0;
        margin: 0;
        font-family: "Arial", sans-serif; /* New font family */
        font-size: 1.2rem; /* Slightly larger font size */
        line-height: 1.6; /* Increased line height for better readability */
        flex: 1;
      }

      .trip-details li {
        margin-bottom: 1rem;
        color: #333; /* Dark grey text */
      }

      .weather-info {
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-height: 100px;
      }
    `,
  ];
}

export default TripDetail;
