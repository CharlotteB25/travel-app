import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { router } from "@core/router";
import { defaultStyles } from "@components/style/styles";
import { createContext, provide } from "@lit/context";
import { Trip } from "@core/modules/trips/Trip.types";
import { getTripById, deleteTrip } from "@core/modules/trips/Trip.api";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type TripContext = {
  trip: Trip | null;
  weatherData: any;
  countdownDays: number;
  handleDelete: () => void;
  refresh: () => void;
};

export const tripContext = createContext<TripContext | null>("trip");

@customElement("trip-detail-container")
class TripDetailContainer extends LitElement {
  @property({ type: Object }) location = router.location;
  @provide({ context: tripContext }) tripContext: TripContext | null = null;

  @state() isLoading = false;
  @state() error: string | null = null;
  @state() private weatherData: any = null;
  @state() private trip: Trip | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItem();
  }

  fetchItem = async () => {
    const tripId = this.location.params.id;
    if (!tripId || typeof tripId !== "string") return;

    this.isLoading = true;
    try {
      const { data } = await getTripById(tripId);
      this.trip = data;
      this.fetchWeather(data.location);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
      this.updateContext();
    }
  };

  updateContext() {
    const countdown = this.trip
      ? this.getCountdownDays(this.trip.startDate.toISOString())
      : 0;

    this.tripContext = {
      trip: this.trip,
      weatherData: this.weatherData,
      countdownDays: countdown,
      handleDelete: this.handleDelete,
      refresh: this.fetchItem,
    };
  }

  async fetchWeather(location: string) {
    const apiKey = import.meta.env.VITE_WEATHER_API;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      this.weatherData = await response.json();
    } catch (err) {
      console.error("Weather fetch failed:", err);
      this.weatherData = null;
    } finally {
      this.updateContext();
    }
  }

  async handleDelete() {
    if (!this.trip) return;
    try {
      await deleteTrip(this.trip._id);
      window.location.href = "/trips";
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete trip. Please try again.");
    }
  }

  getCountdownDays(startDate: string): number {
    const tripStart = new Date(startDate);
    const today = new Date();
    return Math.ceil(
      (tripStart.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
  }

  render() {
    if (this.error) return html`<error-view error=${this.error} />`;
    if (this.isLoading || !this.trip) return html`<loading-indicator />`;
    return html`<slot />`;
  }

  static styles = [defaultStyles];
}

export default TripDetailContainer;
