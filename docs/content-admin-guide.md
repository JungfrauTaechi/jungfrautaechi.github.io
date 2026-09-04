# News und Fotoreports verwalten

Die Website erzeugt alle News- und Fotoseiten aus einfachen Markdown-Dateien. Club-Admins müssen keine React-Komponenten und insbesondere nicht `src/App.jsx` bearbeiten.

## Welcher Veröffentlichungsweg?

Einfache neue News und Fotoreports werden direkt auf dem Produktions-Branch `main` gespeichert. Jeder Commit auf `main` löst automatisch die Prüfung, den Build und anschliessend die Veröffentlichung der Website aus.

Der direkte Weg ist gedacht für:

- einen neuen Newsbeitrag;
- einen neuen Fotoreport;
- Textkorrekturen in einem bestehenden Beitrag;
- das Ergänzen oder Austauschen von Bildern eines Beitrags.

Für Änderungen an Navigation, Seitengestaltung, Komponenten, Konfiguration oder mehreren Inhaltsbereichen weiterhin einen eigenen Branch und einen Pull Request verwenden. Dasselbe gilt, wenn eine zweite Person die Änderung vor der Veröffentlichung prüfen soll.

Voraussetzung für den direkten Weg ist Schreibzugriff auf das Repository und die Berechtigung, direkt auf `main` zu speichern. Falls GitHub nur das Erstellen eines neuen Branches anbietet, die Änderung dort speichern und per Pull Request nach `main` zusammenführen.

## Direkt auf Produktion veröffentlichen

### 1. Slug festlegen

Der Slug ist der dauerhafte Teil der URL. Er besteht nur aus Kleinbuchstaben, Zahlen und Bindestrichen, zum Beispiel `clubausflug-bassano-2026`. Derselbe Slug wird für die Markdown-Datei und den Bilderordner verwendet.

| Inhalt | Markdown-Datei | Bilderordner | Öffentliche URL |
| --- | --- | --- | --- |
| News | `content/news/<slug>.md` | `public/media/news/<slug>/` | `/news/<slug>` |
| Fotoreport | `content/photo-reports/<slug>.md` | `public/media/photos/<slug>/` | `/fotos/<slug>` |

### 2. Bilder vorbereiten und hochladen

1. Auf dem eigenen Computer einen Ordner mit dem gewählten Slug erstellen, zum Beispiel `clubausflug-bassano-2026`.
2. Alle Bilder dieses Beitrags in den Ordner legen und verständlich benennen, zum Beispiel `titelbild.jpg`, `start-first.jpg` und `gruppe-landecup.webp`.
3. Im GitHub-Repository oben links sicherstellen, dass der Branch `main` ausgewählt ist.
4. Für News den Ordner `public/media/news/`, für Fotoreports den Ordner `public/media/photos/` öffnen.
5. **Add file → Upload files** wählen.
6. Den vollständigen lokalen Slug-Ordner in das Upload-Feld ziehen. Dadurch entsteht beispielsweise `public/media/news/clubausflug-bassano-2026/`. Falls der Slug-Ordner auf GitHub bereits existiert, kann er stattdessen zuerst geöffnet und dann können über **choose your files** einzelne Bilder darin ergänzt werden.
7. Unter **Commit changes** eine kurze Nachricht wie `Bilder für Clubausflug 2026 hochladen` eintragen, **Commit directly to the `main` branch** wählen und bestätigen.

Vor dem Upload beachten:

- JPEG oder WebP verwenden; ungefähr 1600–2000 Pixel an der langen Kante reichen normalerweise aus.
- Bilder für schnelles Laden möglichst auf etwa 1–2 MB pro Datei verkleinern. GitHub akzeptiert im Browser höchstens 25 MB pro Datei.
- Nur Kleinbuchstaben, Zahlen und Bindestriche in Dateinamen verwenden; keine Leerzeichen, Umlaute oder Sonderzeichen.
- Keine zwei Dateien mit demselben Namen hochladen.
- Das stärkste Bild als Titelbild wählen und eindeutig benennen, zum Beispiel `titelbild.jpg`.

### 3. Markdown-Datei anlegen

1. Die passende Vorlage öffnen: `content/templates/news.md` oder `content/templates/photo-report.md`.
2. Den gesamten Inhalt der Vorlage kopieren.
3. Zum Zielordner `content/news/` beziehungsweise `content/photo-reports/` wechseln.
4. **Add file → Create new file** wählen.
5. Als Dateinamen `<slug>.md` eintragen, zum Beispiel `clubausflug-bassano-2026.md`, und die kopierte Vorlage in das Textfeld einfügen.
6. `slug`, `title`, `date` und die übrigen Felder anpassen. Die Bildpfade müssen mit `/media/` beginnen und exakt zu den hochgeladenen Ordner- und Dateinamen passen.
7. Bei jedem Eintrag in `gallery` einen kurzen, aussagekräftigen `alt`-Text ergänzen.
8. Bei News unterhalb des zweiten `---` den vollständigen Beitrag schreiben. Bei einem Fotoreport kann dieser Bereich leer bleiben.
9. **Preview** verwenden, um die Markdown-Formatierung grob zu kontrollieren.
10. Unter **Commit changes** eine kurze Nachricht wie `News Clubausflug 2026 veröffentlichen` eintragen, **Commit directly to the `main` branch** wählen und bestätigen.

Beispiel für korrekte Bildpfade einer News:

```yaml
coverImage: /media/news/clubausflug-bassano-2026/titelbild.jpg
gallery:
  - src: /media/news/clubausflug-bassano-2026/titelbild.jpg
    alt: Gruppe der Jungfrau-Tächi vor dem Monte Grappa
  - src: /media/news/clubausflug-bassano-2026/startplatz.webp
    alt: Startvorbereitung am Monte Grappa
```

Für einen Fotoreport lautet derselbe Pfad entsprechend `/media/photos/<slug>/<dateiname>`.

### 4. Veröffentlichung prüfen

1. Im Repository den Bereich **Actions** öffnen und den neuesten Lauf **Deploy GitHub Pages** auswählen.
2. Warten, bis Build und Deployment grün markiert sind. Das dauert normalerweise wenige Minuten.
3. Anschliessend die Produktionsseite öffnen und den neuen Beitrag auf Desktop und Mobilgerät prüfen: Titelbild, Text, Reihenfolge der Galerie und alle Alt-Texte.
4. Falls der Lauf fehlschlägt, nichts weiter veröffentlichen und die Fehlermeldung an die für die Website zuständige Person weitergeben.

## Felder

- `kind`: Inhaltstyp; in der Vorlage unverändert lassen.
- `slug`: dauerhafte URL; muss dem Dateinamen und Bilderordner entsprechen.
- `title`: sichtbarer Seitentitel.
- `date`: Datum im Format `YYYY-MM-DD`.
- `category`: Rubrik eines Newsbeitrags.
- `summary`: kurzer Anrisstext einer News für die Übersicht.
- `detail`: kurze Einordnung eines Fotoreports.
- `coverImage`: Titelbild in Übersicht und Detailseite.
- `gallery`: sortierte Liste aller Bilder; `src` ist der Bildpfad, `alt` beschreibt das Motiv.

Unterhalb des zweiten `---` steht bei News der vollständige Beitrag. Übliche Markdown-Formatierung wie Absätze, `## Zwischentitel`, Listen, Hervorhebungen und Links wird unterstützt. Die Fotogalerie benötigt normalerweise keinen zusätzlichen Fliesstext.

## Kurzcheck vor dem Speichern

- Branch `main` ist ausgewählt.
- Dateiname, `slug` und Bilderordner verwenden exakt denselben Slug.
- `date` hat das Format `YYYY-MM-DD`.
- Alle Bildpfade beginnen mit `/media/news/` oder `/media/photos/` und enthalten die richtige Dateiendung.
- `coverImage` steht auch in `gallery`, normalerweise an erster Stelle.
- Jedes Bild hat einen beschreibenden `alt`-Text; ein Kameradateiname wie `IMG_1234` ist kein Alt-Text.
- Es wurden keine Passwörter, internen Dokumente oder personenbezogenen Daten hochgeladen, die nicht öffentlich sein dürfen.

## Spätere Komfortlösung

Wenn die direkte GitHub-Bearbeitung für die Admins zu technisch ist, kann Decap CMS ergänzt werden. Es stellt unter `/admin` Formulare für dieselben Felder, Text und Bild-Uploads bereit und schreibt weiterhin die gleichen Markdown-Dateien ins Repository. Die Inhaltsstruktur bleibt dadurch unabhängig von einem bestimmten CMS.
