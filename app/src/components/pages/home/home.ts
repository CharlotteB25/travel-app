import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { DashboardData, User } from "@core/modules/user/User.types";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";
import userContext from "@components/auth/userContext";
import { consume } from "@lit/context";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Button/Button";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Card/Card";
import "@components/design/Grid/Grid";

@customElement("app-home")
class Home extends LitElement {
  @property()
  isLoading: boolean = false;
  @property()
  trips: Array<Trip> | null = null;
  @property()
  error: string | null = null;
  @property()
  data: DashboardData | null = null;
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  public user?: User | null;

  // called when the element is first connected to the document’s DOM
  connectedCallback(): void {
    super.connectedCallback();
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading = true;
    // todo in api
    getTrips()
      .then(({ data }) => {
        this.trips = data;
        this.isLoading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.isLoading = false;
      });
  }

  render() {
    const { isLoading, trips, error } = this;

    let content = html``;
    if (error) {
      content = html`<error-view error=${error} />`;
    } else if (isLoading || !trips) {
      content = html`<loading-indicator></loading-indicator>`;
    } else if (trips.length === 0) {
      content = html`<p>Nog geen projecten</p>`;
    } else {
      content = html` <app-grid>
        ${trips.map((c) => {
          return html`<li>
            <app-card href="/projects/${c._id}">${c.title}</app-card>
          </li>`;
        })}
      </app-grid>`;
    }

    return html`
      <app-page-header>
        <app-page-title>Welcome ${this.user?.name}</app-page-title>
      </app-page-header>
      ${content}
    `;
  }

  static styles = [defaultStyles];
}

export default Home;
