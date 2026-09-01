# News und Fotoreports verwalten

Die Website erzeugt alle News- und Fotoseiten aus einfachen Markdown-Dateien. Club-Admins müssen keine React-Komponenten und insbesondere nicht `src/App.jsx` bearbeiten.

## Empfohlener Ablauf auf GitHub

1. Im GitHub-Repository den Branch `stage` öffnen.
2. Für News `content/templates/news.md`, für einen Fotoreport `content/templates/photo-report.md` kopieren.
3. Die Kopie unter `content/news/<slug>.md` oder `content/photo-reports/<slug>.md` speichern. Der Slug besteht nur aus Kleinbuchstaben, Zahlen und Bindestrichen.
4. Bilder über die GitHub-Oberfläche nach `public/media/news/<slug>/` beziehungsweise `public/media/photos/<slug>/` hochladen.
5. Titel, Datum, Kurztext, Bildpfade und den eigentlichen Text in der Markdown-Datei eintragen. Jedes Bild braucht einen kurzen `alt`-Text.
6. Die Änderung in `stage` speichern. GitHub Pages baut die Stage-Website automatisch; dort wird der Beitrag auf Mobilgerät und Desktop geprüft.
7. Nach der Freigabe einen Pull Request von `stage` nach `main` zusammenführen. Damit erscheint derselbe Inhalt auf der Produktionsseite.

## Felder

- `slug`: dauerhafte URL, zum Beispiel `clubausflug-bassano-2026`
- `title`: sichtbarer Seitentitel
- `date`: Datum im Format `YYYY-MM-DD`
- `category`: Rubrik eines Newsbeitrags
- `summary`: kurzer Anrisstext in der Übersicht
- `detail`: kurze Einordnung eines Fotoreports
- `coverImage`: Titelbild in Übersicht und Detailseite
- `gallery`: sortierte Liste aller Bilder; `src` ist der Bildpfad, `alt` beschreibt das Motiv

Unterhalb des zweiten `---` steht bei News der vollständige Beitrag. Übliche Markdown-Formatierung wie Absätze, `## Zwischentitel`, Listen, Hervorhebungen und Links wird unterstützt. Die Fotogalerie benötigt normalerweise keinen zusätzlichen Fliesstext.

## Bilder

- Sinnvolle JPEG- oder WebP-Grösse: ungefähr 1600–2000 Pixel an der langen Kante.
- Keine Leerzeichen oder Umlaute in Dateinamen verwenden.
- Das wichtigste Bild zuerst in `gallery` aufführen und auch als `coverImage` verwenden.
- `alt` beschreibt knapp, was im Bild erkennbar ist; Dateinamen wie `IMG_1234` sind kein Alt-Text.

## Spätere Komfortlösung

Wenn die direkte GitHub-Bearbeitung für die Admins zu technisch ist, kann Decap CMS ergänzt werden. Es stellt unter `/admin` Formulare für dieselben Felder, Text und Bild-Uploads bereit und schreibt weiterhin die gleichen Markdown-Dateien ins Repository. Die Inhaltsstruktur bleibt dadurch unabhängig von einem bestimmten CMS.
