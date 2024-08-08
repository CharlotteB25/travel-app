import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  buttonStyles,
  defaultStyles,
  formStyles,
} from "@components/style/styles";
import { Router } from "@vaadin/router";
import { Trip, TripBody } from "@core/modules/trips/Trip.types";
import { AxiosResponse } from "axios";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import { getTrips } from "@core/modules/trips/Trip.api";

@customElement("trip-form")
class TripForm extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  error: string | null = null;
  @property()
  data: TripBody = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    activity: "",
    expenses: "",
    notes: "",
  };
  @property()
  trips: Array<Trip> | null = null;
  @property()
  submitLabel: String = "Toevoegen";
  @property()
  method: ((trip: TripBody) => Promise<AxiosResponse<Trip>>) | null = null;
  @property()
  onSuccess: (() => void) | null = null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchTrips();
  }

  fetchTrips() {
    getTrips()
      .then(({ data }) => {
        this.trips = data;
      })
      .catch((error) => {
        this.error = error;
      });
  }

  handleSubmit = (event: Event) => {
    if (!this.method) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const trip = {
      title: formData.get("name") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      activity: formData.get("activity") as string,
      expenses: formData.get("expenses") as string,
      notes: formData.get("notes") as string,
    };

    this.isLoading = true;

    this.method(trip)
      .then(({ data }) => {
        if (this.onSuccess) {
          this.onSuccess();
        }
        Router.go(`/trips/${data._id}`);
      })
      .catch((error) => {
        this.isLoading = false;
        this.error = error.message;
      });
  };

  render() {
    const { isLoading, error, submitLabel, handleSubmit, data } = this;

    return html` ${error ? html`<error-view error=${error} />` : ""}
      <form @submit=${handleSubmit}>
        <div class="form-control">
          <label class="form-control__label" for="name">Trip title</label>
          <input
            class="form-control__input"
            type="text"
            name="name"
            id="name"
            .value=${data.title}
            placeholder="Trip awesome"
            ?disabled=${isLoading}
            required
          />
        </div>

        <button class="btn-primary" type="submit" ?disabled=${isLoading}>
          ${submitLabel}
        </button>
      </form>`;
  }

  static styles = [defaultStyles, formStyles, buttonStyles];
}

export default TripForm;
