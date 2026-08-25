import Icon from "./Icon.jsx";

/**
 * "Read this to me."
 *
 * The single most important control for a user who cannot read the screen,
 * so it is a labelled button on every screen rather than a small icon in a
 * toolbar. Nothing ever plays on its own: audio starts only once the user
 * has pressed this, which is both the accessibility affordance and the
 * GIGW no-autoplay rule satisfied by the same control.
 */
export default function ListenButton({ onListen, speaking, t, locale }) {
  return (
    <button className="listen" type="button" onClick={onListen} lang={locale}>
      <span className="listen__icon">
        <Icon name={speaking ? "speaker" : "speaker"} size={24} />
      </span>
      <span className="listen__label">{t("app.listen")}</span>
    </button>
  );
}
