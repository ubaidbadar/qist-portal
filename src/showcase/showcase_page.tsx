import ShowcaseHeader from './showcase_header';
import HeroSection from './hero_section';
import ButtonsSection from './buttons_section';
import FormControlsSection from './form_controls_section';
import NavigationSection from './navigation_section';
import StatusSection from './status_section';
import DataDisplaySection from './data_display_section';
import DateSection from './date_section';
import AccordionSection from './accordion_section';
import OverlaysSection from './overlays_section';
import ErrorBoundarySection from './error_boundary_section';

/** Live catalog of `src/ui`, served at /design-system in development only. */
export default function ShowcasePage() {
  return (
    <div className="min-h-dvh bg-canvas font-body text-ink selection:bg-accent/20">
      <ShowcaseHeader />

      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6">
        <HeroSection />
        <ButtonsSection />
        <FormControlsSection />
        <NavigationSection />
        <StatusSection />
        <DataDisplaySection />
        <DateSection />
        <AccordionSection />
        <OverlaysSection />
        <ErrorBoundarySection />
      </main>

      <footer className="mt-20 border-t border-border bg-surface py-8 text-center text-xs text-muted">
        <p>Frontend Design System &bull; Built with React 19 & Tailwind CSS</p>
      </footer>
    </div>
  );
}
