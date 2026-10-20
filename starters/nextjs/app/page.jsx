import Stats from '../components/Stats';

export default function Home() {
  return (
    <section className="ac-page" data-page="dashboard">
      <header className="ac-page-head" data-ac="largetitle">
        <div className="ac-page-head__titles">
          <h1 className="ac-page-head__title">Dashboard</h1>
          <p className="ac-page-head__sub">Server-rendered markup, enhanced by data-ac attributes.</p>
        </div>
      </header>
      <Stats />
    </section>
  );
}
