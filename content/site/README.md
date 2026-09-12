# Jahresprogramm und Clubtexte bearbeiten

Diese Dateien werden direkt von der Website gelesen. Es ist kein React-Code nötig.

| Was ändern? | Datei | Online bearbeiten |
| --- | --- | --- |
| Jahresprogramm und nächster Termin auf der Startseite | `programme.json` | [Jahresprogramm öffnen](https://github.com/JungfrauTaechi/jungfrautaechi.github.io/edit/main/content/site/programme.json) |
| Clubportrait, ein Absatz pro Eintrag | `portrait.json` | [Portrait öffnen](https://github.com/JungfrauTaechi/jungfrautaechi.github.io/edit/main/content/site/portrait.json) |
| Vereinszwecke / Auftrag | `purposes.json` | [Vereinszwecke öffnen](https://github.com/JungfrauTaechi/jungfrautaechi.github.io/edit/main/content/site/purposes.json) |
| News und Fotoreports | `content/news/` und `content/photo-reports/` | [Anleitung](../../docs/content-admin-guide.md) |

## Einen Termin ändern

1. «Jahresprogramm öffnen» anklicken und mit dem GitHub-Konto anmelden.
2. Den bestehenden Termin suchen. Nur die Werte rechts vom Doppelpunkt ändern.
3. `startDate` und `endDate` sind Daten im Format `JJJJ-MM-TT`. `date` ist der lesbare Text, der angezeigt wird. Beide Angaben zusammen aktualisieren.
4. Unter **Commit changes** die Änderung kurz beschreiben. Einfache redaktionelle Änderungen können direkt auf `main` gespeichert werden und werden nach erfolgreicher automatischer Prüfung veröffentlicht.
5. Den grünen Durchlauf unter **Actions** abwarten und die Startseite sowie `/club` kontrollieren. Bei einer roten Prüfung ist die neue Version nicht veröffentlicht; die Fehlermeldung nennt die betroffene Datei und das Feld.

Beispiel eines Termins (beim Einfügen eines weiteren Eintrags das trennende Komma beachten):

```json
{
  "startDate": "2027-04-17",
  "endDate": "2027-04-17",
  "date": "17. April 2027",
  "title": "Clubfliegen",
  "text": "Treffpunkt und Anmeldung folgen.",
  "path": "/news/clubfliegen-2027"
}
```

`path` ist optional. Das Feld nur verwenden, wenn der verlinkte Beitrag bereits existiert; ansonsten die gesamte `path`-Zeile entfernen und das letzte Komma korrigieren. Vergangene Termine verschwinden automatisch aus der Liste der bevorstehenden Anlässe. Mehrtägige Anlässe bleiben bis zum letzten Tag sichtbar.

## Einen Absatz ändern

In `portrait.json` steht jeder Absatz zwischen doppelten Anführungszeichen. Den Text darin ersetzen; die umgebenden Anführungszeichen und Kommas stehen lassen. Für Zitate im Text am einfachsten «Schweizer Anführungszeichen» verwenden. Reine Textwerte verwenden, keine HTML-Tags.

Die Website prüft beim Build gültige Datumswerte, erforderliche Texte und interne Linkformate. Ungültige Änderungen stoppen die Veröffentlichung. Um eine Änderung zurückzunehmen, über die GitHub-Dateihistorie den vorherigen Inhalt wiederherstellen und erneut speichern.

## Weitere Seiten und grössere Änderungen

| Bereich | Aktuelle Stelle |
| --- | --- |
| Chronik | `src/data.js` → `chronology` (neue Inhalte vom Vorstand übernehmen) |
| Vorstand / Kontaktdaten | `src/data.js` → `boardMembers` |
| Sicherheit / lokale Regeln | `src/data.js` → `safetyAreas`; mit den offiziellen Informationen abstimmen |
| Seitenüberschriften und allgemeine Einleitungstexte | `src/App.jsx` → entsprechende `...Page`-Komponente |
| Menü, Darstellung, externe Datenquellen, Panorama-Flächen | Änderungen über einen eigenen Branch und Pull Request |

Die häufigen Clubänderungen sind oben ausgelagert. Für andere Seitentexte hilft die Dateizuordnung; Änderungen am Anwendungscode weiterhin zur Prüfung geben. Die Chronik 2010–2026 und die definitive Wahl der Vorstandsbilder warten auf die Angaben des Clubs.
