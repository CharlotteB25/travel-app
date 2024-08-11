import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { createTrip } from "@core/modules/trips/Trip.api";

import "@components/shared/trips/form/TripForm";
import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";

@customElement("trip-create")
class TripCreate extends LitElement {
  render() {
    return html` <app-page-header>
        <app-page-title>add trip</app-page-title>
      </app-page-header>
      <trip-form .method=${createTrip}></trip-form>`;
  }

  static styles = [defaultStyles];
}

export default TripCreate;
