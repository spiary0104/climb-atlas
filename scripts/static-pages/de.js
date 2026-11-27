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
    description: 'Was Bouldeer speichert, wer es sehen kann, wo es verarbeitet wird und wie du dein Konto löschst.',
    updated: 'Stand: 27. November 2026',
    body: `
    <p>Bouldeer ist eine kleine, kostenlose Karte von Kletterhallen für Kletternde, die reisen, betrieben von New South Wales in Australien aus. Wir erheben so wenig wie möglich. Wir zeigen keine Werbung, nutzen keine Analysedienste und verkaufen oder teilen deine Daten nicht zu Werbezwecken.</p>

    <h2>Ohne Konto</h2>
    <p>Du kannst die Karte, die Suche und die Hallenseiten nutzen, ohne dich anzumelden. Bouldeer setzt keine Cookies und verfolgt dich nicht. Die Dienste, die die Website ausliefern (unten aufgeführt), sehen gewöhnliche Anfragedaten wie deine IP-Adresse und deinen Browser.</p>

    <h2>Mit Konto</h2>
    <p>Du musst mindestens 16 Jahre alt sein, um ein Konto zu erstellen. Du meldest dich mit einem E-Mail-Link oder mit Google an, über unseren Anmeldedienst Supabase. Wir speichern:</p>
    <ul>
      <li>Deine E-Mail-Adresse, damit du dich anmelden kannst. Wenn du Google nutzt, gibt Google zusätzlich deine grundlegenden Profildaten (Name und Profilbild) an unseren Anmeldedienst weiter. Nichts davon wird auf Bouldeer angezeigt.</li>
      <li>Einen optionalen Anzeigenamen.</li>
      <li>Deine gespeicherten und gekletterten Hallen, Check-ins (die Halle, die Uhrzeit und eine optionale kurze Notiz oder ein Foto-Link) und dein Logbuch (Daten, Routen, Grade, Stimmungen und Notizen).</li>
      <li>Was du uns schickst: neue Hallen, Änderungsvorschläge und Problemmeldungen, verknüpft mit deinem Konto.</li>
    </ul>
    <p>Wir nutzen das, um dein Konto und die Funktionen zu betreiben, die du wählst. Außerdem prüfen und veröffentlichen wir damit Hallendaten und halten die Website frei von Missbrauch.</p>

    <h2>Wer was sehen kann</h2>
    <ul>
      <li><strong>Alle:</strong> freigegebene Hallendaten und dein Anzeigename bei Hallen, die du hinzugefügt hast (angezeigt als &bdquo;hinzugefügt von&nbsp;&hellip;&ldquo;). Anzeigenamen werden sonst nirgends aufgelistet: Nur du und die Moderation können dein Profil lesen. Gib in Hallendaten keine persönlichen Informationen an.</li>
      <li><strong>Moderation:</strong> was du uns schickst, der Anzeigename des Kontos, von dem es kommt, und Beitragspunkte, damit sie Einsendungen prüfen kann. Sie sieht nie deine E-Mail-Adresse.</li>
      <li><strong>Nur du:</strong> deine E-Mail-Adresse, gespeicherte und gekletterte Hallen, Check-ins und Logbuch.</li>
    </ul>
    <p>Private Daten sind durch Zugriffsregeln der Datenbank geschützt und werden verschlüsselt übertragen (HTTPS). Die Person, die Bouldeer betreibt, hat Administratorzugriff auf die Datenbank und nutzt ihn nur, um die Website zu betreiben und abzusichern.</p>

    <h2>Standort</h2>
    <p>Bouldeer fragt nur dann nach deinem Standort, wenn du die Ortungsschaltfläche, &bdquo;Meinen Standort nutzen&ldquo; bei Halle hinzufügen oder auf dem Handy den Check-in nutzt (dafür musst du dich im Umkreis von etwa 500&nbsp;Metern um die Halle befinden). Dein Browser fragt vorher nach, und du kannst ablehnen.</p>
    <ul>
      <li><strong>Ortungsschaltfläche und Check-in:</strong> Deine Position wird nur auf deinem Gerät verwendet. Sie wird weder an uns gesendet noch gespeichert. Ein Check-in hält die Halle und die Uhrzeit fest, nicht, wo du warst.</li>
      <li><strong>Halle hinzufügen:</strong> &bdquo;Meinen Standort nutzen&ldquo; setzt die Markierung dorthin, wo du bist. Die Markierung, die du absendest, wird als Standort der Halle an uns übermittelt und nach der Freigabe veröffentlicht. Verschiebe sie also zuerst auf die Halle.</li>
    </ul>

    <h2>Auf deinem Gerät gespeichert</h2>
    <p>Keine Cookies. Der Speicher deines Browsers hält:</p>
    <ul>
      <li>deine Anmeldesitzung;</li>
      <li>einen nicht gesendeten Entwurf für Halle hinzufügen, einschließlich der Position der Markierung;</li>
      <li>dein Listenlayout, die zuletzt angezeigte Kartenansicht, letzte Suchen und die gewählte Sprache;</li>
      <li>Vermerke, damit das Intro sowie Willkommens- und Meilensteinmeldungen nur einmal erscheinen;</li>
      <li>Offline-Kopien der Website, angesehener Kartenbilder und der öffentlichen Hallenliste.</li>
    </ul>
    <p>Abmelden oder das Löschen deines Kontos beendet deine Sitzung. Wenn du die Daten der Website in deinem Browser löschst, wird alles andere entfernt.</p>

    <h2>Wo deine Daten verarbeitet werden</h2>
    <p>Deine Kontodaten werden in Singapur gespeichert. Unsere Anbieter verarbeiten Daten auch in den USA und in anderen Ländern. Jeder hat eine eigene Datenschutzerklärung:</p>
    <ul>
      <li><strong>Supabase:</strong> Datenbank und Anmeldung; deine Kontodaten werden in Singapur gespeichert.</li>
      <li><strong>Resend:</strong> versendet Anmelde-E-Mails und sieht daher deine E-Mail-Adresse. Es speichert Daten in den USA und führt E-Mail-Protokolle über 30 Tage.</li>
      <li><strong>Vercel:</strong> hostet die Website weltweit und führt Anfrageprotokolle.</li>
      <li><strong>CARTO:</strong> Kartenbilder, basierend auf OpenStreetMap-Daten. Es kürzt IP-Adressen und bewahrt seine Protokolle 30 Tage lang in den USA auf.</li>
      <li><strong>Google:</strong> Anmeldung mit Google (nur wenn du sie wählst), Google Fonts und Google Maps, wenn du auf Route tippst.</li>
      <li><strong>Amap:</strong> nur wenn du dich entscheidest, eine Adresse in Amap zu öffnen.</li>
      <li><strong>unpkg.com und cdn.jsdelivr.net:</strong> die Code-Bibliotheken für die Karte und die Datenbankverbindung.</li>
      <li><strong>Fotoanbieter:</strong> Hallenfotos sind Links, dein Browser lädt sie also von der Website, die sie hostet.</li>
    </ul>

    <h2>Wie lange wir Daten aufbewahren</h2>
    <ul>
      <li><strong>Kontodaten:</strong> bis du dein Konto löschst.</li>
      <li><strong>Hallen, Änderungen und Meldungen, die du geschickt hast:</strong> bleiben als Teil der Karte erhalten. Nach dem Löschen deines Kontos sind sie nicht mehr mit dir verknüpft.</li>
      <li><strong>Protokolle der Anbieter:</strong> Resend und CARTO bewahren Protokolle 30 Tage lang auf. Vercel und Supabase führen Anfrageprotokolle über Zeiträume, die sie selbst festlegen.</li>
    </ul>

    <h2>Dein Konto löschen</h2>
    <p>Nutze unten auf deiner Ich-Seite <strong>Konto löschen</strong>, um dein Konto sofort zu löschen. Das geht in jedem Browser auf bouldeer.com: anmelden, Ich öffnen und Konto löschen wählen. Die Schritte findest du auch unter <a href="{delete}">Dein Konto löschen</a>.</p>
    <p>Beim Löschen werden deine E-Mail-Adresse, dein Anzeigename, gespeicherte und gekletterte Hallen, Check-ins, Logbuch und Punkte entfernt. Hallen, Änderungen und Meldungen, die du geschickt hast, bleiben auf der Karte, einschließlich aller Texte, die du geschrieben hast, sind aber nicht mehr mit dir verknüpft.</p>

    <h2>Deine Rechte</h2>
    <p>Du kannst uns bitten, dir Auskunft über deine Daten zu geben, sie zu berichtigen oder zu exportieren, oder der Nutzung deiner Daten widersprechen: schreib an <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Um die Angaben zu einer Halle zu korrigieren, nutze auf deren Seite Änderung vorschlagen oder Problem melden. Wenn du mit unserer Antwort nicht zufrieden bist, kannst du dich beim Office of the Australian Information Commissioner (oaic.gov.au), bei deiner örtlichen Datenschutzaufsichtsbehörde in der EU oder beim britischen Information Commissioner&rsquo;s Office (ico.org.uk) beschweren.</p>

    <h2>Kinder</h2>
    <p>Bouldeer ist nicht für Kinder gedacht. Du musst mindestens 16 Jahre alt sein, um ein Konto zu erstellen.</p>

    <h2>Änderungen</h2>
    <p>Wenn Bouldeer etwas Neues zu erheben beginnt, aktualisieren wir zuerst diese Seite und ändern das Datum oben. Bei wesentlichen Änderungen veröffentlichen wir außerdem einen Hinweis auf der Website.</p>

    <h2>Kontakt</h2>
    <p><a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Siehe auch die <a href="{terms}">Nutzungsbedingungen</a>.</p>
`,
  },

  terms: {
    title: 'Nutzungsbedingungen',
    metaTitle: 'Nutzungsbedingungen — Bouldeer',
    description: 'Die Bedingungen für die Nutzung von Bouldeer, der kostenlosen Kletterhallenkarte für Kletternde, die reisen.',
    updated: 'Stand: 26. November 2026',
    body: `
    <p>Bouldeer (früher Climb Atlas) ist eine kostenlose, rein informative Karte von Kletterhallen für Kletternde, die reisen, betrieben von New South Wales in Australien aus. Sie steht in keiner Verbindung zu den gelisteten Hallen und nimmt weder Buchungen noch Zahlungen an. Mit der Nutzung von Bouldeer stimmst du diesen Bedingungen zu. Die <a href="{privacy}">Datenschutzerklärung</a> erklärt, wie wir mit deinen Daten umgehen.</p>

    <h2>Vor dem Besuch prüfen</h2>
    <p>Die Angaben zu den Hallen werden aus öffentlichen Quellen recherchiert, etwa den eigenen Websites und Social-Media-Konten der Hallen und Kartenverzeichnissen, sowie aus Korrekturen, die Leute uns schicken. Sie können veraltet oder falsch sein. Frag Öffnungszeiten, Preise und ob eine Halle noch geöffnet ist direkt bei der Halle nach. Klettern birgt echte Risiken: Du kletterst auf eigenes Risiko und bist für deine eigene Sicherheit verantwortlich.</p>

    <h2>Dein Konto</h2>
    <ul>
      <li>Du musst mindestens 16 Jahre alt sein, um ein Konto zu erstellen.</li>
      <li>Gib deine Anmeldung nicht weiter. Du bist dafür verantwortlich, was mit deinem Konto geschieht.</li>
      <li>Du kannst dein Konto jederzeit auf deiner Ich-Seite löschen (siehe <a href="{delete}">Dein Konto löschen</a>).</li>
      <li>Wir können Konten sperren oder entfernen, die gegen diese Bedingungen verstoßen oder die Website missbrauchen. Wir teilen dir in der Regel den Grund mit, außer bei schwerem Missbrauch oder wenn die Mitteilung Schaden anrichten würde, und du kannst an <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a> antworten.</li>
    </ul>

    <h2>Was du uns schickst</h2>
    <ul>
      <li>Schick nur Informationen, die du für richtig hältst und die du weitergeben darfst. Nimm keine persönlichen Informationen über andere auf.</li>
      <li>Kein Spam, keine anstößigen Inhalte und keine absichtlich falschen Angaben.</li>
      <li>Du behältst alle Rechte, die du an deinen Einsendungen hast. Du räumst uns eine kostenlose, nicht ausschließliche, weltweite und unbefristete Lizenz ein, sie als Teil von Bouldeer zu hosten, anzuzeigen, zu bearbeiten, zu übersetzen und aufzubewahren, auch nachdem du dein Konto gelöscht hast.</li>
      <li>Die Moderation prüft neue Hallen und Änderungen und kann alles Eingesendete bearbeiten, ablehnen oder entfernen.</li>
    </ul>

    <h2>Faire Nutzung</h2>
    <p>Bitte scrape oder kopiere die Kartendaten nicht in großen Mengen und belaste die Website nicht so stark, dass andere beeinträchtigt werden, ohne vorher bei uns nachzufragen. Suchmaschinen und KI-Assistenten dürfen einzelne Seiten lesen und verlinken. Die Kartendaten sind &copy; OpenStreetMap-Mitwirkende und CARTO. Einfache Fakten über Hallen, wie ihre Adressen, gehören nicht uns.</p>

    <h2>Keine Gewähr</h2>
    <p>Bouldeer wird bereitgestellt, wie es ist, ohne Gewähr für Richtigkeit oder ständige Verfügbarkeit. Soweit das Gesetz es erlaubt, haften wir nicht für Verluste aus der Nutzung der Website oder dem Vertrauen auf ihre Informationen. Nichts in diesen Bedingungen schließt Rechte aus, die dir nach dem Australian Consumer Law (australisches Verbraucherrecht) oder anderen Gesetzen zustehen und nicht ausgeschlossen werden können. Verlinkte Websites und die Dienste, die wir für Karten, Hosting und Anmeldung nutzen, liegen außerhalb unserer Kontrolle.</p>

    <h2>Übersetzungen</h2>
    <p>Diese Bedingungen und die Datenschutzerklärung gibt es auch in anderen Sprachen. Weicht eine Übersetzung von der englischen Fassung ab, gilt die englische Fassung.</p>

    <h2>Änderungen und anwendbares Recht</h2>
    <p>Wir können diese Bedingungen aktualisieren. Bei wesentlichen Änderungen veröffentlichen wir mindestens 14 Tage, bevor sie gelten, einen Hinweis auf der Website. Wenn du nicht einverstanden bist, kannst du Bouldeer nicht mehr nutzen und dein Konto löschen. Für diese Bedingungen gilt das Recht von New South Wales, Australien. Das nimmt dir keinen Schutz, den du nach dem Recht deines Wohnsitzlandes hast. Fragen: <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>.</p>
`,
  },

  delete: {
    title: 'Dein Konto löschen',
    metaTitle: 'Dein Bouldeer-Konto löschen',
    description: 'So löschst du dein Bouldeer-Konto, was gelöscht wird und was bleibt.',
    updated: 'Stand: 26. November 2026',
    body: `
    <p>Du kannst dein Bouldeer-Konto jederzeit selbst löschen, über die Website oder die App. Die Löschung wirkt sofort.</p>

    <h2>So löschst du dein Konto</h2>
    <ol>
      <li>Öffne <a href="https://www.bouldeer.com/">bouldeer.com</a> in einem beliebigen Browser (oder die Bouldeer-App) und melde dich mit der E-Mail-Adresse oder dem Google-Konto an, die du für Bouldeer nutzt.</li>
      <li>Öffne <strong>Ich</strong>.</li>
      <li>Wähle unten auf der Seite <strong>Konto löschen</strong>, setze zur Bestätigung den Haken und drücke auf die Schaltfläche.</li>
    </ol>
    <p>Du musst nichts installieren: Die Anmeldung auf der Website funktioniert genauso wie in der App.</p>

    <h2>Was gelöscht wird</h2>
    <p>Deine E-Mail-Adresse und Anmeldedaten, dein Anzeigename, gespeicherte und gekletterte Hallen, Check-ins, Logbuch und Punkte.</p>

    <h2>Was bleibt, und warum</h2>
    <p>Hallen, Änderungen und Problemmeldungen, die du geschickt hast, bleiben auf der Karte, einschließlich aller Texte, die du geschrieben hast, weil andere Kletternde sich darauf verlassen. Sie sind nicht mehr mit dir verknüpft. Die kurzlebigen Protokolle unserer Anbieter laufen nach deren eigenen Fristen ab (Resend und CARTO bewahren Protokolle 30 Tage lang auf).</p>

    <h2>Fragen</h2>
    <p>Schreib an <a href="mailto:hello@bouldeer.com">hello@bouldeer.com</a>. Siehe auch die <a href="{privacy}">Datenschutzerklärung</a>.</p>
`,
  },
};
