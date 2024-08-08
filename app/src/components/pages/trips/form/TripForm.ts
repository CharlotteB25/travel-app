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
    description: "",
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
    const trip = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      activity: formData.get("activity") as string,
      expenses: formData.get("expenses") as string,
      notes: formData.get("notes") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    this.isLoading = true;
    this.method(trip)
      .then(({ data }) => {
        Router.go(`/trips/${data._id}`);
      })
      .catch((error) => {
        this.error = error;
      });
  };

  render() {
    const { isLoading, handleSubmit, data, submitLabel, error } = this;

    return html`
      ${error ? html`<error-view error=${error} />` : ""}
      <form @submit=${handleSubmit}>
        <h3>Algemeen</h3>
        <div class="form-control">
          <label class="form-control__label" for="destination"
            >Bestemming</label
          >
          <input
            class="form-control__input"
            type="text"
            destination="destination"
            id="destination"
            .value=${data.location}
            placeholder="New York"
            ?disabled=${isLoading}
            required
          />
        </div>
        <h3>Contact persoon</h3>
        <div class="form-control">
          <label class="form-control__label" for="country">Voornaam</label>
          <input
            class="form-control__input"
            type="text"
            name="country"
            id="country"
            .value=${data.title}
            placeholder="America"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="startDate">Achternaam</label>
          <input
            class="form-control__input"
            type="text"
            name="startDate"
            id="startDate"
            .value=${data.startDate}
            placeholder="2023-05-17"
            ?disabled=${isLoading}
            required
          />
        </div>
        <div class="form-control">
          <label class="form-control__label" for="endDate">Email</label>
          <input
            class="form-control__input"
            type="text"
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
