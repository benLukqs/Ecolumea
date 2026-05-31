import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-impressum-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="shop-card p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Impressum</p>
        <h1 class="mt-4 text-3xl font-semibold">Ecolumea GmbH</h1>
        <div class="mt-4 space-y-2 text-sm text-secondary">
          <p>Musterstraße 12</p>
          <p>12345 Berlin</p>
          <p>Deutschland</p>
          <p>Geschäftsführung: Max Mustermann</p>
          <p>Handelsregister: Amtsgericht Berlin-Charlottenburg, HRB 123456 B</p>
          <p>USt-IdNr.: DE123456789</p>
          <p>E-Mail: hallo&#64;ecolumea.de</p>
          <p>Telefon: +49 30 12345678</p>
        </div>
      </section>
    </div>
  `
})
export class ImpressumPageComponent {}

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="shop-card p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Datenschutz</p>
        <h1 class="mt-4 text-3xl font-semibold">Datenschutzerklärung</h1>
        <div class="mt-4 space-y-4 text-sm leading-6 text-secondary">
          <p>
            Diese Anwendung ist ein lokales MVP ohne produktive Datenverarbeitung. Es werden nur die Daten gespeichert, die
            für Registrierung, Bestellung und die Anzeige im Shop notwendig sind.
          </p>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary">Verantwortlicher</p>
            <p class="mt-2">
              Ecolumea GmbH, Musterstraße 12, 12345 Berlin, Deutschland.
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary">Welche Daten wir verarbeiten</p>
            <ul class="mt-2 list-disc space-y-2 pl-5">
              <li>Registrierungsdaten: E-Mail, Name, Passwort (verschluesselt gespeichert).</li>
              <li>Bestelldaten: Liefer- und Rechnungsadresse, Bestellpositionen, Zahlungsstatus (simuliert).</li>
              <li>Kontaktdaten fuer Bestellbestaetigungen (E-Mail-Adresse).</li>
            </ul>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary">Zweck der Verarbeitung</p>
            <p class="mt-2">
              Die Daten werden genutzt, um Bestellungen abzuwickeln, den Warenkorb anzuzeigen und die Admin-Funktionen im
              MVP zu demonstrieren.
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary">Speicherort und Weitergabe</p>
            <p class="mt-2">
              Alle Daten bleiben lokal in der Demo-Datenbank. Es findet keine Weitergabe an Dritte statt.
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-primary">Deine Rechte</p>
            <p class="mt-2">
              Du kannst jederzeit Auskunft, Berichtigung oder Löschung deiner Daten verlangen. Kontakt: hallo&#64;ecolumea.de
            </p>
          </div>
        </div>
      </section>
    </div>
  `
})
export class PrivacyPolicyPageComponent {}

@Component({
  selector: 'app-agb-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="shop-card p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">AGB</p>
        <h1 class="mt-4 text-3xl font-semibold">Allgemeine Geschäftsbedingungen</h1>
        <p class="mt-4 text-sm leading-6 text-secondary"> Es gelten keine Vertragsbedingungen.
        </p>
      </section>
    </div>
  `
})
export class AgbPageComponent {}

@Component({
  selector: 'app-widerruf-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="shop-card p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Widerruf</p>
        <h1 class="mt-4 text-3xl font-semibold">Widerrufsbelehrung</h1>
        <p class="mt-4 text-sm leading-6 text-secondary">
          Diese Seite ist ein rein informativer Platzhalter.
        </p>
      </section>
    </div>
  `
})
export class WiderrufPageComponent {}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <section class="shop-card p-8">
        <p class="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm uppercase tracking-[0.2em] text-primary">Kontakt</p>
        <h1 class="mt-4 text-3xl font-semibold">Kontaktmöglichkeiten</h1>
        <div class="mt-4 space-y-2 text-sm text-secondary">
          <p>Ecolumea GmbH</p>
          <p>Musterstraße 12</p>
          <p>12345 Berlin</p>
          <p>E-Mail: hallo&#64;ecolumea.de</p>
          <p>Telefon: +49 30 12345678</p>
        </div>
      </section>
    </div>
  `
})
export class ContactPageComponent {}
