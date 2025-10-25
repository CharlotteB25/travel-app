import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { TripContext, tripContext } from "./TripDetailContainer";
import { defaultStyles } from "@components/style/styles";

import "@components/design/Header/PageHeader";
import "@components/design/Typography/PageTitle";
import "@components/design/Button/Button";
import "@components/design/Card/Card";

@customElement("trip-detail")
class TripDetail extends LitElement {
  @consume({ context: tripContext, subscribe: true })
  @property({ attribute: false })
  tripContextValue?: TripContext | null;

  private formatDate(d: string | Date) {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString();
  }

  private totalExpenses(
    expenses: Array<{ amount?: number; currency?: string }>,
    fallbackCurrency: string
  ) {
    const total = (expenses ?? [])
      .map((e) => (typeof e.amount === "number" ? e.amount : 0))
      .reduce((a, b) => a + b, 0);
    const currency = (expenses?.[0]?.currency ||
      fallbackCurrency ||
      "EUR") as string;
    return { total, currency };
  }

  private iconUrl(code?: string) {
    return code ? `https://openweathermap.org/img/wn/${code}@4x.png` : "";
  }

  private weatherArtTemplate(weatherData: any) {
    const icon = weatherData?.weather?.[0]?.icon;
    const src = this.iconUrl(icon);
    return html`
      <slot name="weather-illustration">
        ${src
          ? html`<img class="wx-img" src=${src} alt="Weather illustration" />`
          : html`<div class="wx-emoji">🌤️</div>`}
      </slot>
    `;
  }

  render() {
    const ctx = this.tripContextValue;
    if (!ctx || !ctx.trip) return html`<p class="muted">No trip data.</p>`;

    const { trip, weatherData, countdownDays, handleDelete } = ctx;
    const { total, currency } = this.totalExpenses(
      trip.expenses,
      trip.currency
    );

    const hasActivities = (trip.activities?.length ?? 0) > 0;
    const hasExpenses = (trip.expenses?.length ?? 0) > 0;

    const dayCount =
      Math.max(
        1,
        Math.ceil(
          (new Date(trip.endDate).getTime() -
            new Date(trip.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      ) || 1;

    const countdownChip =
      countdownDays > 0
        ? html`<span class="chip chip--accent"
            >Starts in ${countdownDays}
            day${countdownDays === 1 ? "" : "s"}</span
          >`
        : countdownDays === 0
        ? html`<span class="chip chip--accent">Starts today 🎉</span>`
        : html`<span class="chip chip--muted">Trip started</span>`;

    return html`
      <div class="wrap">
        <app-page-header>
          <div class="header">
            <div class="header__title">
              <app-page-title>${trip.title}</app-page-title>
              ${countdownChip}
            </div>
            <p class="subhead">
              <span class="place">${trip.location}</span>
              <span class="dot">•</span>
              <span class="dates"
                >${this.formatDate(trip.startDate)} →
                ${this.formatDate(trip.endDate)}</span
              >
            </p>
            ${trip.participants?.length
              ? html`
                  <div class="participants">
                    ${trip.participants.map(
                      (p) => html`<span class="pill">${p}</span>`
                    )}
                  </div>
                `
              : null}
          </div>
        </app-page-header>

        <!-- Summary strip -->
        <div class="summary">
          <div class="stat">
            <span class="stat__label">Days</span>
            <span class="stat__value">${dayCount}</span>
          </div>
          <div class="stat">
            <span class="stat__label">Budget</span>
            <span class="stat__value">${total} ${currency}</span>
          </div>
          <div class="stat">
            <span class="stat__label">People</span>
            <span class="stat__value">${trip.participants?.length ?? 0}</span>
          </div>
        </div>

        <section class="cards">
          <!-- Itinerary -->
          <app-card class="tile tile--itinerary">
            <div class="tile__head">
              <h3 class="tile__title">Itinerary</h3>
              ${hasActivities
                ? html`<a
                    class="tile__cta"
                    href="/trips/${trip._id}/edit#itinerary"
                    >Edit</a
                  >`
                : null}
            </div>

            ${hasActivities
              ? html`
                  <ul class="itinerary">
                    ${trip.activities.map(
                      (a) => html`
                        <li class="itinerary__item">
                          <div class="itinerary__bullet"></div>
                          <div class="itinerary__content">
                            <div class="itinerary__top">
                              <strong class="itinerary__title"
                                >${a.title}</strong
                              >
                              ${a.time
                                ? html`<span class="badge">${a.time}</span>`
                                : null}
                            </div>
                            ${[a.date, a.location].filter(Boolean).length
                              ? html`<div class="meta">
                                  ${[a.date, a.location]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </div>`
                              : null}
                            ${a.notes
                              ? html`<div class="notes">${a.notes}</div>`
                              : null}
                          </div>
                        </li>
                      `
                    )}
                  </ul>
                `
              : html`<div class="empty">
                  No activities yet.
                  <a href="/trips/${trip._id}/edit">Add your first stop</a>.
                </div>`}
          </app-card>

          <!-- Weather -->
          <app-card class="tile tile--weather">
            <div class="tile__head">
              <h3 class="tile__title">Weather</h3>
            </div>

            ${weatherData
              ? html`
                  <div class="weather">
                    <div class="weather__main">
                      <div class="wx-row">
                        <span class="label">Now</span>
                        <span class="value">
                          ${weatherData.main?.temp != null
                            ? Math.round(weatherData.main.temp) + "°C"
                            : "N/A"}
                        </span>
                      </div>
                      <div class="wx-row">
                        <span class="label">Conditions</span>
                        <span class="value"
                          >${weatherData.weather?.[0]?.description ||
                          "N/A"}</span
                        >
                      </div>
                      ${weatherData.main?.feels_like != null
                        ? html`
                            <div class="wx-row">
                              <span class="label">Feels like</span>
                              <span class="value"
                                >${Math.round(
                                  weatherData.main.feels_like
                                )}°C</span
                              >
                            </div>
                          `
                        : null}
                      ${weatherData.main?.humidity != null
                        ? html`
                            <div class="wx-row">
                              <span class="label">Humidity</span>
                              <span class="value"
                                >${Math.round(weatherData.main.humidity)}%</span
                              >
                            </div>
                          `
                        : null}
                      ${weatherData.wind?.speed != null
                        ? html`
                            <div class="wx-row">
                              <span class="label">Wind</span>
                              <span class="value"
                                >${Math.round(weatherData.wind.speed)} m/s</span
                              >
                            </div>
                          `
                        : null}
                    </div>
                    <div class="weather__art">
                      ${this.weatherArtTemplate(weatherData)}
                    </div>
                  </div>
                `
              : html`<div class="empty">Weather data not available.</div>`}
          </app-card>

          <!-- Budget -->
          <app-card class="tile tile--budget">
            <div class="tile__head">
              <h3 class="tile__title">Budget</h3>
              ${hasExpenses
                ? html`<a
                    class="tile__cta"
                    href="/trips/${trip._id}/edit#budget"
                    >Manage</a
                  >`
                : null}
            </div>

            ${hasExpenses
              ? html`
                  <ul class="list list--compact">
                    ${trip.expenses.map(
                      (e) => html`
                        <li class="list__item">
                          <div class="list__line">
                            <span class="list__label">${e.label}</span>
                            ${typeof e.amount === "number"
                              ? html`<span class="amount"
                                  >${e.amount}
                                  ${e.currency || trip.currency}</span
                                >`
                              : html`<span class="amount amount--muted"
                                  >—</span
                                >`}
                          </div>
                          ${[e.category, e.paidBy].filter(Boolean).length
                            ? html`<div class="meta">
                                ${[e.category, e.paidBy]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>`
                            : null}
                        </li>
                      `
                    )}
                  </ul>
                  <div class="total-row">
                    <span>Total</span>
                    <strong>${total} ${currency}</strong>
                  </div>
                `
              : html`<div class="empty">
                  No expenses yet.
                  <a href="/trips/${trip._id}/edit">Add costs</a>.
                </div>`}
          </app-card>

          <!-- Notes -->
          ${trip.notes
            ? html`
                <app-card class="tile tile--notes">
                  <div class="tile__head">
                    <h3 class="tile__title">Notes</h3>
                  </div>
                  <p class="notes-block">${trip.notes}</p>
                </app-card>
              `
            : null}

          <!-- Inspiration / Photo -->
          <app-card class="tile tile--inspo card--photo">
            <img
              src="/src/assets/images/travel-illustration.jpg"
              alt="Travel inspiration illustration"
              class="travel-img"
            />
            <div class="photo-caption">
              <h3 class="photo-title">Travel Inspiration</h3>
              <p class="photo-text">
                Adventure is out there—pack light, roam far.
              </p>
            </div>
          </app-card>

          <!-- Quick facts -->
          <app-card class="tile tile--facts">
            <div class="facts">
              <div class="fact">
                <span class="fact__label">Days</span>
                <span class="fact__value">${dayCount}</span>
              </div>
              <div class="fact">
                <span class="fact__label">Budget</span>
                <span class="fact__value">${total} ${currency}</span>
              </div>
              <div class="fact">
                <span class="fact__label">People</span>
                <span class="fact__value"
                  >${trip.participants?.length ?? 0}</span
                >
              </div>
            </div>
          </app-card>

          <!-- Actions -->
          <app-card class="tile tile--actions">
            <div class="actions">
              <app-button href="/trips/${trip._id}/edit" color="secondary"
                >Edit</app-button
              >
              <app-button @click=${handleDelete} color="tertiary"
                >Delete</app-button
              >
            </div>
          </app-card>
        </section>
      </div>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      /* --- Paler blue just for this page (doesn't touch global theme) --- */
      /* --- Paler blue and base surface --- */
      :host {
        --pastel-blue: #e7f4fa;
        --secondary: var(--pastel-blue);
        --surface: color-mix(in srgb, var(--secondary) 45%, white 55%);

        padding: 0.75rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      /* Sticky trip header area */
      app-page-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: linear-gradient(180deg, white 70%, transparent);
        backdrop-filter: blur(6px);
        margin-bottom: 0.5rem;
      }

      /* Cards grid */
      .cards {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }

      /* Named areas for ≥ 1100px */
      @media (min-width: 1100px) {
        .cards {
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-areas:
            "itinerary weather budget"
            "itinerary notes   inspo"
            "itinerary facts   actions";
          align-items: start;
        }
        .tile--itinerary {
          grid-area: itinerary;
        }
        .tile--weather {
          grid-area: weather;
        }
        .tile--budget {
          grid-area: budget;
        }
        .tile--notes {
          grid-area: notes;
        }
        .tile--inspo {
          grid-area: inspo;
        }
        .tile--facts {
          grid-area: facts;
        }
        .tile--actions {
          grid-area: actions;
        }
      }

      /* Tile styling */
      .tile {
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        background: var(--surface);
        padding: 0.75rem;
      }
      .card--photo {
        padding: 0;
        overflow: hidden;
        background: #fff;
      }

      .tile__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .tile__title {
        margin: 0;
        color: var(--primary);
        font-size: 1.02rem;
      }
      .tile__cta {
        font-size: 0.9rem;
        color: var(--primary);
        text-decoration: none;
      }

      /* Itinerary list density */
      .itinerary {
        display: grid;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .itinerary__item {
        display: grid;
        grid-template-columns: 12px 1fr;
        gap: 0.5rem;
      }
      .itinerary__bullet {
        margin-top: 0.4rem;
        width: 8px;
        height: 8px;
        border-radius: 99px;
        background: var(--primary);
      }
      .itinerary__top {
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
      }
      .badge {
        padding: 0 0.4rem;
        border-radius: 999px;
        font-size: 0.78rem;
        background: #fff7;
      }

      /* Weather tile */
      .tile--weather {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--secondary) 60%, white 40%) 0%,
          var(--surface) 100%
        );
      }
      .weather {
        display: grid;
        grid-template-columns: 1fr 200px;
        align-items: center;
        gap: 0.75rem;
      }
      @media (max-width: 720px) {
        .weather {
          grid-template-columns: 1fr;
        }
      }
      .weather__main {
        display: grid;
        gap: 0.25rem;
      }
      .weather__art {
        display: grid;
        place-items: center;
        min-height: 160px;
      }
      .wx-img {
        width: 100%;
        max-width: 180px;
        aspect-ratio: 1 / 1;
        object-fit: contain;
      }

      /* Budget list */
      .list {
        display: grid;
        gap: 0.3rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .list__item {
        padding: 0.3rem 0.2rem;
        border-bottom: 1px dashed color-mix(in srgb, var(--primary) 15%, #0000);
      }
      .list__line {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .amount--muted {
        opacity: 0.6;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        margin-top: 0.45rem;
        padding-top: 0.4rem;
        border-top: 1px solid var(--border-color);
      }

      /* Photo tile */
      .travel-img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }
      .photo-caption {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, white 70%, transparent) 0%,
          color-mix(in srgb, var(--primary) 10%, white 90%) 100%
        );
        padding: 0.6rem 0.75rem;
        text-align: center;
      }

      /* Facts mini-cards */
      .facts {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      .fact {
        background: #fff;
        border: 1px solid var(--border-color);
        border-radius: calc(var(--border-radius) - 2px);
        padding: 0.6rem;
        text-align: center;
        box-shadow: var(--shadow-xs);
      }
      .fact__label {
        display: block;
        font-size: 0.78rem;
        opacity: 0.7;
      }
      .fact__value {
        font-weight: var(--font-weight-bold);
        font-size: 1.05rem;
      }

      /* Actions */
      .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      /* Empty */
      .empty {
        padding: 0.7rem;
        font-size: 0.94rem;
        opacity: 0.9;
      }
    `,
  ];
}

export default TripDetail;
