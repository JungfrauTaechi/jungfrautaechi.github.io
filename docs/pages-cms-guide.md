# News, Fotoreports und Agenda mit Pages CMS bearbeiten

Pages CMS bietet Formulare für **News**, **Fotoreports** und **Jahresprogramm / Agenda**. Inhalte bleiben in den bisherigen Markdown- und JSON-Dateien im GitHub-Repository. Die Website benötigt keinen CMS-Server; derselbe Inhalt lässt sich später auch auf Cloudflare veröffentlichen.

## Anmeldung und Zugriff

1. [Club-Editor öffnen](https://app.pagescms.org/jungfrautaechi/jungfrautaechi.github.io/main/collection/news) und mit GitHub anmelden.
2. Das Repository **JungfrauTaechi/jungfrautaechi.github.io** und den Branch **main** auswählen. Die Formulare sind bereits eingerichtet; keine neue Konfiguration erstellen.
3. Wer mit GitHub angemeldet ist, benötigt Schreibzugriff (**Write**) auf das Repository. Ein GitHub-Konto oder der Link allein erteilt noch keine Bearbeitungsberechtigung.

Alternativ kann ein zuständiger Repository-Admin über [Collaborators](https://app.pagescms.org/jungfrautaechi/jungfrautaechi.github.io/main/collaborators) eine Person per E-Mail als Pages-CMS-Collaborator einladen. Damit lassen sich die konfigurierten Inhalte und Bilder bearbeiten, ohne GitHub-Repository-Schreibzugriff zu vergeben. Diese Einladung wird nicht automatisch versendet. CMS-Collaborators dürfen weder die CMS-Konfiguration noch andere Collaborators verwalten.

Die GitHub-App ist für das Club-Repository verbunden. Falls die Verbindung erneut eingerichtet werden muss, nur das Repository **jungfrautaechi.github.io** freigeben und die Berechtigungen vor dem Bestätigen prüfen.

## Speichern und veröffentlichen

- Auf **main** ändert Speichern die Produktionsdateien. Die GitHub-Automatik prüft und baut die Website; erst nach erfolgreichem Deployment ist die Änderung sichtbar.
- News und Fotoreports mit aktiviertem **Entwurf** werden vom Website-Build ausgelassen. Das öffentliche Repository bleibt dennoch öffentlich; Entwürfe sind dort lesbar.
- Das Jahresprogramm hat keinen Entwurfsstatus. Agendaänderungen auf `main` werden nach erfolgreicher Prüfung veröffentlicht.
- Für Anwendungscode, Navigation, Konfiguration oder grössere Änderungen weiterhin einen separaten Branch und Pull Request verwenden.

Die Veröffentlichung unter [Deploy GitHub Pages](https://github.com/JungfrauTaechi/jungfrautaechi.github.io/actions/workflows/pages.yml) kontrollieren. Bei einer fehlgeschlagenen Prüfung bleibt die bisher veröffentlichte Website bestehen. Ein erfolgreicher CMS-Speichervorgang ist noch kein erfolgreicher Website-Build.

## News erstellen

1. **News** öffnen und einen neuen Beitrag anlegen.
2. Titel, URL-Kürzel (z. B. `clubausflug-2027`), Beitragsdatum, Rubrik und Kurztext eintragen. Das URL-Kürzel bestimmt den Dateinamen und die Adresse `/news/<kürzel>`; nach Veröffentlichung nicht ändern.
3. Für einen noch nicht fertigen Beitrag **Entwurf** einschalten.
4. Beitragstext mit Absätzen, Zwischentiteln, Listen und Links schreiben. Bilder unter **Galerie** hinzufügen; Bilder im Fliesstext werden von der Website nicht dargestellt.
5. Optional ein Titelbild wählen. Es erscheint automatisch einmal in der Newsgalerie. Ohne Titelbild wird das erste Galeriebild für Karte und Seitenkopf verwendet.
6. Speichern. Zum Veröffentlichen **Entwurf** ausschalten und erneut speichern; danach den erfolgreichen Website-Build abwarten.

## Fotoreport erstellen

1. **Fotoreports** öffnen und einen neuen Bericht mit Titel, URL-Kürzel, Datum und kurzer Einleitung anlegen. Während der Vorbereitung **Entwurf** einschalten.
2. In der Mediathek einen eigenen Ordner unter `photos/` erstellen bzw. auswählen. Fotos vor dem Upload auf ungefähr 1600–2000 Pixel an der langen Kante und möglichst 1–2 MB pro Datei verkleinern. Pages CMS übernimmt keine automatische Bildoptimierung.
3. Alle Fotos in diesen Ordner hochladen. Unter **Foto-Ordner – automatische Galerie** den öffentlichen Ordnerpfad eintragen, zum Beispiel `/media/photos/clubausflug-2027`. **Keine einzelnen Galerieeinträge nötig.**
4. Die Website nimmt beim nächsten Build alle JPEG-, PNG- und WebP-Dateien direkt in diesem Ordner auf. Die Reihenfolge folgt den Dateinamen, mit natürlicher Zahlensortierung: `bild-1`, `bild-2`, `bild-10`. Für eine eigene Reihenfolge vor dem Upload `001`, `002`, `003` usw. verwenden. Unterordner werden nicht eingelesen.
5. Optional ein Titelbild auswählen; liegt es im Foto-Ordner, ist es automatisch auch Teil der Galerie. Ohne Titelbild verwendet die Website das erste Foto.
6. Sobald alle Fotos hochgeladen sind, **Entwurf** ausschalten und speichern. Die erfolgreiche Veröffentlichung abwarten und die Galerie kontrollieren.

Upload-Dateinamen bleiben erhalten, damit die Reihenfolge zuverlässig ist. Deshalb je Report einen eigenen Ordner verwenden und keine vorhandenen Dateien versehentlich überschreiben. Die Mediathek enthält `public/media/`; importierte Bilder unter `/assets/` bleiben im Inhalt erhalten, werden aber nicht als hochgeladene Clubbilder verwaltet. Bestehende Bilder nicht löschen, wenn sie noch in Beiträgen verwendet werden.

**Einzelbilder / Beschreibungen** ist optional: Bei automatischen Galerien können dort Beschreibungen für ausgewählte Fotos ergänzt werden. Die übrigen Fotos erhalten eine neutrale Bezeichnung mit Reporttitel und Bildnummer. Einzelbilder ausserhalb des Foto-Ordners werden am Ende angehängt. Bei bestehenden Reports ohne Foto-Ordner bleibt die manuelle Galerie mit ihrer gespeicherten Reihenfolge erhalten. Neue Dateien im Ordner kommen beim nächsten Build hinzu, gelöschte Dateien fallen heraus, sofern sie nicht noch als Titelbild oder Einzelbild referenziert sind.

Der aktuelle Pages-Build belegt rund **969 MB von 1000 MB**. Vor grösseren Fotoreports Platz schaffen oder die Bildspeicherung auf Cloudflare/R2 umstellen; der bestehende Grössencheck verhindert einen zu grossen Pages-Build.

## Jahresprogramm / Agenda bearbeiten

1. **Jahresprogramm / Agenda** öffnen und den gewünschten Anlass bearbeiten bzw. einen weiteren Listeneintrag hinzufügen.
2. **Anlass**, **Startdatum**, optional **Enddatum**, **Datum für die Anzeige** und **Beschreibung** ausfüllen.
3. Bei einem eintägigen Anlass Enddatum gleich Startdatum setzen oder leer lassen. Bei einem mehrtägigen Anlass den letzten Tag angeben. Das Enddatum darf nicht vor dem Startdatum liegen.
4. **Datum für die Anzeige** bei Datumsänderungen ebenfalls aktualisieren, beispielsweise `19.–20. September 2026`.
5. Den optionalen Beitragslink nur ausfüllen, wenn der Beitrag existiert. Sonst leer lassen.
6. Speichern. Gültige Änderungen erscheinen nach erfolgreicher Veröffentlichung auf der Startseite und unter `/club`; vergangene Termine werden automatisch aus der kommenden Agenda ausgeblendet.

Die automatische Validierung prüft unter anderem Datum, URL-Kürzel, Galerielisten, vorhandene lokale Bilder und Agenda-Pflichtfelder. Ein ungültiges Enddatum oder ein fehlendes Bild stoppt die Veröffentlichung.

## Referenzen

- [Pages CMS: Quick start](https://pagescms.org/docs/quick-start/)
- [Collections und einzelne Dateien](https://pagescms.org/docs/configuration/content/)
- [JSON-Dateien mit einer Liste](https://pagescms.org/docs/configuration/content/list/)
- [Mediathek und öffentliche Bildpfade](https://pagescms.org/docs/configuration/media/)
- [Zugriff für Collaborators](https://pagescms.org/docs/configuration/collaborators/)
