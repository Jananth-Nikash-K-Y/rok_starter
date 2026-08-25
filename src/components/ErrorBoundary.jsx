import { Component } from "react";

/**
 * Nothing in this app may ever show a blank page.
 *
 * The product's core promise is that a case, once opened, survives anything
 * the user does. A crashed render that white-screens the tab would break
 * that promise at the worst possible moment — and on stage, it would end a
 * demo. So an unexpected error falls back to a readable screen that still
 * shows the case reference and still offers the 1930 helpline, which is the
 * one action that matters even when the interface has failed.
 *
 * A class component because React only supports error boundaries this way.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    /* No error-reporting SDK: one could exfiltrate case data as a side
       effect of its normal operation (see AGENTS.md). Console only. */
    console.error("[Rok] render failed", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="rok-container crash" role="alert">
        <h1 className="crash__title">{this.props.t("error.title")}</h1>
        <p className="crash__body">{this.props.t("error.body")}</p>

        <a className="rok-btn rok-btn--danger rok-btn--block" href="tel:1930">
          {this.props.t("caseComplete.call_1930")}
        </a>

        <button
          className="rok-btn rok-btn--quiet rok-btn--block"
          type="button"
          onClick={() => window.location.reload()}
        >
          {this.props.t("error.reload")}
        </button>
      </section>
    );
  }
}
