import { Trip, TripBody } from "@core/modules/trips/Trip.types";
import {
  buttonStyles,
  defaultStyles,
  inputStyles,
} from "@components/style/styles";
import { Router } from "@vaadin/router";
import { AxiosResponse } from "axios";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("trip-form")
class TripForm extends LitElement {
  @property()
  isLoading: boolean = false;

  @property()
  error: string | null = null;

  @property()
  submitLabel: string = "Add";

  @property()
  method: ((trip: TripBody) => Promise<AxiosResponse<Trip>>) | null = null;

  @property()
  data: TripBody = {
    title: "",
    location: "",
    activity: "",
    expenses: "",
    notes: "",
    startDate: "",
    endDate: "",
  };

  handleSubmit = (event: Event) => {
    event.preventDefault();

    if (!this.method) {
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);

    const trip: TripBody = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      activity: formData.get("activity") as string,
      expenses: formData.get("expenses") as string,
      notes: formData.get("notes") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    console.log("Submitting trip data:", trip); // Debug log

    this.isLoading = true;
    this.method(trip)
      .then(({ data }) => {
        Router.go(`/trips/${data._id}`);
      })
      .catch((error) => {
        this.error = error.message || "An error occurred";
        console.error("Error creating trip:", error); // Debug log
      })
      .finally(() => {
        this.isLoading = false;
      });
  };

  render() {
    const { isLoading, handleSubmit, data, submitLabel, error } = this;

    return html`
      ${error ? html`<error-view .error=${error}></error-view>` : ""}
      <form @submit=${handleSubmit}>
        <h3>Information:</h3>
        <div class="form-control">
          <label class="form-control__label" for="title">Title:</label>
          <input
            class="form-control__input"
            type="text"
            name="title"
            id="title"
            .value=${data.title}
            placeholder="Title"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="location">Location</label>
          <input
            class="form-control__input"
            type="text"
            name="location"
            id="location"
            .value=${data.location}
            placeholder="New York"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="activity">Activities:</label>
          <input
            class="form-control__input"
            type="text"
            name="activity"
            id="activity"
            .value=${data.activity}
            placeholder="Activities"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="expenses">Expenses:</label>
          <input
            class="form-control__input"
            type="text"
            name="expenses"
            id="expenses"
            .value=${data.expenses}
            placeholder="Expenses"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="notes">Notes:</label>
          <input
            class="form-control__input"
            type="text"
            name="notes"
            id="notes"
            .value=${data.notes}
            placeholder="Notes"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="startDate">Start Date:</label>
          <input
            class="form-control__input"
            type="date"
            name="startDate"
            id="startDate"
            .value=${data.startDate}
            placeholder="2023-05-17"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="endDate">End Date:</label>
          <input
            class="form-control__input"
            type="date"
            name="endDate"
            id="endDate"
            .value=${data.endDate}
            placeholder="2023-05-28"
            ?disabled=${isLoading}
            required
          />
        </div>
        <button class="btn-primary" type="submit" ?disabled=${isLoading}>
          ${submitLabel}
        </button>
      </form>
    `;
  }

  static styles = [defaultStyles, inputStyles, buttonStyles];
}

export default TripForm;
