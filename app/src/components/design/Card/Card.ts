import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";

@customElement("app-card")
class Card extends LitElement {
  @property()
  href: string | null = null;

  render() {
    const { href } = this;
    if (this.href) {
      return html`<a class="card card--clickable" href=${href}
        ><slot></slot
      ></a>`;
    }
    return html`<div class="card"><slot></slot></div>`;
  }

  static styles = [
    css`
      .card {
        display: block;
        padding: 1rem 1rem;
        background-color: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        height: 100%;
        color: var(--text-color);
      }

      .card--clickable {
        text-decoration: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease,
          opacity 0.15s ease;
      }
      .card--clickable:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
        opacity: 1; /* keep text crisp */
      }
    `,
    defaultStyles,
  ];
}

export default Card;
