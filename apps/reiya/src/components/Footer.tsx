export function Footer() {
  return (
    <footer className="bg-body text-secondary p-10 text-center">
      <nav className="grid grid-flow-col justify-center gap-2">
        <a
          className="hover:text-secondary hover:underline"
          href="https://linkedin.com/company/infinity-horizons/jobs"
        >
          Careers
        </a>
        <a
          className="hover:text-secondary hover:underline"
          href="mailto:contact@shikanime.studio"
        >
          Contact
        </a>
      </nav>
      <aside className="mt-6">
        <p>
          Copyright © {new Date().getFullYear()} - Made with{" "}
          <span role="img" aria-label="heart">
            {" "}
            ❤️{" "}
          </span>{" "}
          by{" "}
          <a
            className="hover:text-secondary hover:underline"
            href="https://shikanime.studio"
          >
            Shikanime Studio
          </a>
        </p>
      </aside>
    </footer>
  );
}
