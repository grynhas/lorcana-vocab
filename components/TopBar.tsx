import Link from "next/link";

type TopBarProps = {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
};

export function TopBar({ backHref, backLabel = "Voltar", eyebrow }: TopBarProps) {
  return (
    <div className="topbar">
      {backHref ? (
        <Link href={backHref} className="iconbtn" aria-label={backLabel}>
          ←
        </Link>
      ) : (
        <Link href="/" aria-label="Lorewords">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/lorewords-logo-horizontal-tema-escuro.svg" alt="Lorewords" className="hlogo" />
        </Link>
      )}
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : <span />}
      <span style={{ width: 34 }} aria-hidden="true" />
    </div>
  );
}
