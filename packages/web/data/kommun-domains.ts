/**
 * E-postdomäner för Sveriges 290 kommuner
 *
 * De flesta kommuner använder formatet @kommunnamn.se
 * Vissa kommuner har specialformat (t.ex. goteborg.se istället för göteborg.se)
 *
 * Källa: SKR (Sveriges Kommuner och Regioner)
 * https://skr.se/skr/tjanster/kommunerochregioner/kommunerlista.1246.html
 */

// Normalisering av kommunnamn till domänformat
function normalizeToAscii(name: string): string {
  return name
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

// Lista över alla 290 kommuners domäner
// Format: standarddomän eller [standarddomän, alternativ1, alternativ2, ...]
const KOMMUN_DOMAIN_DATA: (string | string[])[] = [
  'ale.se',
  'alingsas.se',
  'alvesta.se',
  'aneby.se',
  'arboga.se',
  'arjeplog.se',
  'arvidsjaur.se',
  'arvika.se',
  'askersund.se',
  'avesta.se',
  'bengtsfors.se',
  'berg.se',
  'bjurholm.se',
  'bjuv.se',
  'boden.se',
  'bollebygd.se',
  'bollnas.se',
  'borgholm.se',
  'borlange.se',
  'boras.se',
  'botkyrka.se',
  'boxholm.se',
  'bromolla.se',
  'bracke.se',
  'burlov.se',
  'bastad.se',
  'dalsed.se',
  'danderyd.se',
  'degerfors.se',
  'dorotea.se',
  'eda.se',
  'ekero.se',
  'eksjo.se',
  'emmaboda.se',
  'enkoping.se',
  'eskilstuna.se',
  'eslov.se',
  'essunga.se',
  'fagersta.se',
  'falkenberg.se',
  'falkoping.se',
  'falun.se',
  'filipstad.se',
  'finspang.se',
  'flen.se',
  'forshaga.se',
  'fargelanda.se',
  'gagnef.se',
  'gislaved.se',
  'gnesta.se',
  'gnosjo.se',
  'gotland.se',
  'grums.se',
  'grastorp.se',
  'gullspang.se',
  'gallivare.se',
  'gavle.se',
  ['goteborg.se', 'gothenburg.se'], // Göteborg har ibland engelska domäner
  'gotene.se',
  'habo.se',
  'hagfors.se',
  'hallsberg.se',
  'hallstahammar.se',
  'halmstad.se',
  'hammaro.se',
  'haninge.se',
  'haparanda.se',
  'heby.se',
  'hedemora.se',
  'helsingborg.se',
  'herrljunga.se',
  'hjo.se',
  'hofors.se',
  'huddinge.se',
  'hudiksvall.se',
  'hultsfred.se',
  'hylte.se',
  'habo.se',
  'hallefors.se',
  'harjedalen.se',
  'harnosand.se',
  'harryda.se',
  'hassleholm.se',
  'hoganas.se',
  'hogsby.se',
  'horby.se',
  'hoor.se',
  'jokkmokk.se',
  'jarfalla.se',
  'jonkoping.se',
  'kalix.se',
  'kalmar.se',
  'karlsborg.se',
  'karlshamn.se',
  'karlskoga.se',
  'karlskrona.se',
  'karlstad.se',
  'katrineholm.se',
  'kil.se',
  'kinda.se',
  'kiruna.se',
  'klippan.se',
  'knivsta.se',
  'kramfors.se',
  'kristianstad.se',
  'kristinehamn.se',
  'krokom.se',
  'kumla.se',
  'kungsbacka.se',
  'kungsor.se',
  'kungalv.se',
  'kavlinge.se',
  'koping.se',
  'laholm.se',
  'landskrona.se',
  'laxa.se',
  'lekeberg.se',
  'leksand.se',
  'lerum.se',
  'lessebo.se',
  'lidingo.se',
  'lidkoping.se',
  'lillaedet.se',
  'lindesberg.se',
  'linkoping.se',
  'ljungby.se',
  'ljusdal.se',
  'ljusnarsberg.se',
  'lomma.se',
  'ludvika.se',
  'lulea.se',
  'lund.se',
  'lycksele.se',
  'lysekil.se',
  ['malmo.se', 'malmostad.se'], // Malmö stad
  'malungsalen.se',
  'mala.se',
  'mariestad.se',
  'mark.se',
  'markaryd.se',
  'mellerud.se',
  'mjolby.se',
  'mora.se',
  'motala.se',
  'mullsjo.se',
  'munkedal.se',
  'munkfors.se',
  'molndal.se',
  'monsteras.se',
  'morbylanga.se',
  'nacka.se',
  'nora.se',
  'norberg.se',
  'nordanstig.se',
  'nordmaling.se',
  'norrkoping.se',
  'norrtalje.se',
  'norsjo.se',
  'nybro.se',
  'nykvarn.se',
  'nykoping.se',
  'nynashamn.se',
  'nassjo.se',
  'ockelbo.se',
  'olofstrom.se',
  'orsa.se',
  'orust.se',
  'osby.se',
  'oskarshamn.se',
  'ovanaker.se',
  'oxelosund.se',
  'pajala.se',
  'partille.se',
  'perstorp.se',
  'pitea.se',
  'ragunda.se',
  'robertsfors.se',
  'ronneby.se',
  'rattvik.se',
  'sala.se',
  'salem.se',
  'sandviken.se',
  'sigtuna.se',
  'simrishamn.se',
  'sjobo.se',
  'skara.se',
  'skelleftea.se',
  'skinnskatteberg.se',
  'skurup.se',
  'skovde.se',
  'smedjebacken.se',
  'solleftea.se',
  'sollentuna.se',
  'solna.se',
  'sorsele.se',
  'sotenas.se',
  'staffanstorp.se',
  'stenungsund.se',
  ['stockholm.se', 'stad.stockholm.se'], // Stockholm stad
  'storfors.se',
  'storuman.se',
  'strangnas.se',
  'stromstad.se',
  'stromsund.se',
  'sundbyberg.se',
  'sundsvall.se',
  'sunne.se',
  'surahammar.se',
  'svalov.se',
  'svedala.se',
  'svenljunga.se',
  'saffle.se',
  'sater.se',
  'savsjo.se',
  'soderhamn.se',
  'soderkoping.se',
  'sodertalje.se',
  'solvesborg.se',
  'tanum.se',
  'tibro.se',
  'tidaholm.se',
  'tierp.se',
  'timra.se',
  'tingsryd.se',
  'tjorn.se',
  'tomelilla.se',
  'torsby.se',
  'torsas.se',
  'tranemo.se',
  'tranas.se',
  'trelleborg.se',
  'trollhattan.se',
  'trosa.se',
  'tyreso.se',
  'taby.se',
  'toreboda.se',
  'uddevalla.se',
  'ulricehamn.se',
  'umea.se',
  'upplandsbro.se',
  'upplandsvasby.se',
  'uppsala.se',
  'uppvidinge.se',
  'vadstena.se',
  'vaggeryd.se',
  'valdemarsvik.se',
  'vallentuna.se',
  'vansbro.se',
  'vara.se',
  'varberg.se',
  'vaxholm.se',
  'vellinge.se',
  'vetlanda.se',
  'vilhelmina.se',
  'vimmerby.se',
  'vindeln.se',
  'vingaker.se',
  'vargarda.se',
  'vanersborg.se',
  'vannas.se',
  'varmdo.se',
  'varnamo.se',
  'vastervik.se',
  'vasteras.se',
  'vaxjo.se',
  'ydre.se',
  'ystad.se',
  'amal.se',
  'ange.se',
  'are.se',
  'arjang.se',
  'asele.se',
  'astorp.se',
  'atvidaberg.se',
  'almhult.se',
  'alvdalen.se',
  'alvkarleby.se',
  'alvsbyn.se',
  'angelholm.se',
  'ockero.se',
  'odeshog.se',
  'orebro.se',
  'orkelljunga.se',
  'ornskoldsvik.se',
  'ostersund.se',
  'osteraker.se',
  'osthammar.se',
  'ostragoinge.se',
  'overkalix.se',
  'overtornea.se',
];

// Flatten och skapa Set för snabb lookup
export const KOMMUN_DOMAINS: Set<string> = new Set(
  KOMMUN_DOMAIN_DATA.flatMap((item) =>
    Array.isArray(item) ? item : [item]
  )
);

// Export som array för iteration
export const KOMMUN_DOMAINS_ARRAY: string[] = Array.from(KOMMUN_DOMAINS);

/**
 * Kontrollera om en e-postadress tillhör en svensk kommun
 */
export function isKommunEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return false;
  }

  // Direkt matchning
  if (KOMMUN_DOMAINS.has(domain)) {
    return true;
  }

  // Kontrollera subdomäner (t.ex. @utbildning.stockholm.se)
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const baseDomain = parts.slice(-2).join('.');
    if (KOMMUN_DOMAINS.has(baseDomain)) {
      return true;
    }
  }

  return false;
}

/**
 * Extrahera kommunnamn från e-postadress
 */
export function getKommunFromEmail(email: string): string | null {
  if (!isKommunEmail(email)) {
    return null;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return null;
  }

  // Ta bort .se och eventuella subdomäner
  const parts = domain.split('.');
  const kommunPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

  // Formatera snyggt (första bokstaven stor)
  return kommunPart.charAt(0).toUpperCase() + kommunPart.slice(1);
}

/**
 * Hämta alla kommundomäner som matchar ett sökord
 */
export function searchKommunDomains(query: string): string[] {
  const normalizedQuery = normalizeToAscii(query);
  return KOMMUN_DOMAINS_ARRAY.filter((domain) =>
    domain.includes(normalizedQuery)
  );
}

// Antal kommuner (för validering)
export const KOMMUN_COUNT = 290;
