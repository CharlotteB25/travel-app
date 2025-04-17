import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { defaultStyles } from "@components/style/styles";

@customElement("app-page-title")
class PageSubheading extends LitElement {
  render() {
    return html`<h1><slot></slot></h1>`;
  }

  static styles = [
    defaultStyles,
    css`
      h1 {
        color: var(--primary-900);a
        font-size: 1.3rem;
        margin: 1rem 0;
      }
    `,
  ];
}

export default PageSubheading;
