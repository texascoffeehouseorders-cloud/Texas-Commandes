/**
 * Texas Coffee House – envoi automatique des commandes par e-mail
 * ----------------------------------------------------------------
 * Ce petit programme tourne gratuitement dans le compte Google du shop (script.google.com).
 * L'application Inventaire lui envoie la commande, et il l'envoie par e-mail depuis la Gmail du shop.
 * L'e-mail apparaît dans les « Messages envoyés » de la Gmail du shop.
 *
 * ⚠️ Remplace le texte ci-dessous par le code secret que Claude t'a donné
 *    (le même code se colle ensuite dans l'application : Commande → Ramaut → Voir la commande → ⚙️).
 *    Ne publie jamais ce code secret dans GitHub.
 */
const SECRET = 'COLLE-ICI-TON-CODE-SECRET';

const SENDER_NAME = 'Texas Coffee House';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!SECRET || SECRET.indexOf('COLLE-ICI') === 0 || d.token !== SECRET) {
      return json({ ok: false, error: 'Code secret incorrect' });
    }
    // Test depuis l'application : e-mail envoyé à la Gmail du shop elle-même
    if (d.test) {
      const me = Session.getEffectiveUser().getEmail();
      MailApp.sendEmail({ to: me, name: SENDER_NAME,
        subject: 'Test – Inventaire Texas Coffee House',
        body: "L'envoi automatique des commandes fonctionne ✓" });
      return json({ ok: true, to: me, remaining: MailApp.getRemainingDailyQuota() });
    }
    const to = String(d.to || '').trim();
    if (!/^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/.test(to)) {
      return json({ ok: false, error: 'Adresse e-mail du destinataire invalide' });
    }
    MailApp.sendEmail({ to: to, name: SENDER_NAME,
      subject: String(d.subject || '').slice(0, 250),
      body: String(d.body || '') });
    return json({ ok: true, to: to, remaining: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'Texas Coffee House – envoi des commandes' });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Lance cette fonction une fois depuis l'éditeur (bouton ▶ Exécuter) pour donner l'autorisation d'envoyer des e-mails. */
function autoriser() {
  Logger.log('Autorisation OK – quota restant aujourd\'hui : ' + MailApp.getRemainingDailyQuota());
}
