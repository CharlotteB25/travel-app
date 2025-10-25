import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { router } from "@core/router";
import { defaultStyles } from "@components/style/styles";
import { createContext, provide } from "@lit/context";
import { Trip } from "@core/modules/trips/Trip.types";
import { getTripById, deleteTrip } from "@core/modules/trips/Trip.api";
import { Router } from "@vaadin/router";

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

  private getCountdownDays(startDate: string): number {
    const tripStart = new Date(startDate);
    const today = new Date();
    return Math.ceil(
      (tripStart.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
  }

  private updateContext() {
    const countdown = this.trip
      ? this.getCountdownDays(this.trip.startDate)
      : 0;
    this.tripContext = {
      trip: this.trip,
      weatherData: this.weatherData,
      countdownDays: countdown,
      handleDelete: this.handleDelete,
      refresh: this.fetchItem,
    };
  }

  fetchItem = async () => {
    const tripId = this.location.params.id;
    if (!tripId || typeof tripId !== "string") return;

    this.isLoading = true;
    this.error = null;
    try {
      const { data } = await getTripById(tripId);
      this.trip = data;

      // Weather fetch (city only, before the comma)
      const city = (data.location || "").split(",")[0]?.trim();
      if (city) await this.fetchWeather(city);
      else this.weatherData = null;
    } catch (err: any) {
      this.error =
        err?.response?.data?.message || err?.message || "Failed to load trip";
    } finally {
      this.isLoading = false;
      this.updateContext();
    }
  };

  private async fetchWeather(city: string) {
    const apiKey = import.meta.env.VITE_WEATHER_API;
    if (!apiKey) {
      this.weatherData = null;
      return;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather error: ${response.status}`);
      this.weatherData = await response.json();
    } catch (err) {
      console.error("Weather fetch failed:", err);
      this.weatherData = null;
    }
  }

  handleDelete = async () => {
    if (!this.trip) return;
    const ok = window.confirm("Delete this trip? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteTrip(this.trip._id);
      Router.go("/trips");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete trip. Please try again.");
    }
  };

  render() {
    if (this.error) return html`<error-view .error=${this.error} />`;
    if (this.isLoading || !this.trip) return html`<loading-indicator />`;
    // This expects you to render <trip-detail> inside the container in your route/view:
    // <trip-detail-container><trip-detail/></trip-detail-container>
    return html`<slot></slot>`;
  }

  static styles = [defaultStyles];
}

export default TripDetailContainer;
