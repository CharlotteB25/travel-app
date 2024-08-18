import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("app-input-field")
class InputField extends LitElement {
  @property({ type: String })
  label: string = "";

  @property({ type: String })
  value: string = "";

  @property({ type: String })
  type: string = "text"; // To allow different input types like text, password, etc.

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.dispatchEvent(
      new CustomEvent("input-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-weight: bold;
      margin-bottom: 4px;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    input:focus {
      border-color: #007bff;
      outline: none;
    }
  `;

  render() {
    return html`
      <label for="input">${this.label}</label>
      <input
        id="input"
        type=${this.type}
        .value=${this.value}
        @input=${this.handleInput}
      />
    `;
  }
}

export default InputField;
