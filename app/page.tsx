import Link from "next/link";
import { TopBar } from "@/components/TopBar";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <div className="page-shell" style={{ position: "relative" }}>
        <div className="glow" />
        <div className="page-content">
          <div className="home-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mark" src="/logo/lorewords-simbolo-colorido.svg" alt="" />
            <h1>
              Sua sessão de hoje
              <br />
              está pronta
            </h1>
            <p>
              Aprenda o vocabulário de inglês usado nas cartas de Disney Lorcana.
            </p>
            <div className="cta">
              <Link href="/session" className="btn btn-primary">
                Começar sessão
              </Link>
              <Link href="/advanced-session" className="btn btn-magic">
                Modo avançado
              </Link>
              <Link href="/progress" className="btn btn-ghost">
                Ver progresso
              </Link>
            </div>
          </div>
          <div className="inkstrip" aria-hidden="true">
            <span style={{ background: "var(--ink-amber)" }} />
            <span style={{ background: "var(--ink-ruby)" }} />
            <span style={{ background: "var(--ink-amethyst)" }} />
            <span style={{ background: "var(--ink-sapphire)" }} />
            <span style={{ background: "var(--ink-emerald)" }} />
            <span style={{ background: "var(--ink-steel)" }} />
          </div>
        </div>
      </div>
    </>
  );
}
