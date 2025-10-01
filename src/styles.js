import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        font-family: var(--primary-font-family, 'Helvetica Neue', Arial, sans-serif);
        --card-padding: 12px;
    }
    ha-card {
        padding: var(--card-padding);
        border-radius: 10px;
        box-shadow: 0 1px 0 rgba(0,0,0,0.06);
    }
    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
    }
    .card-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .count-badge {
        background: var(--accent-color, #03a9f4);
        color: var(--count-badge-text-color, #fff);
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 1.2rem;
    }
    .input-row {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        height: 40px;
        align-items: center;
    }
    .input-row input {
        flex: 1;
        padding: 8px 10px;
        font-size: 14px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        color: var(--primary-text-color);
        background: var(--card-background-color);
        transition: box-shadow 0.12s ease, border-color 0.12s ease;
    }
    .input-row input:focus {
        outline: none;
        border-color: var(--accent-color, #03a9f4);
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
    }
    /* keyboard-only focus */
    .input-row input:focus-visible {
        outline: none;
        border-color: var(--accent-color, #03a9f4);
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
    }
    .input-row .btn {
        width: 36px;
        height: 36px;
        background: none;
        border: 1px solid transparent;
        cursor: pointer;
        padding: 0;
        color: var(--primary-text-color, #555);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: background 0.12s ease, color 0.12s ease;
    }
    .input-row .btn:hover,
    .btn:hover {
        background: rgba(0,0,0,0.04);
        color: var(--accent-color, #03a9f4);
        transform: translateY(-1px);
    }
    .item-row {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--divider-color, #f0f0f0);
        gap: 8px;
    }
    .item-summary {
        flex: 1 1 70%;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        white-space: normal;
        overflow: visible;
        user-select: text;
    }
    .item-controls {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
    }
    .btn {
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: var(--primary-text-color, #555);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
    }
    .btn[title] {
        position: relative;
    }
    .hidden {
        display: none !important;
    }
    .quantity {
        min-width: 26px;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color, #333);
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(0,0,0,0.03);
    }
    .empty-state {
        padding: 14px 0;
        font-size: 14px;
        color: var(--secondary-text-color, #888);
        text-align: center;
    }
    .item-sublabel {
        font-size: 12px;
        color: var(--secondary-text-color, #9a9a9a);
        margin-top: 4px;
    }
    .highlight {
        background-color: rgba(255, 235, 59, 0.35);
        /* padding: 0 3px; */
        border-radius: 3px;
    }

    /* small screens adjustments */
    @media (max-width: 420px) {
        .input-row { height: 44px; gap: 6px; }
        .btn, .input-row .btn { width: 40px; height: 40px; }
        .quantity { min-width: 28px; }
    }

    /* fixed-size centered spinner wrapper to avoid layout shift */
    .loading-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.2em;
        height: 1.2em;
        vertical-align: middle;
        pointer-events: none;
    }

    /* animate the inner ha-icon and svg explicitly */
    .loading-icon ha-icon,
    .loading-icon ha-icon svg,
    .loading-icon ha-icon * {
        display: block;
        width: 100%;
        height: 100%;
        transform-origin: 50% 50%;
        transform-box: fill-box;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        will-change: transform;
        animation: spin 1s linear infinite;
    }

    /* fallback: animate svg children directly if present */
    .loading-icon svg {
        animation: spin 1s linear infinite;
        transform-origin: 50% 50%;
        transform-box: fill-box;
    }

    /* smooth rotation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }

    /* make disabled buttons clearly non-interactive and remove focus ring */
    .btn[disabled] {
        opacity: 0.5;
        cursor: default;
        transform: none;
        pointer-events: none;
    }
    .btn[disabled]:focus-visible {
        outline: none;
        box-shadow: none;
    }
    /* key button can reuse .btn but override to be wider and centered */
    /* key buttons: single row that fills full width (no wrap) */
    .key-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
        margin: 8px 0 12px;
        flex-wrap: nowrap;      /* force single row */
        width: 100%;
        overflow: visible;       /* avoid scrollbar if something goes slightly over */
    }

    /* make each button share available space equally */
    .key-buttons .key-btn,
    .key-buttons button {
        flex: 1 1 0;            /* grow & shrink equally, no base width forcing wrap */
        padding: 8px 12px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 8px;
        background: rgba(0,0,0,0.03);
        border: 1px solid transparent;
        cursor: pointer;
        transition: background 0.12s ease, transform 0.08s ease, color 0.12s ease;
        box-sizing: border-box;
        min-width: 0;           /* allow shrinking below default content width */
    }

    /* hover / focus */
    .key-buttons .key-btn:hover,
    .key-buttons .key-btn:focus,
    .key-buttons button:hover,
    .key-buttons button:focus {
        background: rgba(0,0,0,0.06);
        transform: translateY(-1px);
        color: var(--accent-color, #03a9f4);
        outline: none;
        box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
        border-color: var(--accent-color, #03a9f4);
    }

    /* active state for pressed appearance */
    .key-buttons .key-btn.active {
        background: rgba(0,0,0,0.08);
        transform: translateY(1px);
        color: var(--accent-color, #03a9f4);
        border-color: var(--accent-color, #03a9f4);
    }

    /* icon centering & sizing */
    .key-buttons .key-btn ha-icon,
    .btn ha-icon {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 18px !important;
        height: 18px !important;
        line-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    /* For icon-only buttons (if any), keep a minimum tap target without stretching */
    .key-buttons .key-btn.icon-only {
        flex: 0 0 auto;
        min-width: 44px;
        padding: 8px;
    }

    .show-more {
        text-align: center;
        justify-content:center;
        display:flex; 
        margin-top:8px;
    }
    /* ensure .info acts as a row so we can place the button to the right */

    .info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--secondary-text-color, #888);
        margin-bottom: 8px;
    }

    /* keep the left text from shrinking */
    .info .info-text {
        flex: 0 0 auto;
    }

    /* wrapper to push button to the right */
    .info .show-all-wrap {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    `;