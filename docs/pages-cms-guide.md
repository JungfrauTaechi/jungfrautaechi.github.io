# Pages CMS ausprobieren

Pages CMS bietet Formulare für **News**, **Fotoreports** und **Jahresprogramm / Agenda**. Inhalte bleiben in den bisherigen Markdown- und JSON-Dateien im GitHub-Repository. Die Website benötigt keinen CMS-Server; derselbe Inhalt lässt sich später auch auf Cloudflare veröffentlichen.

## Einmalige Verbindung

1. [Pages CMS öffnen](https://app.pagescms.org/) und mit GitHub anmelden.
2. Falls die GitHub-App installiert werden muss, im Konto bzw. der Organisation **JungfrauTaechi** nur das Repository **jungfrautaechi.github.io** auswählen. Die Berechtigungen vor dem Bestätigen prüfen.
3. Das Repository öffnen und für diesen Test ausdrücklich den Branch **codex/pages-cms-pilot** auswählen. Dort liegt die vorbereitete `.pages.yml`; keine neue Konfiguration im Editor erstellen.

Die Anmeldung bzw. Freigabe der GitHub-App erfolgt durch den Kontoinhaber. Pascal kann später über die Collaborators-Funktion per E-Mail eingeladen werden; zuerst den Zugriff mit dem eigenen Konto testen. Eine Einladung wird nicht automatisch versendet.

## Wichtig: Test und Veröffentlichung

- **codex/pages-cms-pilot:** Speichern ändert nur den Testbranch. Es erfolgt keine Veröffentlichung auf der Clubwebsite und keine automatische Website-Vorschau. Auch Agendaänderungen bleiben auf diesem Branch.
- **main:** Speichern ändert die Produktionsdateien. Die bestehende GitHub-Automatik prüft und baut die Website; erst nach erfolgreichem Deployment ist die Änderung sichtbar.
- News und Fotoreports mit aktiviertem **Entwurf** werden vom Website-Build ausgelassen. Das öffentliche Repository bleibt dennoch öffentlich; Entwürfe sind dort lesbar.
- Das Jahresprogramm hat keinen Entwurfsstatus. Agenda-Teständerungen deshalb ausschliesslich auf dem Testbranch vornehmen.

Während des Piloten bleibt die Konfiguration ausserhalb von `main`. Testbeiträge und Testtermine vor einer späteren Übernahme entfernen; nur die geprüfte Konfiguration und Anleitung übernehmen.

## News erstellen

1. **News** öffnen und einen neuen Beitrag anlegen.
2. Titel, URL-Kürzel (z. B. `clubausflug-2027`), Beitragsdatum, Rubrik und Kurztext eintragen. Das URL-Kürzel bestimmt den Dateinamen und die spätere Adresse `/news/<kürzel>`; nach Veröffentlichung nicht ändern.
3. Für einen noch nicht fertigen Beitrag **Entwurf** einschalten.
4. Beitragstext mit Absätzen, Zwischentiteln, Listen und Links schreiben. Bilder unter **Galerie** hinzufügen; Bilder im Fliesstext werden von der Website nicht dargestellt.
5. Optional ein Titelbild wählen. Es erscheint automatisch einmal in der Newsgalerie. Ohne Titelbild wird das erste Galeriebild für Karte und Seitenkopf verwendet.
6. Speichern und den ausgewählten Branch nochmals kontrollieren.

## Fotoreport erstellen

1. **Fotoreports** öffnen und einen neuen Bericht mit Titel, URL-Kürzel, Datum und kurzer Einleitung anlegen.
2. In der Mediathek einen passenden Ordner unter `photos/` erstellen bzw. auswählen. Fotos vor dem Upload auf ungefähr 1600–2000 Pixel an der langen Kante und möglichst 1–2 MB pro Datei verkleinern. Pages CMS ist in diesem Pilot keine automatische Bildoptimierung.
3. Alle Fotos in diesen Ordner hochladen. Unter **Foto-Ordner – automatische Galerie** den öffentlichen Ordnerpfad eintragen, zum Beispiel `/media/photos/clubausflug-2027`. **Keine einzelnen Galerieeinträge nötig.**
4. Die Website nimmt beim nächsten Build alle JPEG-, PNG- und WebP-Dateien direkt in diesem Ordner auf. Die Reihenfolge folgt den Dateinamen, mit natürlicher Zahlensortierung: `bild-1`, `bild-2`, `bild-10`. Für eine eigene Reihenfolge vor dem Upload `001`, `002`, `003` usw. verwenden. Unterordner werden nicht eingelesen. Optional ein Titelbild auswählen; liegt es im Foto-Ordner, ist es automatisch auch Teil der Galerie.
5. Speichern. Für den ersten Test zwei bis drei Fotos verwenden; danach einen grösseren Report testen, um den Aufwand der Galeriepflege beurteilen zu können.

Für Fotoreport-Uploads bleiben die vorbereiteten Dateinamen erhalten, damit die Reihenfolge zuverlässig ist. Deshalb je Report einen eigenen Ordner verwenden und keine vorhandenen Dateien versehentlich überschreiben. Bestehende Bildpfade bleiben erhalten. Die Mediathek enthält nur `public/media/`; importierte Bilder unter `/assets/` bleiben im Inhalt erhalten, werden aber nicht als hochgeladene Clubbilder verwaltet. Bestehende Bilder nicht löschen, wenn sie noch in Beiträgen verwendet werden.

**Einzelbilder / Beschreibungen** ist optional: Bei automatischen Galerien können dort Beschreibungen für ausgewählte Fotos ergänzt werden. Die übrigen Fotos erhalten eine neutrale Bezeichnung mit Reporttitel und Bildnummer. Einzelbilder ausserhalb des Foto-Ordners werden am Ende angehängt. Bei bestehenden Reports ohne Foto-Ordner bleibt die manuelle Galerie mit ihrer gespeicherten Reihenfolge erhalten. Neue Dateien im Ordner kommen beim nächsten Build hinzu, gelöschte Dateien fallen heraus, sofern sie nicht noch als Titelbild oder Einzelbild referenziert sind.

Der aktuelle Pages-Build belegt rund **969 MB von 1000 MB**. Für den Piloten kleine Fotomengen verwenden. Vor grösseren Veröffentlichungen Platz schaffen oder die Bildspeicherung auf Cloudflare/R2 umstellen; der bestehende Grössencheck verhindert einen zu grossen Pages-Build.

## Jahresprogramm / Agenda bearbeiten

1. **Jahresprogramm / Agenda** öffnen und den gewünschten Anlass bearbeiten bzw. einen weiteren Listeneintrag hinzufügen.
2. **Anlass**, **Startdatum**, optional **Enddatum**, **Datum für die Anzeige** und **Beschreibung** ausfüllen.
3. Bei einem eintägigen Anlass Enddatum gleich Startdatum setzen oder leer lassen. Bei einem mehrtägigen Anlass den letzten Tag angeben. Das Enddatum darf nicht vor dem Startdatum liegen.
4. **Datum für die Anzeige** bei Datumsänderungen ebenfalls aktualisieren, beispielsweise `19.–20. September 2026`.
5. Den optionalen Beitragslink nur ausfüllen, wenn der Beitrag existiert. Sonst leer lassen.
6. Speichern. Auf `main` erscheinen gültige Änderungen nach erfolgreicher Veröffentlichung auf der Startseite und unter `/club`; vergangene Termine werden automatisch aus der kommenden Agenda ausgeblendet.

## Gemeinsamer Pilottest

- Eine News als Entwurf speichern, wieder öffnen und Text/Datum/Titelbild kontrollieren.
- Einen Fotoreport mit zwei bis drei Bildern in einem Ordner anlegen, nur den Foto-Ordner eintragen, speichern und erneut öffnen. Lokal prüfen, dass alle Fotos ohne Einzelbildeinträge erscheinen; anschliessend eine weitere Datei hinzufügen und erneut bauen.
- Im Jahresprogramm einen Termin ändern und einen mehrtägigen Anlass ergänzen; speichern und erneut öffnen.
- Prüfen, dass die Änderungen nur auf `codex/pages-cms-pilot` vorliegen. Danach die Dateien lokal holen und mit `npm run content:build` sowie `npm run build:pages` prüfen.
- Die gespeicherten Beiträge lokal ansehen. Ein erfolgreicher CMS-Speichervorgang ist noch kein erfolgreicher Website-Build.

Die automatische Validierung prüft unter anderem Datum, URL-Kürzel, Galerielisten, vorhandene lokale Bilder und Agenda-Pflichtfelder. Ein ungültiges Enddatum oder ein fehlendes Bild stoppt die Veröffentlichung; der bisher veröffentlichte Stand bleibt bestehen.

## Referenzen

- [Pages CMS: Quick start](https://pagescms.org/docs/quick-start/)
- [Collections und einzelne Dateien](https://pagescms.org/docs/configuration/content/)
- [JSON-Dateien mit einer Liste](https://pagescms.org/docs/configuration/content/list/)
- [Mediathek und öffentliche Bildpfade](https://pagescms.org/docs/configuration/media/)
- [Zugriff für Collaborators](https://pagescms.org/docs/configuration/collaborators/)
