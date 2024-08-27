import { css } from "lit";

export const defaultStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  * {
    margin: 0;
  }

  a {
    color: inherit;
  }

  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    overflow-wrap: break-word;
    padding: 5px;
  }

  input {
    display: block;
  }
`;

// styles we need for the button and input components since they need to be direct children of form
import { css } from "lit";

export const buttonStyles = css`
  .btn-primary,
  .btn-secondary,
  .btn-tertiary {
    display: inline-block;
    padding: 0.75rem 1rem;
    margin: 0; /* Remove margin to ensure buttons sit next to each other */
    border: none;
    border-radius: var(--border-radius);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.3s ease;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
  }

  .btn-secondary {
    background-color: var(--secondary);
    color: white;
  }

  .btn-tertiary {
    background-color: var(--tertiary);
    color: white;
  }

  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-tertiary:hover {
    opacity: 0.9;
  }
`;

// styles we need for the button and input components since they need to be direct children of form
export const formStyles = css`
  .form {
    width: 100%;
  }
  .form--inline {
    width: "100%";
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
  }
  .form-control {
    margin: 0.5rem 0 0.75rem 0;
  }
  .form-control__label {
    display: block;
    margin-bottom: 0.25rem;
  }
  .form-control__input {
    display: block;
    padding: 0.75rem 1rem;
    width: 100%;

    max-width: 36rem;

    border: none;
    border-radius: var(--border-radius);
  }
`;

export const tableStyles = css`
  table {
    width: 100%;
  }

  thead tr {
    text-align: left;
  }
`;

export const dialogStyles = css`
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog {
    background: var(--background);
    margin: 2rem auto;
    border: none;
    border-radius: var(--border-radius);
    color: var(--text-color);
    width: 90vw;
    max-width: 30rem;
  }
`;

export const inputStyles = css`
  input {
    display: block;
    padding: 0.75rem 1rem;
    width: 60%;
    max-width: 36rem;
    border: none;
    border-radius: var(--border-radius);
  }
`;
