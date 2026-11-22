// Über uns, Datenschutzerklärung und Nutzungsbedingungen auf Deutsch. Folgt scripts/static-pages/en.js (gleiche Form, gleiche Schlüssel).
// Die Texte sind HTML: Tags, hrefs, mailto und Dienstnamen unverändert lassen; nur die Wörter übersetzen.
module.exports = {
  ui: {
    skip: 'Zum Inhalt springen',
    back: 'Zurück zur Karte',
    about: 'Über uns',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    languages: 'Sprachen',
    translationNote: 'Dies ist eine Übersetzung; weicht sie von der englischen Fassung ab, gilt die englische Fassung.',
  },

  about: {
    title: 'Über Bouldeer',
    metaTitle: 'Über uns — Bouldeer',
    description: 'Bouldeer ist eine kostenlose Karte für Kletterhallen, gemacht für Kletternde, die reisen: über 3.600 Boulder-, Toprope- und Vorstieghallen in über 80 Ländern, in 9 Sprachen.',
    body: `
    <p class="lede t-text-lg">Bouldeer ist eine kostenlose Karte für Kletterhallen, gemacht für Kletternde, die reisen. Wo immer du landest, zeigt sie dir die Boulder-, Toprope- und Vorstiegwände in der Nähe: mehr als 3.600 Hallen in über 80 Ländern, jeweils mit Adresse, Kletterarten und Wegbeschreibung, dazu Tageseintrittspreise und Öffnungszeiten, wo wir sie bestätigt haben.</p>

    <h2>Gemacht fürs Klettern unterwegs</h2>
    <ul>
      <li><strong>Finde eine Wand, bevor du die Schuhe packst.</strong> Suche nach Stadt, Land oder Hallenname oder öffne die Karte dort, wo du gerade bist, und filtere nach Bouldern, Toprope oder Vorstieg.</li>
      <li><strong>Suche in der Landesschrift.</strong> Gib 成都, 東京 oder 서울 so einfach ein wie Chengdu, Tokyo oder Seoul. Hat eine Halle einen Namen in ihrer eigenen Sprache, zeigt Bouldeer ihn neben dem englischen an.</li>
      <li><strong>Komm ans Ziel, auch ohne gemeinsame Sprache.</strong> Bei vielen Hallen steht die Adresse in der Landesschrift, die du dem Taxifahrer zeigen kannst, mit Kopierknopf und Wegbeschreibung in Google Maps, in Festlandchina in Amap.</li>
      <li><strong>Lies es in deiner Sprache.</strong> Bouldeer gibt es auf Englisch, in vereinfachtem und traditionellem Chinesisch, auf Japanisch, Koreanisch, Deutsch, Französisch, Spanisch und brasilianischem Portugiesisch.</li>
      <li><strong>Behalte deine Reisen im Blick.</strong> Melde dich an, um Hallen zu speichern, die schon gekletterten zu markieren, einzuchecken und für jede Stadt einen Passstempel zu sammeln und ein Logbuch deiner Sessions zu führen.</li>
    </ul>

    <h2>Woher die Informationen stammen</h2>
    <p>Jede Halle wird einzeln anhand ihrer eigenen Website und Social-Media-Konten sowie öffentlicher Karteneinträge recherchiert und geprüft, bevor sie auf der Karte erscheint. Haben wir eine Angabe nicht bestätigt, etwa einen Preis oder die Öffnungszeiten, sagt Bouldeer das, statt zu raten. Ist etwas veraltet, schickst du es uns mit <strong>Änderung vorschlagen</strong> oder <strong>Problem melden</strong> auf der Seite der Halle, und jede Korrektur wird geprüft, bevor sie live geht.</p>

    <h2>Für wen es gedacht ist</h2>
    <p>Für Kletternde, die reisen: im Urlaub, auf Dienstreise, auf einer langen Reise durch mehrere Länder oder neu in der Stadt. Zum Nutzen der Karte brauchst du kein Konto.</p>
`,
    faqTitle: 'Fragen',
    faq: [
      ['Was ist Bouldeer?', 'Bouldeer ist eine kostenlose Website und Web-App, die Kletterhallen weltweit auf einer Karte zeigt, gemacht für Kletternde, die reisen. Sie listet mehr als 3.600 Boulder-, Toprope- und Vorstieghallen in über 80 Ländern.'],
      ['Wie finde ich auf Reisen eine Boulderhalle?', 'Öffne www.bouldeer.com, suche nach der Stadt, die du besuchst (auf Englisch oder in der Landesschrift) oder nutze deinen Standort, und filtere nach Bouldern. Jede Hallenseite zeigt Adresse, Wegbeschreibung und, wo bestätigt, Tageseintrittspreise und Öffnungszeiten.'],
      ['Ist Bouldeer kostenlos?', 'Ja. Bouldeer ist kostenlos, zeigt keine Werbung und braucht kein Konto, um die Karte zu nutzen. Ein Konto brauchst du nur, um Hallen zu speichern, einzuchecken und ein Logbuch zu führen.'],
      ['Welche Länder deckt Bouldeer ab?', 'Über 80 Länder auf allen Kontinenten, die meisten Hallen gibt es in den USA, China, Japan, Deutschland, Frankreich, im Vereinigten Königreich, in Südkorea, Kanada, Spanien und Australien.'],
      ['Gibt es Kletterhallen in China auf Bouldeer?', 'Ja. Bouldeer listet fast 500 Kletterhallen in mehr als 40 chinesischen Städten, viele mit chinesischem Namen und chinesischer Adresse sowie einem Link, um die Adresse in Amap zu öffnen.'],
      ['Verkauft Bouldeer Tageskarten oder nimmt es Buchungen an?', 'Nein. Bouldeer steht in keiner Verbindung zu den gelisteten Hallen und nimmt weder Buchungen noch Zahlungen an. Kaufe Eintritte und buche direkt bei der Halle.'],
      ['Sind Preise und Öffnungszeiten aktuell?', 'Bouldeer zeigt nur Angaben, die es bestätigt hat, und kennzeichnet den Rest als noch nicht bestätigt. Hallen ändern ihre Zeiten und Preise, frag also vor dem Besuch bei der Halle nach.'],
      ['In welchen Sprachen gibt es Bouldeer?', 'Englisch, vereinfachtes Chinesisch, traditionelles Chinesisch, Japanisch, Koreanisch, Deutsch, Französisch, Spanisch und brasilianisches Portugiesisch.'],
    ],
    contact: `
    <h2>Kontakt</h2>
    <p>Fragen oder Korrekturen: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. So gehen wir mit deinen Daten um: <a href="{privacy}">Datenschutz</a> und <a href="{terms}">Nutzungsbedingungen</a>.</p>
`,
  },

  privacy: {
    title: 'Datenschutzerklärung',
    metaTitle: 'Datenschutzerklärung — Bouldeer',
    description: 'Was Bouldeer speichert, wer es sehen kann, welche Dienste es nutzt und wie du dein Konto löschst.',
    updated: 'Stand: 22. November 2026',
    body: `
    <p>Bouldeer ist eine kleine, kostenlose Karte von Kletterhallen für Kletternde, die reisen. Wir erheben so wenig wie möglich, nutzen weder Werbung noch Analysedienste und verkaufen deine Daten nicht.</p>

    <h2>Ohne Konto</h2>
    <p>Du kannst die Karte, die Suche und die Hallenseiten nutzen, ohne dich anzumelden. Bouldeer setzt keine Cookies und verwendet kein Tracking. Die Dienste, die die Website ausliefern (unten aufgeführt), sehen gewöhnliche Anfragedaten wie deine IP-Adresse und deinen Browser.</p>

    <h2>Mit Konto</h2>
    <p>Du meldest dich mit einem E-Mail-Link oder mit Google an, über Supabase, unseren Datenbank- und Anmeldedienst. Wir speichern:</p>
    <ul>
      <li>Deine E-Mail-Adresse (und, wenn du Google nutzt, die grundlegenden Profildaten, die Google weitergibt), damit du dich anmelden kannst. Sie wird auf Bouldeer nie angezeigt.</li>
      <li>Einen optionalen Anzeigenamen, der öffentlich als &bdquo;hinzugefügt von&nbsp;&hellip;&ldquo; bei Hallen erscheint, die du hinzufügst.</li>
      <li>Deine gespeicherten und gekletterten Hallen, Check-ins und dein Logbuch: die Hallen, Daten, Notizen, Stimmungen und Grade, die du einträgst.</li>
      <li>Was du uns schickst: neue Hallen, Änderungsvorschläge und Problemmeldungen, verknüpft mit deinem Konto.</li>
    </ul>

    <h2>Wer was sehen kann</h2>
    <ul>
      <li><strong>Alle:</strong> freigegebene Hallendaten und dein Anzeigename bei Hallen, die du hinzugefügt hast. Gib in Hallendaten keine persönlichen Informationen an.</li>
      <li><strong>Moderation:</strong> was du uns schickst und von welchem Konto es kommt, damit sie es prüfen kann.</li>
      <li><strong>Nur du:</strong> deine E-Mail-Adresse, gespeicherte und gekletterte Hallen, Check-ins, Logbuch und Punkte.</li>
    </ul>
    <p>Private Daten sind durch Zugriffsregeln der Datenbank geschützt. Die Person, die Bouldeer betreibt, hat Administratorzugriff auf die Datenbank und nutzt ihn nur, um die Website zu betreiben und abzusichern.</p>

    <h2>Standort</h2>
    <p>Bouldeer fragt nur dann nach deinem Standort, wenn du die Ortungsschaltfläche, &bdquo;Meinen Standort verwenden&ldquo; bei Halle hinzufügen oder auf dem Handy den Check-in nutzt (dafür musst du dich im Umkreis von etwa 500&nbsp;Metern um die Halle befinden). Dein Browser fragt vorher nach, und du kannst ablehnen. Deine Position wird auf deinem Gerät verwendet und weder an uns gesendet noch gespeichert: Ein Check-in erfasst die Halle und die Uhrzeit, nicht, wo du warst.</p>

    <h2>Auf deinem Gerät gespeichert</h2>
    <p>Keine Cookies. Der Speicher deines Browsers hält deine Anmeldesitzung, einen nicht gesendeten Entwurf für Halle hinzufügen, dein Listenlayout, die zuletzt angezeigte Kartenposition, letzte Suchen und die gewählte Sprache, einen Vermerk, damit eine Meilensteinmeldung nur einmal pro Besuch erscheint, sowie Offline-Kopien der Website, angesehener Kartenkacheln und der öffentlichen Hallenliste. Wenn du die Daten der Website in deinem Browser löschst, wird alles davon entfernt.</p>

    <h2>Dienste, die wir nutzen</h2>
    <p>Jeder dieser Dienste sieht deine IP-Adresse und Browserdaten und hat eine eigene Datenschutzerklärung:</p>
    <ul>
      <li><strong>Supabase:</strong> Datenbank und Anmeldung. Der Dienst speichert deine Kontodaten und versendet Anmelde-E-Mails.</li>
      <li><strong>Vercel:</strong> hostet die Website und führt Anfrageprotokolle.</li>
      <li><strong>Google:</strong> Anmeldung mit Google (nur wenn du sie wählst), Google Fonts und Google Maps, wenn du auf Route tippst.</li>
      <li><strong>Amap:</strong> nur wenn du dich entscheidest, eine Adresse in Amap zu öffnen.</li>
      <li><strong>CARTO:</strong> Kartenkacheln, basierend auf OpenStreetMap-Daten.</li>
      <li><strong>unpkg.com und cdn.jsdelivr.net:</strong> die Code-Bibliotheken für die Karte und die Datenbankverbindung.</li>
      <li><strong>Fotoanbieter:</strong> Hallenfotos sind Links, dein Browser lädt sie also von der Website, die sie hostet.</li>
    </ul>

    <h2>Dein Konto löschen</h2>
    <p>Nutze unten auf deiner Ich-Seite <strong>Konto löschen</strong>, um dein Konto sofort zu löschen, oder schreib eine E-Mail an <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a> von der Adresse, mit der du dich anmeldest, und wir löschen es innerhalb von 30 Tagen. In beiden Fällen werden deine E-Mail-Adresse, dein Anzeigename, gespeicherte und gekletterte Hallen, Check-ins, Logbuch und Punkte entfernt. Hallen, Änderungen und Meldungen, die du geschickt hast, bleiben bestehen, die Verknüpfung zu dir wird entfernt. Kopien in den Protokollen und Backups unserer Anbieter laufen nach deren eigenen Fristen ab.</p>
    <p>Du kannst uns auch schreiben, um zu erfahren, was wir über dich speichern, oder um es berichtigen zu lassen. Um die Angaben zu einer Halle zu korrigieren, nutze auf deren Seite Änderung vorschlagen oder Problem melden.</p>

    <h2>Änderungen</h2>
    <p>Wenn Bouldeer beginnt, etwas Neues zu erheben, aktualisieren wir zuerst diese Seite und ändern das Datum oben.</p>

    <h2>Kontakt</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Siehe auch die <a href="{terms}">Nutzungsbedingungen</a>.</p>
`,
  },

  terms: {
    title: 'Nutzungsbedingungen',
    metaTitle: 'Nutzungsbedingungen — Bouldeer',
    description: 'Die Bedingungen für die Nutzung von Bouldeer, der kostenlosen Kletterhallenkarte für Kletternde, die reisen.',
    updated: 'Stand: 21. November 2026',
    body: `
    <p>Bouldeer (früher Climb Atlas) ist eine kostenlose, rein informative Karte von Kletterhallen für Kletternde, die reisen. Sie steht in keiner Verbindung zu den gelisteten Hallen und nimmt weder Buchungen noch Zahlungen an. Mit der Nutzung von Bouldeer stimmst du diesen Bedingungen zu; die <a href="{privacy}">Datenschutzerklärung</a> erklärt, wie wir mit deinen Daten umgehen.</p>

    <h2>Vor dem Besuch prüfen</h2>
    <p>Die Hallendaten werden aus öffentlichen Quellen recherchiert, etwa den eigenen Websites und Social-Media-Konten der Hallen und Karteneinträgen, sowie aus Korrekturen, die Leute uns schicken. Sie können veraltet oder falsch sein. Prüfe Öffnungszeiten, Preise und ob eine Halle noch geöffnet ist bei der Halle selbst. Klettern birgt echte Risiken: Du kletterst auf eigenes Risiko und bist für deine eigene Sicherheit verantwortlich.</p>

    <h2>Dein Konto</h2>
    <ul>
      <li>Behalte deine Anmeldedaten für dich. Du bist dafür verantwortlich, was mit deinem Konto geschieht.</li>
      <li>Du kannst jederzeit verlangen, dass wir dein Konto löschen. Wir können Konten sperren oder entfernen, die gegen diese Bedingungen verstoßen oder die Website missbrauchen.</li>
    </ul>

    <h2>Was du uns schickst</h2>
    <ul>
      <li>Schick nur Angaben, die du für richtig hältst und die du weitergeben darfst. Gib keine persönlichen Informationen über andere Personen an.</li>
      <li>Kein Spam, keine anstößigen Inhalte und keine absichtlich falschen Angaben.</li>
      <li>Du erlaubst Bouldeer, das, was du schickst, auf der Karte anzuzeigen und dort zu belassen, auch nachdem du dein Konto gelöscht hast.</li>
      <li>Die Moderation prüft neue Hallen und Änderungen und kann alles Eingesendete bearbeiten, ablehnen oder entfernen.</li>
    </ul>

    <h2>Faire Nutzung</h2>
    <p>Bitte kopiere die Kartendaten nicht automatisiert oder in großen Mengen und belaste die Website nicht so stark, dass andere beeinträchtigt werden, ohne uns vorher zu fragen. Suchmaschinen und KI-Assistenten dürfen einzelne Seiten lesen und darauf verlinken. Der Code und das Design der Website gehören Bouldeer; schlichte Fakten über Hallen, wie ihre Adressen, können wir nicht besitzen.</p>

    <h2>Keine Gewähr</h2>
    <p>Bouldeer wird bereitgestellt, wie es ist, ohne Gewähr für Richtigkeit oder ständige Verfügbarkeit. Soweit das Gesetz es erlaubt, haften wir nicht für Verluste aus der Nutzung der Website oder dem Vertrauen auf ihre Informationen. Verlinkte Websites und die Dienste, die wir für Karten, Hosting und Anmeldung nutzen, liegen außerhalb unserer Kontrolle.</p>

    <h2>Übersetzungen</h2>
    <p>Diese Bedingungen und die Datenschutzerklärung gibt es auch in anderen Sprachen. Weicht eine Übersetzung von der englischen Fassung ab, gilt die englische Fassung.</p>

    <h2>Änderungen und anwendbares Recht</h2>
    <p>Wir können diese Bedingungen aktualisieren; das Datum oben zeigt die jeweils neueste Fassung. Diese Bedingungen unterliegen dem Recht von New South Wales, Australien. Fragen: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },
};
