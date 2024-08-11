import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import { TripBody } from "@core/modules/trips/Trip.types";
import { updateTrip } from "@core/modules/trips/Trip.api";

import "@components/shared/trips/form/TripForm";
import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";

@customElement("clitripent-edit")
class TripEdit extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  public tripContextValue?: TripContext | null;

  handleSuccess = () => {
    const { tripContextValue } = this;
    if (tripContextValue) {
      tripContextValue.refresh();
    }
  };

  render() {
    const { tripContextValue } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html``;
    }

    const { trip } = tripContextValue;

    if (!trip) {
      return html``;
    }

    return html` <app-page-header>
        <app-page-title>edit trip</app-page-title>
      </app-page-header>
      <trip-form
        submitLabel="edit"
        .onSuccess=${this.handleSuccess}
        .data=${trip}
        .method=${(body: TripBody) => updateTrip(trip._id, body)}
      ></trip-form>`;
  }

  static styles = [defaultStyles];
}

export default TripEdit;
