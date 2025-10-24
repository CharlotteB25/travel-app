import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";
import { createTrip } from "@core/modules/trips/Trip.api";
import { Router } from "@vaadin/router";

import "@components/design/Typography/PageTitle";
import "@components/design/Header/PageHeader";
import "@components/design/Button/Button";
import "@components/design/Card/Card";

type ActivityItem = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
};

type ExpenseItem = {
  id: string;
  label: string;
  amount?: number;
  currency?: string;
  category?: string;
  paidBy?: string;
};

@customElement("trip-create")
class TripCreate extends LitElement {
  /* ----- Form state ----- */
  @state() step = 0;
  @state() isSaving = false;
  @state() error: string | null = null;

  // Basics
  @state() title = "";
  @state() destination = "";
  @state() startDate = "";
  @state() endDate = "";
  @state() currency = "EUR";
  @state() participants = ""; // comma separated for now
  @state() apiDown = false;
  @state() suggestionLimit = 10;

  // Activities & Expenses
  @state() activities: ActivityItem[] = [];
  @state() expenses: ExpenseItem[] = [];
  @state() suggestions: Array<{ city: string; country: string }> = [];
  @state() validLocation = false;
  private locDebounce?: number;
  private locAbort?: AbortController;

  private lastQuery = "";
  private locationCache = new Map<
    string,
    Array<{ city: string; country: string }>
  >();
  private static MIN_CHARS = 3;

  private formatSuggestionLabel(s: {
    city: string;
    region?: string;
    country: string;
  }) {
    return [s.city, s.region, s.country].filter(Boolean).join(", ");
  }

  private async handleLocationInput(e: Event) {
    const target = e.target as HTMLInputElement | null;
    const q = (target?.value ?? "").trimStart();
    this.destination = q; // always a string
    this.validLocation = false;
    this.error = null;

    // Clear any pending debounce
    if (this.locDebounce) window.clearTimeout(this.locDebounce);

    // Too short -> clear suggestions, don't query
    if (q.length < TripCreate.MIN_CHARS) {
      this.suggestions = [];
      return;
    }

    // Avoid querying on trailing spaces or duplicate same query
    if (q.endsWith(" ") || q === this.lastQuery) return;
    this.lastQuery = q;

    // Single debounce -> one network call handled inside fetchCitySuggestions
    this.locDebounce = window.setTimeout(
      () => this.fetchCitySuggestions(q),
      600
    );
  }

  private selectLocation(s: { city: string; country: string }) {
    this.destination = `${s.city}, ${s.country}`;
    this.suggestions = [];
    this.validLocation = true;
    this.error = null;
  }

  private validateLocation() {
    // If a suggestion was chosen, we're good
    if (this.validLocation) return;

    // If providers are down, accept "City, Country" pattern
    if (this.apiDown) {
      const ok = /^[\p{L} .'-]+,\s*[\p{L} .'-]+$/u.test(
        this.destination.trim()
      );
      if (ok) {
        this.validLocation = true;
        this.error = null;
        return;
      }
    }

    this.error = "Please select a valid city and country from the list.";
  }

  /* ----- Helpers ----- */
  private next = () => {
    if (this.validateStep()) this.step = Math.min(this.step + 1, 3);
  };
  private back = () => {
    this.step = Math.max(this.step - 1, 0);
  };

  private validateStep(): boolean {
    this.error = null;
    if (this.step === 0) {
      if (!this.title.trim()) {
        this.error = "Please give your trip a title.";
        return false;
      }
      // ✅ Require a valid, selected destination
      if (!this.destination.trim() || !this.validLocation) {
        this.error = "Destination must be a valid city and country.";
        return false;
      }
      if (!this.startDate || !this.endDate) {
        this.error = "Please select start and end dates.";
        return false;
      }
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.error = "End date must be after start date.";
        return false;
      }
    }
    if (this.step === 2) {
      // Validate amounts are numeric if provided
      for (const e of this.expenses) {
        if (
          e.amount !== undefined &&
          e.amount !== null &&
          `${e.amount}`.trim() !== "" &&
          Number.isNaN(Number(e.amount))
        ) {
          this.error = `Expense "${
            e.label || "Untitled"
          }" has an invalid amount.`;
          return false;
        }
      }
    }
    return true;
  }

  private async fetchCitySuggestions(q: string) {
    // Cache check first
    const cacheKey = `${q}::${this.suggestionLimit}`;
    const cached = this.locationCache.get(cacheKey);
    if (cached) {
      this.suggestions = cached;
      this.apiDown = false;
      return;
    }

    this.locAbort?.abort();
    this.locAbort = new AbortController();
    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;

    // Utility: dedupe city+country+region
    const dedupe = (
      arr: Array<{ city: string; region?: string; country: string }>
    ) => {
      const seen = new Set<string>();
      return arr.filter((x) => {
        const key = `${x.city.toLowerCase()}|${(
          x.region || ""
        ).toLowerCase()}|${x.country.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    // 1) Try GeoDB (only if we have a key)
    if (apiKey) {
      try {
        const r1 = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?` +
            new URLSearchParams({
              limit: String(this.suggestionLimit), // ⬅ uses growing limit
              namePrefix: q,
              sort: "-population", // ⬅ bigger first
              // minPopulation: "1000",                  // (optional) tune noise
            }),
          {
            signal: this.locAbort.signal,
            headers: {
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );

        if (r1.status === 429 || r1.status === 403)
          throw new Error("RATE_OR_FORBIDDEN");
        if (!r1.ok) throw new Error("LOOKUP_FAILED");
        const d1 = await r1.json();

        const list = (d1?.data ?? []).map((c: any) => ({
          city: c.city,
          region: c.region, // ⬅ include region/state when present
          country: c.country,
        }));

        this.suggestions = dedupe(list);
        this.locationCache.set(cacheKey, this.suggestions);
        this.apiDown = false;
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        // fall through to fallback
      }
    }

    // 2) Fallback: maps.co (Nominatim wrapper) – no key
    try {
      const r2 = await fetch(
        `https://geocode.maps.co/search?` +
          new URLSearchParams({ q, limit: String(this.suggestionLimit) }),
        { signal: this.locAbort.signal, headers: { "Accept-Language": "en" } }
      );
      if (!r2.ok) throw new Error("FALLBACK_FAILED");
      const d2 = await r2.json();

      const parsed = (Array.isArray(d2) ? d2 : []).map((it: any) => {
        // Try to pick city/town/village; fall back to first token in display_name
        const raw = it?.display_name ?? "";
        const parts = String(raw)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const country = parts.at(-1) || "";
        const region = parts.length > 2 ? parts.at(-2) : undefined;

        // city-ish field choices
        const props = it?.address || {};
        const cityLike =
          props.city || props.town || props.village || parts[0] || "";

        return {
          city: String(cityLike),
          region: region && region !== country ? String(region) : undefined,
          country: String(country),
        };
      });

      this.suggestions = dedupe(parsed).slice(0, this.suggestionLimit);
      this.locationCache.set(cacheKey, this.suggestions);
      this.apiDown = false;
    } catch {
      this.suggestions = [];
      this.apiDown = true;
    }
  }

  private addActivity = () => {
    this.activities = [
      ...this.activities,
      {
        id: crypto.randomUUID(),
        title: "",
        date: "",
        time: "",
        location: "",
        notes: "",
      },
    ];
  };
  private removeActivity = (id: string) => {
    this.activities = this.activities.filter((a) => a.id !== id);
  };
  private updateActivity = (
    id: string,
    key: keyof ActivityItem,
    value: any
  ) => {
    this.activities = this.activities.map((a) =>
      a.id === id ? { ...a, [key]: value } : a
    );
  };

  private addExpense = () => {
    this.expenses = [
      ...this.expenses,
      {
        id: crypto.randomUUID(),
        label: "",
        amount: undefined,
        currency: this.currency,
        category: "",
        paidBy: "",
      },
    ];
  };
  private removeExpense = (id: string) => {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  };
  private updateExpense = (id: string, key: keyof ExpenseItem, value: any) => {
    this.expenses = this.expenses.map((e) =>
      e.id === id ? { ...e, [key]: value } : e
    );
  };

  private async submit() {
    if (!this.validateStep()) return;
    this.isSaving = true;
    this.error = null;

    try {
      // Build payload (keep your original shape, add structured arrays)
      const payload = {
        title: this.title.trim(),
        location: this.destination.trim() || undefined,
        startDate: this.startDate,
        endDate: this.endDate,
        currency: this.currency,
        participants: this.participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        activities: this.activities
          .filter((a) => a.title?.trim())
          .map((a) => ({
            title: a.title.trim(),
            date: a.date || undefined,
            time: a.time || undefined,
            location: a.location?.trim() || undefined,
            notes: a.notes?.trim() || undefined,
          })),
        expenses: this.expenses
          .filter((e) => e.label?.trim())
          .map((e) => ({
            label: e.label.trim(),
            amount: e.amount != null ? Number(e.amount) : undefined,
            currency: e.currency || this.currency,
            category: e.category?.trim() || undefined,
            paidBy: e.paidBy?.trim() || undefined,
          })),
      };

      await createTrip(payload as any);
      // Redirect done by router in your form or upper layer; if not, we can:
      Router.go("/trips");
    } catch (err: any) {
      this.error = err?.message ?? "Failed to create trip";
    } finally {
      this.isSaving = false;
    }
  }

  /* ----- Renders ----- */
  private renderSteps() {
    const steps = ["Basics", "Activities", "Expenses", "Review"];
    return html`
      <ol class="steps" role="list" aria-label="Create trip steps">
        ${steps.map(
          (label, i) => html`
            <li
              class="step ${this.step === i
                ? "is-current"
                : this.step > i
                ? "is-done"
                : ""}"
            >
              <span class="step__index">${i + 1}</span>
              <span class="step__label">${label}</span>
            </li>
          `
        )}
      </ol>
    `;
  }

  private renderBasics() {
    return html`
      <div class="form-grid">
        <label class="field">
          <span class="label">Trip title *</span>
          <input
            class="input"
            required
            .value=${this.title}
            @input=${(e: any) => (this.title = e.target.value)}
          />
        </label>
        <label
          class="field field--wide"
          @keydown=${(e: KeyboardEvent) => e.stopPropagation()}
        >
          <span class="label">Destination (City, Country) *</span>
          <div class="location-wrapper">
            <input
              class="input"
              type="text"
              placeholder="Start typing a city…"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              .value=${String(this.destination ?? "")}
              @input=${this.handleLocationInput}
              @blur=${this.validateLocation}
              required
              role="combobox"
              aria-autocomplete="list"
              aria-expanded=${this.suggestions.length > 0 ? "true" : "false"}
              aria-controls="dest-listbox"
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === "Escape") this.suggestions = [];
              }}
            />
            ${this.suggestions.length
              ? html`
                  <ul id="dest-listbox" class="suggestions" role="listbox">
                    ${this.suggestions.map(
                      (s, i) => html`
                        <li
                          id="dest-opt-${i}"
                          class="suggestion"
                          role="option"
                          @mousedown=${() => this.selectLocation(s)}
                        >
                          ${this.formatSuggestionLabel(s)}
                        </li>
                      `
                    )}
                    <!-- Show more row -->
                    <li class="suggestion suggestion--more">
                      <button
                        type="button"
                        class="suggestion__moreBtn"
                        @mousedown=${(ev: MouseEvent) => {
                          ev.preventDefault();
                          this.suggestionLimit += 10; // ⬅ bump limit
                          this.fetchCitySuggestions(
                            this.lastQuery || this.destination
                          );
                        }}
                      >
                        Show more results…
                      </button>
                    </li>
                  </ul>
                `
              : null}
          </div>
        </label>

        <label class="field">
          <span class="label">Start date *</span>
          <input
            class="input"
            type="date"
            required
            .value=${this.startDate}
            @input=${(e: any) => (this.startDate = e.target.value)}
          />
        </label>

        <label class="field">
          <span class="label">End date *</span>
          <input
            class="input"
            type="date"
            required
            .value=${this.endDate}
            @input=${(e: any) => (this.endDate = e.target.value)}
          />
        </label>

        <label class="field">
          <span class="label">Currency</span>
          <select
            class="input"
            .value=${this.currency}
            @change=${(e: any) => (this.currency = e.target.value)}
          >
            <option>EUR</option>
            <option>USD</option>
            <option>GBP</option>
            <option>AUD</option>
            <option>CAD</option>
          </select>
        </label>

        <label class="field field--wide">
          <span class="label">Participants (comma separated)</span>
          <input
            class="input"
            placeholder="e.g., Alice, Bob"
            .value=${this.participants}
            @input=${(e: any) => (this.participants = e.target.value)}
          />
        </label>
      </div>
    `;
  }

  private renderActivities() {
    return html`
      <div class="list-header">
        <div>
          <h3 class="subheading">Activities</h3>
          <p class="muted">
            Add stops, tours, dinners… with dates/times if you know them.
          </p>
        </div>
        <app-button color="secondary" @click=${this.addActivity}
          >Add activity</app-button
        >
      </div>

      ${this.activities.length === 0
        ? html`
            <div class="empty">No activities yet. Click “Add activity”.</div>
          `
        : html`
            <ul class="repeaters" role="list">
              ${this.activities.map(
                (a) => html`
                  <li class="repeater">
                    <div class="repeater__grid">
                      <label class="field field--wide">
                        <span class="label">Title</span>
                        <input
                          class="input"
                          .value=${a.title}
                          @input=${(e: any) =>
                            this.updateActivity(a.id, "title", e.target.value)}
                        />
                      </label>

                      <label class="field">
                        <span class="label">Date</span>
                        <input
                          class="input"
                          type="date"
                          .value=${a.date ?? ""}
                          @input=${(e: any) =>
                            this.updateActivity(a.id, "date", e.target.value)}
                        />
                      </label>

                      <label class="field">
                        <span class="label">Time</span>
                        <input
                          class="input"
                          type="time"
                          .value=${a.time ?? ""}
                          @input=${(e: any) =>
                            this.updateActivity(a.id, "time", e.target.value)}
                        />
                      </label>

                      <label class="field">
                        <span class="label">Location</span>
                        <input
                          class="input"
                          .value=${a.location ?? ""}
                          @input=${(e: any) =>
                            this.updateActivity(
                              a.id,
                              "location",
                              e.target.value
                            )}
                        />
                      </label>

                      <label class="field field--wide">
                        <span class="label">Notes</span>
                        <input
                          class="input"
                          .value=${a.notes ?? ""}
                          @input=${(e: any) =>
                            this.updateActivity(a.id, "notes", e.target.value)}
                        />
                      </label>
                    </div>

                    <button
                      class="icon-btn"
                      @click=${() => this.removeActivity(a.id)}
                      aria-label="Remove activity"
                    >
                      ✕
                    </button>
                  </li>
                `
              )}
            </ul>
          `}
    `;
  }

  private renderExpenses() {
    return html`
      <div class="list-header">
        <div>
          <h3 class="subheading">Expenses</h3>
          <p class="muted">Track trip costs. Amount is optional for now.</p>
        </div>
        <app-button color="secondary" @click=${this.addExpense}
          >Add expense</app-button
        >
      </div>

      ${this.expenses.length === 0
        ? html` <div class="empty">No expenses yet. Click “Add expense”.</div> `
        : html`
            <ul class="repeaters" role="list">
              ${this.expenses.map(
                (e) => html`
                  <li class="repeater">
                    <div class="repeater__grid">
                      <label class="field field--wide">
                        <span class="label">Label</span>
                        <input
                          class="input"
                          .value=${e.label}
                          @input=${(ev: any) =>
                            this.updateExpense(e.id, "label", ev.target.value)}
                        />
                      </label>

                      <label class="field">
                        <span class="label">Amount</span>
                        <input
                          class="input"
                          type="number"
                          min="0"
                          step="0.01"
                          .value=${e.amount ?? ""}
                          @input=${(ev: any) =>
                            this.updateExpense(e.id, "amount", ev.target.value)}
                        />
                      </label>

                      <label class="field">
                        <span class="label">Currency</span>
                        <select
                          class="input"
                          .value=${e.currency || this.currency}
                          @change=${(ev: any) =>
                            this.updateExpense(
                              e.id,
                              "currency",
                              ev.target.value
                            )}
                        >
                          <option>EUR</option>
                          <option>USD</option>
                          <option>GBP</option>
                          <option>AUD</option>
                          <option>CAD</option>
                        </select>
                      </label>

                      <label class="field">
                        <span class="label">Category</span>
                        <select
                          class="input"
                          .value=${e.category ?? ""}
                          @change=${(ev: any) =>
                            this.updateExpense(
                              e.id,
                              "category",
                              ev.target.value
                            )}
                        >
                          <option value=""></option>
                          <option value="transport">Transport</option>
                          <option value="stay">Stay</option>
                          <option value="food">Food</option>
                          <option value="activity">Activity</option>
                          <option value="misc">Misc</option>
                        </select>
                      </label>

                      <label class="field">
                        <span class="label">Paid by</span>
                        <input
                          class="input"
                          placeholder="e.g., Alice"
                          .value=${e.paidBy ?? ""}
                          @input=${(ev: any) =>
                            this.updateExpense(e.id, "paidBy", ev.target.value)}
                        />
                      </label>
                    </div>

                    <button
                      class="icon-btn"
                      @click=${() => this.removeExpense(e.id)}
                      aria-label="Remove expense"
                    >
                      ✕
                    </button>
                  </li>
                `
              )}
            </ul>
          `}
    `;
  }

  private renderReview() {
    return html`
      <div class="review">
        <div class="review__col">
          <h3 class="subheading">Basics</h3>
          <div class="kv">
            <span>Title</span><strong>${this.title || "—"}</strong>
          </div>
          <div class="kv">
            <span>Destination</span><strong>${this.destination || "—"}</strong>
          </div>
          <div class="kv">
            <span>Dates</span
            ><strong>${this.startDate || "—"} → ${this.endDate || "—"}</strong>
          </div>
          <div class="kv">
            <span>Currency</span><strong>${this.currency}</strong>
          </div>
          <div class="kv">
            <span>Participants</span
            ><strong>${this.participants || "—"}</strong>
          </div>
        </div>

        <div class="review__col">
          <h3 class="subheading">Activities (${this.activities.length})</h3>
          ${this.activities.length
            ? html`
                <ul class="plain-list">
                  ${this.activities.map(
                    (a) => html`
                      <li>
                        <strong>${a.title || "Untitled"}</strong>
                        <span class="muted">
                          ${[a.date, a.time, a.location]
                            .filter(Boolean)
                            .join(" • ") || ""}
                        </span>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`<p class="muted">—</p>`}
        </div>

        <div class="review__col">
          <h3 class="subheading">Expenses (${this.expenses.length})</h3>
          ${this.expenses.length
            ? html`
                <ul class="plain-list">
                  ${this.expenses.map(
                    (e) => html`
                      <li>
                        <strong>${e.label || "Untitled"}</strong>
                        <span class="muted">
                          ${e.amount != null
                            ? `${e.amount} ${e.currency || this.currency}`
                            : ""}
                          ${e.category ? `• ${e.category}` : ""}
                          ${e.paidBy ? `• ${e.paidBy}` : ""}
                        </span>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`<p class="muted">—</p>`}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <app-page-header>
        <app-page-title>Add a new trip!</app-page-title>
      </app-page-header>

      <section class="wizard">
        ${this.renderSteps()}
        ${this.error ? html`<div class="error">${this.error}</div>` : null}

        <app-card>
          ${this.step === 0 ? this.renderBasics() : null}
          ${this.step === 1 ? this.renderActivities() : null}
          ${this.step === 2 ? this.renderExpenses() : null}
          ${this.step === 3 ? this.renderReview() : null}
        </app-card>

        <div class="actions">
          ${this.step > 0
            ? html`<app-button color="tertiary" @click=${this.back}
                >Back</app-button
              >`
            : html`<span></span>`}
          ${this.step < 3
            ? html`<app-button color="primary" @click=${this.next}
                >Next</app-button
              >`
            : html`<app-button
                color="primary"
                @click=${this.submit}
                ?disabled=${this.isSaving}
              >
                ${this.isSaving ? "Creating…" : "Create trip"}
              </app-button>`}
        </div>
      </section>
    `;
  }

  static styles = [
    defaultStyles,
    css`
      .wizard {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 1rem 2rem;
      }
      .location-wrapper {
        position: relative;
        width: 100%;
      }

      .suggestions {
        position: absolute;
        top: calc(100% + 4px); /* sit just below the input */
        left: 0;
        right: 0;
        z-index: 20;
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-md);
        list-style: none;
        margin: 0;
        padding: 0.25rem 0;
        max-height: 240px;
        overflow-y: auto;
      }

      .suggestion {
        padding: 0.5rem 0.75rem;
        cursor: pointer;
      }

      .suggestion--more {
        border-top: 1px solid var(--border-color);
        margin-top: 0.25rem;
        padding-top: 0.25rem;
      }
      .suggestion__moreBtn {
        width: 100%;
        background: transparent;
        border: none;
        padding: 0.5rem 0.75rem;
        text-align: left;
        cursor: pointer;
        font: inherit;
      }
      .suggestion__moreBtn:hover {
        background: color-mix(in srgb, var(--primary) 8%, white);
      }

      .suggestion:hover,
      .suggestion:focus {
        background: color-mix(in srgb, var(--primary) 10%, white);
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        list-style: none;
        padding: 0;
        margin: 0 0 1rem;
      }
      .step {
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        padding: 0.5rem 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-color);
      }
      .step.is-current {
        border-color: var(--primary);
      }
      .step.is-done {
        opacity: 0.85;
      }
      .step__index {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--primary);
        color: #fff;
        font-size: 0.9rem;
      }
      .step__label {
        font-weight: var(--font-weight-bold);
        color: var(--primary);
      }

      .error {
        margin: 0 0 0.75rem;
        background: var(--red100);
        border: 1px solid var(--red);
        color: var(--red);
        border-radius: var(--border-radius);
        padding: 0.5rem 0.75rem;
      }

      /* Form */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      .field {
        display: grid;
        gap: 0.25rem;
      }
      .field--wide {
        grid-column: 1 / -1;
      }
      .label {
        font-size: 0.95rem;
        color: var(--text-color-muted);
      }
      .input {
        padding: 0.7rem 0.9rem;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        background: var(--surface);
        color: var(--text-color);
        box-shadow: var(--shadow-sm);
        width: 100%;
      }
      .input:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--primary) 40%, white 60%);
        outline-offset: 2px;
      }

      /* Repeater lists */
      .list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .subheading {
        margin: 0;
        color: var(--primary);
      }
      .muted {
        color: var(--text-color-muted);
        margin: 0.25rem 0 0;
      }

      .empty {
        background: var(--surface);
        border: 1px dashed var(--border-color);
        border-radius: var(--border-radius);
        padding: 1.25rem;
        color: var(--text-color);
      }

      .repeaters {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0;
        display: grid;
        gap: 0.75rem;
      }
      .repeater {
        position: relative;
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        padding: 0.75rem;
      }
      .repeater__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.75rem;
      }
      .icon-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        border: 1px solid var(--border-color);
        background: #fff;
        border-radius: 10px;
        width: 32px;
        height: 32px;
        cursor: pointer;
      }

      .review {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }
      .review__col {
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 0.75rem;
      }
      .kv {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        border-top: 1px dashed var(--border-color);
        padding: 0.5rem 0;
      }
      .kv:first-of-type {
        border-top: 0;
      }
      .plain-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.25rem;
      }

      .actions {
        margin-top: 0.75rem;
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
      }

      @media (max-width: 520px) {
        .steps {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ];
}

export default TripCreate;
