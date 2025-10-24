import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { DashboardData, User } from "@core/modules/user/User.types";
import { getTrips } from "@core/modules/trips/Trip.api";
import { Trip } from "@core/modules/trips/Trip.types";
import userContext from "@components/auth/userContext";
import { consume } from "@lit/context";
import { getCurrentUser } from "@core/modules/user/User.api";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";
import "@components/design/Button/Button";
import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Card/Card";
import "@components/design/Grid/Grid";

@customElement("app-home")
class Home extends LitElement {
  @property() isLoading: boolean = false;
  @property() trips: Array<Trip> | null = null;
  @property() error: string | null = null;
  @property() data: DashboardData | null = null;

  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  public user?: User | null;

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchUserData();
  }

  async fetchUserData() {
    this.isLoading = true;
    try {
      const userResponse = await getCurrentUser();
      this.user = userResponse.data;

      if (this.user && this.user._id) {
        const tripsResponse = await getTrips();
        const allTrips = (tripsResponse.data as Trip[]) || [];

        const today = new Date();
        this.trips = allTrips
          .filter(
            (t) => new Date(t.startDate) >= new Date(today.toDateString())
          )
          .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
      } else {
        this.error = "User data is missing or invalid";
        this.trips = null;
      }
      this.error = null;
    } catch (e) {
      this.error = "Failed to load user data or trips";
      this.user = null;
      this.trips = null;
    } finally {
      this.isLoading = false;
    }
  }

  private formatDate(d: string | Date) {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(d)
      );
    } catch {
      return "";
    }
  }

  render() {
    const { isLoading, trips, error } = this;

    // quick stats
    const upcomingCount = trips?.length ?? 0;
    const nextTrip = trips && trips[0];
    const nextWhen = nextTrip ? this.formatDate(nextTrip.startDate) : "—";
    const nextWhere = (nextTrip as any)?.destination || nextTrip?.title || "—";

    let content = html``;

    if (error) {
      content = html`<error-view class="mt-3" .error=${error}></error-view>`;
    } else if (isLoading || !trips) {
      content = html`<loading-indicator class="mt-3"></loading-indicator>`;
    } else if (trips.length === 0) {
      content = html`
        <div class="empty">
          <div>
            <h3>No upcoming trips yet</h3>
            <p class="muted">Plan something fun and we’ll keep it tidy here.</p>
            <app-button href="/trips/create" color="primary"
              >Create a trip</app-button
            >
          </div>
        </div>
      `;
    } else {
      content = html`
        <app-grid class="grid">
          ${trips.map(
            (trip) => html`
              <li>
                <app-card href="/trips/${trip._id}">
                  <div class="trip-card">
                    <h3 class="trip-title">${trip.title}</h3>
                    <p class="trip-meta">
                      ${this.formatDate(trip.startDate)} →
                      ${this.formatDate(trip.endDate)}
                    </p>
                    ${trip.location
                      ? html`<p class="trip-dest">${trip.location}</p>`
                      : null}
                  </div>
                </app-card>
              </li>
            `
          )}
        </app-grid>
      `;
    }

    return html`
      <section class="container">
        <!-- Hero -->
        <header class="hero">
          <div class="hero__text">
            <h1 class="hero__title">
              Welcome, ${this.user?.name ?? "traveler"} ✈️
            </h1>
            <p class="hero__subtitle">
              Plan, track and tweak your adventures with ease.
            </p>
          </div>
          <div class="hero__cta">
            <app-button href="/trips/create" color="primary"
              >New Trip</app-button
            >
          </div>
        </header>

        <!-- Quick stats pills -->
        <div class="toolbar">
          <div class="pill">
            <span class="pill__label">Upcoming</span>
            <span class="pill__value">${upcomingCount}</span>
          </div>
          <div class="pill">
            <span class="pill__label">Next trip</span>
            <span class="pill__value">${nextWhere}</span>
          </div>
          <div class="pill">
            <span class="pill__label">Starts</span>
            <span class="pill__value">${nextWhen}</span>
          </div>
        </div>

        <!-- List -->
        <h2 class="section-title">Upcoming trips</h2>
        ${content}
      </section>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem 1rem;
      }

      /* Hero uses 60/30/10 via tokens:
         - Background: subtle pastel tile on buttermilk
         - Accent text: old burgundy (primary)
      */
      .hero {
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .hero__title {
        color: var(--primary);
        font-weight: var(--font-weight-bold);
        font-size: clamp(1.6rem, 1.2rem + 1.5vw, 2.2rem);
        margin: 0;
      }
      .hero__subtitle {
        color: var(--text-color-muted);
        margin: 0.25rem 0 0;
      }

      .toolbar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.75rem;
        margin: 1rem 0 1.25rem;
      }
      .pill {
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: 999px;
        padding: 0.6rem 0.9rem;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
      }
      .pill__label {
        color: var(--text-color-muted);
        font-size: 0.9rem;
      }
      .pill__value {
        color: var(--primary);
        font-weight: var(--font-weight-bold);
      }

      .section-title {
        font-size: 1.25rem;
        color: var(--primary);
        margin: 0 0 0.5rem;
        padding: 5px; /* keep your defaultStyles heading padding rhythm */
      }

      .empty {
        display: grid;
        place-items: center;
        text-align: center;
        background: var(--surface);
        border: 1px dashed var(--border-color);
        border-radius: var(--border-radius);
        padding: 2rem;
        box-shadow: var(--shadow-sm);
      }
      .muted {
        color: var(--text-color-muted);
        margin: 0.25rem 0 1rem;
      }

      /* Card interior tweaks so app-card picks up tokens cleanly */
      .trip-card {
        display: grid;
        gap: 0.25rem;
      }
      .trip-title {
        margin: 0;
        color: var(--primary);
      }
      .trip-meta {
        margin: 0;
        color: var(--text-color-muted);
        font-size: 0.95rem;
      }
      .trip-dest {
        margin: 0;
        color: var(--text-color);
      }

      /* app-grid already handles responsive columns; add spacing harmony if needed */
      .grid {
        margin-top: 0.25rem;
      }

      @media (max-width: 520px) {
        .hero {
          flex-direction: column;
          align-items: flex-start;
        }
        .hero__cta {
          width: 100%;
        }
        .hero app-button,
        .hero [is="app-button"] {
          width: 100%;
        }
      }
    `,
  ];
}

export default Home;
