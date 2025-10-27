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

  private fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  private money(currency: string) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency });
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
        <app-page-header class="page__header">
          <div class="header">
            <div class="header__title">
              <app-page-title>${trip.title}</app-page-title>
              ${countdownChip}
            </div>
            <p class="subhead">
              <span class="place">${trip.location}</span>
              <span class="dot">•</span>
              <span class="dates">
                ${this.fmt.format(new Date(trip.startDate))} →
                ${this.fmt.format(new Date(trip.endDate))}
              </span>
            </p>
            ${trip.participants?.length
              ? html`<div class="participants">
                  ${trip.participants.map(
                    (p) => html`<span class="pill">${p}</span>`
                  )}
                </div>`
              : null}
          </div>
          <!-- Actions -->
          <div class="actions">
            <app-button href="/trips/${trip._id}/edit" color="secondary"
              >Edit</app-button
            >
            <app-button @click=${handleDelete} color="tertiary"
              >Delete</app-button
            >
          </div>
        </app-page-header>

        <div class="summary summary--card">
          <div class="stat">
            <span class="stat__label">Days</span>
            <span class="stat__value">${dayCount}</span>
          </div>
          <div class="stat">
            <span class="stat__label">Budget</span>
            <span class="stat__value"
              >${this.money(currency).format(total)}</span
            >
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
                                ? html`<span class="badge badge--time"
                                    >${a.time}</span
                                  >`
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
                    <strong>${this.money(currency).format(total)}</strong>
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
        </section>
      </div>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      :host {
        display: block;
        --radius-lg: 16px;
      }

      .wrap {
        margin: 0 auto;
        display: grid;
        gap: 1rem;
      }

      /* Header */
      .page__header {
        position: sticky;
        top: 0;
        margin-bottom: 0.25rem;
        padding-bottom: 0.25rem;
      }
      .header__title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .subhead {
        margin: 0.5rem 0 0.5rem;
        color: var(--text-color-muted);
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-wrap: wrap;
      }
      .pill {
        background: var(--pastel-blue);
        border-radius: 999px;
        padding: 0.25rem 0.5rem;
        margin-right: 0.5rem;
        box-shadow: var(--shadow-xs);
      }

      /* Summary as a card */
      .summary--card {
        display: flex;
        gap: 1rem;
      }
      .stat {
        border-radius: 12px;
        box-shadow: var(--shadow-sm);
        padding: 0.6rem 0.75rem;
        gap: 0.25rem;
        text-align: center;
        flex: 1;
        background: var(--pastel-blue);
        color: #000;
      }
      .stat__label {
        font-size: 1rem;
        margin-right: 0.25rem;
      }
      .stat__value {
        font-weight: var(--font-weight-bold);
        font-size: 1.2rem;
      }

      /* Cards grid */
      .cards {
        display: flex;
        gap: 0.9rem;
        flex-wrap: wrap;
        justify-content: center;
      }
      @media (min-width: 1100px) {
        .cards {
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-areas:
            "itinerary weather budget"
            "itinerary notes   inspo"
            "itinerary facts   actions";
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

      /* Unified card look */
      .tile {
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: clamp(0.75rem, 1.6vw, 1rem);
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
        font-size: 1.05rem;
      }
      .tile__cta {
        font-size: 0.9rem;
        color: #fff;
        text-decoration: none;
        background: var(--old-burgundy);
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
      }

      /* Itinerary */
      .itinerary {
        gap: 0.6rem;
        list-style: none;
        margin: 0;
        padding: 0;
        min-width: 280px;
        display: flex;
        flex-direction: row;
      }
      .itinerary__item {
        display: flex;
        gap: 0.6rem;
      }
      .itinerary__bullet {
        margin-top: 0.45rem;
        width: 8px;
        height: 8px;
        border-radius: 99px;
        background: #000;
      }
      .itinerary__top {
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
      }
      .badge {
        padding: 0 0.45rem;
        border-radius: 999px;
        font-size: 0.78rem;
        background: var(--pastel-blue);
        flex: end;
      }
      .badge--time {
        font-variant-numeric: tabular-nums;
      }
      .meta {
        color: var(--text-color-muted);
        font-size: 0.92rem;
        padding-top: 0.15rem;
      }
      .notes {
        margin-top: 0.25rem;
      }

      /* Weather */
      .tile--weather {
      }
      .weather {
        display: grid;
        grid-template-columns: 1fr 200px;
        gap: 0.75rem;
        align-items: center;
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
        background: var(--pastel-blue);
        border-radius: 12px;
      }
      .wx-img {
        width: 100%;
        max-width: 180px;
        aspect-ratio: 1 / 1;
        object-fit: contain;
      }

      /* Budget */
      .list {
        display: grid;
        gap: 0.35rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .list__item {
        padding: 0.35rem 0.2rem;
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
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);
        font-weight: var(--font-weight-bold);
      }

      /* Facts */
      .facts {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.6rem;
      }
      .fact {
        padding: 0.65rem;
        text-align: center;
        box-shadow: var(--shadow-xs);
      }
      .fact__label {
        display: block;
        font-size: 0.85rem;
        color: var(--text-color-muted);
      }
      .fact__value {
        font-weight: var(--font-weight-bold);
        font-size: 1.1rem;
      }

      /* Actions */
      .actions {
        display: flex;
        gap: 0.6rem;
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      /* Chips / pills */
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border-radius: 999px;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        border: 1px solid var(--border-color);
        background: var(--old-burgundy);
        box-shadow: var(--shadow-xs);
      }
      .chip--accent {
        color: #fff;
      }
      .chip--muted {
        color: #fff;
      }

      .empty {
        padding: 0.7rem;
        font-size: 0.95rem;
        color: var(--text-color-muted);
      }
    `,
  ];
}

export default TripDetail;
