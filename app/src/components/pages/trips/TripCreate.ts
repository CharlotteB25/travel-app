import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@styles/styles";
import { createTrip } from "@core/modules/trips/api";

import "@components/shared/projects/form/ProjectForm";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";

@customElement("trip-create")
class TripCreate extends LitElement {
  render() {
    return html` <app-page-header>
        <app-page-title>Trip toevoegen</app-page-title></app-page-header
      >
      <project-form .method=${createTrip}></project-form>`;
  }

  static styles = [defaultStyles];
}

export default TripCreate;
