# J.A.R.V.I.S. – Stark Interface Upgrade

## Enthalten
- `index.html` – überarbeitetes, responsives JARVIS-Dashboard mit lokalem Chat, Spracheingabe und Sprachausgabe
- `manifest.webmanifest` – PWA-Einstellungen
- `sw.js` – Offline-Caching mit neuer Cache-Version
- `icon.svg` – App-Symbol
- `worker.js` – Cloudflare Worker als sichere Verbindung zur OpenAI Responses API

## 1. Website aktualisieren (iPad/GitHub)
1. Öffne dein Repository `olewtt/jarvis-` auf GitHub.
2. Öffne `index.html` → Stift/Bearbeiten → gesamten Inhalt durch die neue `index.html` ersetzen → Commit changes.
3. Lade `manifest.webmanifest`, `sw.js` und `icon.svg` ebenfalls in das Repository-Hauptverzeichnis hoch bzw. ersetze sie durch diese Versionen.
4. `worker.js` ist **nicht** Teil der GitHub-Pages-Website. Bewahre es für Schritt 2 auf.
5. Warte kurz und lade `https://olewtt.github.io/jarvis-/` in Safari neu.

## 2. Echte KI-Verbindung (separater Schritt)
GitHub Pages kann kein geheimes API-Key sicher speichern oder serverseitigen Code ausführen. Dafür wird ein Backend benötigt.
1. Erstelle bei Cloudflare einen Worker und füge den Inhalt aus `worker.js` ein.
2. Lege im Worker unter Settings → Variables and Secrets ein Secret namens `OPENAI_API_KEY` an und trage dort deinen OpenAI API-Schlüssel ein. Niemals in `index.html` einfügen.
3. Optional: Lege `MODEL` als Variable an. Standard ist `gpt-4.1-mini`.
4. Deploye den Worker und kopiere seine HTTPS-Adresse.
5. Öffne `index.html` und trage die Worker-Adresse in `const API_URL = "";` ein, z. B. `const API_URL = "https://dein-worker.dein-name.workers.dev";`.
6. Committe die Änderung. Danach zeigt JARVIS den KI-Kanal als konfiguriert.

## Kosten und Schutz
- ChatGPT-Abonnement und API-Nutzung sind getrennt. API-Aufrufe werden separat nach Nutzung abgerechnet; prüfe vor dem Aktivieren die aktuellen Preise und Ausgabenlimits im OpenAI-Konto.
- Der API-Key bleibt als Worker-Secret auf dem Server.
- Der Worker erlaubt CORS nur für `https://olewtt.github.io`. Wenn du später eine eigene Domain nutzt, muss `ALLOWED_ORIGIN` angepasst werden.
- Für öffentliche Nutzung ergänze vor dem Teilen Authentifizierung und Rate-Limits. Der Beispiel-Worker ist ein Startpunkt, kein vollständiges Missbrauchsschutzsystem.
- Der Gesprächskontext liegt hier nur im Browser-Speicher der aktuellen Seite und wird pro Anfrage als begrenzter Verlauf mitgesendet; es gibt keine dauerhafte Nutzerhistorie auf dem Worker.

## Wichtig
Das Upgrade kann direkt lokal und auf GitHub Pages laufen. Freie ChatGPT-Antworten funktionieren erst nach Einrichtung und Eintrag der Worker-Adresse sowie eines gültigen API-Secrets.
