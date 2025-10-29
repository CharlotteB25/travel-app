import { logout } from "@components/auth/AuthContainer";
import { User } from "@core/modules/user/User.types";
import { consume } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { defaultStyles, buttonStyles } from "../style/styles";
import userContext from "@components/auth/userContext";
import { router } from "@core/router";

@customElement("app-navigation")
class Navigation extends LitElement {
  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  public user?: User | null;

  @property({ type: Object }) location = router.location;
  @state() private isMenuOpen = false;

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(
      "vaadin-router-location-changed",
      this.handleRouteChange
    );
    window.addEventListener("keydown", this.onKeyDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener(
      "vaadin-router-location-changed",
      this.handleRouteChange
    );
    window.removeEventListener("keydown", this.onKeyDown);
  }

  handleRouteChange = () => {
    this.location = router.location;
    // close mobile menu on route change
    this.isMenuOpen = false;
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  };

  toggleMenu = () => {
    this.isMenuOpen = !this.isMenuOpen;
  };

  handleLogout = () => {
    logout();
  };

  render() {
    const { pathname } = this.location;

    const isActive = (href: string) =>
      href === "/" ? pathname === "/" : pathname.startsWith(href);

    return html`
      <header class="topbar">
        <div class="topbar__inner">
          <!-- Left: Logo / Brand -->
          <a class="brand" href="/" aria-label="Home">
            <!-- <app-logo class="brand__logo"></app-logo> -->
            <span class="brand__text">Travel Planner</span>
          </a>

          <!-- Desktop Nav -->
          <nav class="nav" aria-label="Primary">
            <ul class="nav__list" role="list">
              <li class="nav__item nav__user" title="${this.user?.name ?? ""}">
                <span class="nav__userText"
                  >${this.user?.name ?? "Traveler"}</span
                >
              </li>
              <li class="nav__item ${isActive("/") ? "is-active" : ""}">
                <a class="nav__link" href="/">Home</a>
              </li>
              <li class="nav__item ${isActive("/trips") ? "is-active" : ""}">
                <a class="nav__link" href="/trips">Trips</a>
              </li>
              <li class="nav__item ${isActive("/settings") ? "is-active" : ""}">
                <a class="nav__link" href="/settings">Settings</a>
              </li>
              <li class="nav__item">
                <button class="btn-tertiary" @click=${this.handleLogout}>
                  Uitloggen
                </button>
              </li>
            </ul>
          </nav>

          <!-- Mobile hamburger -->
          <button
            class="hamburger"
            @click=${this.toggleMenu}
            aria-label="Toggle navigation menu"
            aria-controls="mobile-menu"
            aria-expanded=${this.isMenuOpen ? "true" : "false"}
          >
            <span class="hamburger__bar"></span>
            <span class="hamburger__bar"></span>
            <span class="hamburger__bar"></span>
          </button>
        </div>

        <!-- Mobile slide-down panel -->
        <nav
          id="mobile-menu"
          class="mobile ${this.isMenuOpen ? "mobile--open" : ""}"
          aria-label="Mobile primary"
        >
          <ul class="mobile__list" role="list">
            <li class="mobile__user">${this.user?.name ?? "Traveler"}</li>
            <li>
              <a
                class="mobile__link ${isActive("/") ? "is-active" : ""}"
                href="/"
                >Home</a
              >
            </li>
            <li>
              <a
                class="mobile__link ${isActive("/trips") ? "is-active" : ""}"
                href="/trips"
                >Trips</a
              >
            </li>
            <li>
              <a
                class="mobile__link ${isActive("/settings") ? "is-active" : ""}"
                href="/settings"
                >Settings</a
              >
            </li>
            <li>
              <button
                class="btn-tertiary mobile__logout"
                @click=${this.handleLogout}
              >
                Uitloggen
              </button>
            </li>
          </ul>
        </nav>
      </header>
    `;
  }

  static styles = [
    defaultStyles,
    buttonStyles,
    css`
      /* Header shell */
      .topbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: var(--surface);
        border-bottom: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        backdrop-filter: saturate(120%) blur(4px);
      }
      .topbar__inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.75rem 1rem;
        display: grid;
        grid-template-columns: 1fr auto auto; /* brand | nav | hamburger */
        align-items: center;
        gap: 0.5rem;
      }

      /* Brand */
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: var(--primary);
        font-weight: var(--font-weight-bold);
      }
      .brand__text {
        letter-spacing: 0.2px;
      }
      .brand__logo {
        width: 32px;
        height: 32px;
      }

      /* Desktop nav */
      .nav {
        display: block;
      }
      .nav__list {
        display: flex;
        align-items: center;
        gap: 1rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav__item {
        display: inline-flex;
        align-items: center;
      }
      .nav__userText {
        color: var(--text-color-muted);
        margin-right: 0.5rem;
      }
      .nav__link {
        text-decoration: none;
        color: var(--text-color);
        padding: 0.5rem 0.25rem;
        border-bottom: 2px solid transparent;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .nav__link:hover,
      .nav__link:focus-visible {
        color: var(--primary);
      }
      .is-active .nav__link,
      .mobile__link.is-active {
        color: var(--primary);
        border-bottom-color: var(--primary);
        font-weight: var(--font-weight-bold);
      }

      /* Hamburger (hidden on desktop) */
      .hamburger {
        --bar-h: 2px;
        --bar-w: 22px;
        justify-self: end;
        display: none;
        width: 40px;
        height: 40px;
        border: 1.5px solid var(--old-burgundy);
        border-radius: 10px;
        background: var(--surface);
        cursor: pointer;
        padding: 8px;
      }
      .hamburger:focus-visible {
        outline: 3px solid color-mix(in srgb, var(--primary) 50%, white 50%);
        outline-offset: 2px;
      }
      .hamburger__bar {
        display: block;
        width: var(--bar-w);
        height: var(--bar-h);
        background: var(--primary);
        margin: 4px auto;
        border-radius: 2px;
      }

      /* Mobile slide-down menu */
      .mobile {
        display: none;
      }
      .mobile--open {
        display: block;
        background: var(--surface);
        border-top: 1px solid var(--border-color);
        box-shadow: var(--shadow-md);
        animation: slideDown 0.18s ease;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .mobile__list {
        list-style: none;
        padding: 0.5rem 1rem 1rem;
        margin: 0;
        display: grid;
        gap: 0.25rem;
      }
      .mobile__user {
        color: var(--text-color-muted);
        padding: 0.5rem 0;
      }
      .mobile__link {
        display: block;
        text-decoration: none;
        color: var(--text-color);
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
      }
      .mobile__link:last-of-type {
        border-bottom: 0;
      }
      .mobile__logout {
        margin-top: 0.25rem;
        width: 100%;
      }

      /* Layout behavior */
      @media (max-width: 900px) {
        .nav {
          display: none;
        }
        .hamburger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .topbar__inner {
          grid-template-columns: 1fr auto;
        } /* brand | hamburger */
      }
    `,
  ];
}

export default Navigation;
