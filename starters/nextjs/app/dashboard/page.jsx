export const metadata = { title: 'Reports' };

export default function Reports() {
  return (
    <section className="ac-page" data-page="reports">
      <header className="ac-page-head" data-ac="largetitle">
        <div className="ac-page-head__titles"><h1 className="ac-page-head__title">Reports</h1></div>
      </header>
      <div className="ac-card">
        <div className="ac-card__body">
          <form className="ac-form ac-stack" data-ac="form" noValidate>
            <label className="ac-label" htmlFor="mobile">Mobile</label>
            <input className="ac-input ac-ltr" id="mobile" name="mobile" data-ac-rules="required|iran-mobile" inputMode="tel" />
            <button className="ac-btn ac-btn--primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </section>
  );
}
