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
    padding: 5px; /* keep your existing spacing */
  }

  input {
    display: block;
  }
`;

export const buttonStyles = css`
  .btn-primary,
  .btn-secondary,
  .btn-tertiary {
    display: inline-block;
    padding: 0.75rem 1rem;
    margin: 0;
    border: 1px solid transparent;
    border-radius: var(--border-radius);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease,
      background-color 0.15s ease, opacity 0.15s ease, border-color 0.15s ease,
      color 0.15s ease;
    min-height: 44px; /* better tap target */
    box-shadow: var(--shadow-sm);
  }

  /* 10% accent */
  .btn-primary {
    background-color: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  .btn-primary:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary) 50%, white 50%);
    outline-offset: 2px;
  }

  /* 30% surface */
  .btn-secondary {
    background-color: var(--secondary);
    color: #1e2a2e; /* readable on pastel blue */
    border-color: var(--border-color);
  }
  .btn-secondary:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* subtle/ghost—uses lighter surface */
  .btn-tertiary {
    background-color: var(--tertiary);
    color: var(--text-color);
    border-color: var(--border-color);
  }
  .btn-tertiary:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Disabled helper class (works for <a> too) */
  .is-disabled,
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const formStyles = css`
  .form {
    width: 100%;
  }
  .form--inline {
    width: 100%;
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
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--surface);
    color: var(--text-color);
    box-shadow: var(--shadow-sm);
  }
  .form-control__input:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary) 40%, white 60%);
    outline-offset: 2px;
  }
`;

export const tableStyles = css`
  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--surface);
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  thead tr {
    text-align: left;
    background: var(--surface-strong);
  }
  th,
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }
`;

export const dialogStyles = css`
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog {
    background: var(--surface);
    margin: 2rem auto;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-color);
    width: 90vw;
    max-width: 30rem;
    box-shadow: var(--shadow-lg);
  }
`;

export const inputStyles = css`
  input {
    display: block;
    padding: 0.75rem 1rem;
    width: 60%;
    max-width: 36rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--surface);
    color: var(--text-color);
    box-shadow: var(--shadow-sm);
  }
  input:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary) 40%, white 60%);
    outline-offset: 2px;
  }
`;
