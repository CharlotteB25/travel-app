import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateTrip } from "@core/modules/trips/api";
import { TripBody } from "@core/modules/trips/types";
import { defaultStyles } from "@styles/styles";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";

import "@components/shared/projects/form/ProjectForm";
import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";

@customElement("trip-edit")
class ProjectEdit extends LitElement {
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
    const { tripContextValue, handleSuccess } = this;

    if (!tripContextValue || !tripContextValue.trip) {
      return html``;
    }

    const { trip } = tripContextValue;

    return html` <app-page-header>
        <app-page-title>trip aanpassen</app-page-title>
      </app-page-header>
      <project-form
        submitLabel="Aanpassen"
        .data=${trip}
        .onSuccess=${handleSuccess}
        .method=${(body: TripBody) => updateTrip(trip._id, body)}
      ></project-form>`;
  }

  static styles = [defaultStyles];
}

export default ProjectEdit;
