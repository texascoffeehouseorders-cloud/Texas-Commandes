/* Mises à jour des articles, appliquées une seule fois dans la base (même si plusieurs appareils démarrent ensemble).
   Ne jamais modifier une migration déjà publiée : en ajouter une nouvelle avec un numéro plus grand. */

// v1 — Noms anglais (affichés en mode EN ; les e-mails aux fournisseurs restent en français)
const EN = {
  i000:"Alpro Coconut barista milk 1 L (pack of 6)", i001:"Alpro Oat barista milk 1 L (pack of 8)", i002:"Alpro Soy barista milk 1 L (pack of 6)",
  i003:"Inex lactose-free semi-skimmed milk 1 L (pack of 6)", i004:"Oresto whole milk 1 L (pack of 12)",
  i005:"Debic whipped cream can 716 g", i006:"Debic UHT cooking cream 40% 1 L", i007:"Aroy-D coconut milk for cooking (tin)",
  i008:"Oresto butter 1 kg", i009:"De Vloo eggs size L x30 (tray)", i010:"Sliced mozzarella 500 g (25 x 20 g)",
  i011:"Kemfood grated mozzarella 70/30 2 kg", i012:"Oresto grated Emmental cheese 1 kg", i013:"Zanetti grated parmesan Granello 1 kg",
  i014:"De Vloo eggs size L x240", i015:"De Vloo liquid whole eggs 1 L", i016:"Chevrardennes aged goat cheese log Bastogne 1 kg",
  i017:"Chevrardennes fresh goat cheese log with honey 500 g", i018:"Bettine aged goat cheese log 450 g",
  i019:"Myrtis sheep cheese (feta type)", i020:"Zanetti burrata 150 g", i021:"Glenstal Irish cheddar block",
  i022:"Philadelphia cream cheese 235 g", i023:"Violife vegan feta (Greek white block) 150 g",
  i024:"Chicken – Europa halal roast chicken slices 1 kg", i025:"Oresto crispy pre-cooked bacon 500 g", i026:"Gran Brianza mortadella 100 g",
  i027:"Chicken – Europa roast chicken slices 6 mm 1 kg", i028:"Blue Ocean smoked salmon fillet (machine sliced) 200 g",
  i029:"Blue Ocean mild artisan smoked salmon (machine sliced)", i030:"Sodial hand-sliced smoked salmon 400 g",
  i031:"Oresto smoked salmon (machine sliced)", i032:"Norwegian hand-sliced salmon (black pack, gold plate)", i033:"Norwegian hand-sliced salmon 200 g",
  i034:"Crop's frozen whole strawberries 1 kg", i035:"Crop's frozen pineapple chunks 1 kg", i036:"Crop's frozen mango chunks 1 kg",
  i038:"Oresto vanilla bourbon ice cream 5 L", i039:"Oresto ice cubes 5 kg",
  i040:"Ponthier banana purée 1 kg", i041:"Ponthier strawberry purée 1 kg", i042:"Ponthier raspberry purée 1 kg",
  i043:"Ponthier mango purée 1 kg", i044:"Ponthier pineapple purée 1 kg", i045:"Ponthier blueberry purée 1 kg",
  i046:"Granny Smith apples (France)", i047:"Spa still water 50 cl (pack of 8)", i048:"Spa Intense sparkling water 50 cl (pack of 6)",
  i049:"Cristaline still water 50 cl", i051:"Spring Valley apple juice 1 L", i052:"Coca-Cola sleek can 33 cl", i053:"Coca-Cola Zero sleek can 33 cl",
  i054:"Colac chocolate topping 1 L", i055:"Colac white chocolate topping 1 L", i056:"Dawn Foods salted butter caramel topping 1 L",
  i057:"Colac salted caramel topping 1 L", i058:"Vedrenne peach syrup 1 L", i059:"Vedrenne vanilla syrup 1 L",
  i060:"Honey – Meli liquid honey squeeze bottle 450 g", i061:"Sprague's maple syrup 946 ml", i062:"Dessert Sauce chocolate topping 1 L",
  i063:"Anco pastry flour 5 kg", i064:"Anco pastry flour 1 kg", i065:"Daddy fine white sugar 5 kg", i066:"Tirlemont icing sugar 2 kg",
  i067:"Nutella", i068:"Cerelia shortcrust pastry 230 g", i069:"La Baleine baking soda 400 g", i070:"Imperial baking powder 20 g x5",
  i071:"Marcor green pistachios 1 kg", i072:"Marcor pecan nuts 750 g", i073:"Pernoix pine nuts 110 g", i074:"Oresto walnut halves 700 g",
  i075:"Grands Moulins de Paris flour T55 1 kg", i076:"Dossche flour Alpha 11/560 25 kg", i077:"Tirlemont fine sugar S2 1 kg",
  i078:"Desiccated coconut 700 g", i079:"Bounty 57 g", i080:"Crushed speculoos biscuits 750 g", i081:"Speculoos spread 400 g",
  i082:"Tirlemont icing sugar shaker 250 g", i083:"Candico brown cane sugar 1 kg", i084:"Candi dark brown sugar 2 kg",
  i085:"Veliche dark chocolate chips Essential 54 5 kg", i086:"Vanilla sugar 1 kg (tub)", i087:"Lotus Biscoff speculoos spread 720 g",
  i088:"Callebaut white chocolate chips CW2 2.5 kg", i089:"Callebaut dark chocolate chips 811 2.5 kg", i090:"Cacao Barry cocoa powder 1 kg",
  i091:"Reese's peanut butter pumpkins 68 g x2", i092:"Colac pistachio paste 1150 g", i093:"Peanut butter 500 g", i094:"Oreo crumbs 400 g",
  i095:"Patisdecor red gel food colouring 30 g", i096:"Patisdecor red liquid food colouring 30 ml",
  i097:"Amanprana organic coconut oil 325 ml", i098:"Amanprana organic coconut oil 1 L", i099:"Isfi ground Java cinnamon 430 g",
  i100:"Delizio Bunwax release spray 600 ml", i101:"Delizio Gourmet butter glazing spray 600 ml", i102:"Sonneveld baking release spray 600 ml",
  i103:"Oresto semi-dried tomatoes 1 kg", i104:"Sani grilled yellow peppers 480 g", i105:"First State roasted red peppers 450 g",
  i106:"First State pineapple 10 slices in juice (tin)", i108:"Jae chickpeas jar 580 g", i109:"Cypressa tahini 300 g",
  i110:"Knorr Primerba horseradish flavour 320 g", i111:"Tabasco Red Pepper sauce 60 ml", i112:"Gustoliva sliced jalapeños 850 g",
  i113:"Oresto gherkins (small pickles) 2300 g", i114:"Isfi black peppercorns 1 kg", i115:"Isfi herbes de Provence 500 g",
  i116:"Oresto sea salt grinder 125 g", i117:"Saline d'Einville fine salt 1 kg", i118:"Oresto cayenne pepper 500 g", i119:"Oresto garlic powder 550 g",
  i120:"Delizio sunflower oil 3 L", i121:"Delizio rapeseed oil 5 L", i122:"Delizio sunflower oil 5 L", i123:"Oresto extra virgin olive oil 1 L",
  i124:"La William mayonnaise 625 g", i125:"Vleminckx mayonnaise tube 1 L", i126:"Kochs grated horseradish cream 95 g",
  i127:"Mustard – Jefke mild mustard 2100 g", i128:"Mustard – Maille Original 360 g", i129:"Mustard – The Belgian Factory mild mustard 2100 g",
  i130:"Go Tan sriracha sauce 215 ml", i131:"Stimula white vinegar 8° 1.5 L", i132:"Ponti white wine vinegar 1 L",
  i133:"Lina's white napkins 33 cm x500", i134:"Black paper straws, bendy 22 cm x200", i135:"RPP black reusable straws 24 cm x250",
  i136:"Black reusable bendy straws 21 cm x500", i137:"Fresh Fruit printed cups 400 ml x50", i138:"Biopack bagasse dome lids x50",
  i139:"BioPak bagasse cups 47 cl x36", i140:"Cold drink lids 30/40 cl x50", i141:"Freshandeasy cling film 30 cm",
  i142:"Baking sheet (baking paper) 30 cm x 50 m", i143:"Toppits freezer bags 3 L x30", i144:"Fresh Fruit dome lids 300-400 ml x100",
  i145:"Foil aluminium 30 cm x 250 m", i146:"Labelfresh freezer labels x500", i147:"Zig zag white paper hand towels x160",
  i148:"Dipp kitchen degreaser spray 1 L", i149:"Dreft (Fairy) washing-up liquid 1 L", i150:"Cleo lemon washing-up liquid 1 L",
  i151:"Salina water softener salt tablets 25 kg", i152:"Sanytol multi-purpose disinfectant 500 ml", i153:"Tork extra absorbent kitchen roll x2",
  i154:"Tork wiping paper roll midi 300 m", i155:"Lucart toilet paper ECO x6", i156:"Blue PMC bin bags (Hygea) x20",
  i157:"Green bags – small organic bin bags 20 L (Hygea) x20", i158:"Big bin bags 140 L x10", i159:"Moka bags – white residual bin bags 50 L (Hygea) x10",
  i160:"Avocados", i161:"Tomatoes", i162:"Fresh blueberries", i163:"Fresh raspberries", i164:"Lettuce", i165:"Oranges", i166:"Grapefruits",
  i167:"Mandarins", i168:"Cucumbers", i169:"Bananas", i170:"Basil", i171:"Courgettes (zucchini)", i172:"Coriander", i173:"Red peppers",
  i174:"Fennel", i175:"Edible flowers",
  i176:"Caramel syrup", i177:"Vanilla syrup", i178:"Hazelnut syrup", i179:"Salted caramel syrup", i180:"Peanut butter syrup",
  i181:"Pumpkin spice syrup", i182:"Speculoos syrup", i183:"Cucumber syrup", i184:"Bergamot syrup", i185:"Lemon syrup",
  i186:"Black tea syrup", i187:"Tangerine syrup", i188:"Peach syrup", i189:"Green tea syrup", i190:"Sugar cane syrup",
  i191:"Dragon fruit syrup", i192:"Mint syrup", i193:"Sugar free vanilla syrup", i194:"Sugar free caramel syrup", i195:"Sugar free hazelnut syrup",
  i196:"Hot chocolate powder – classic", i197:"Hot chocolate powder – white", i198:"Vanilla chai powder", i199:"Spice chai powder",
  i200:"Vanilla powder", i201:"Red velvet powder", i202:"Coffee frappé powder",
  i203:"White tea", i204:"Black tea", i205:"Green tea", i206:"Rooibos tea", i207:"Maté tea",
  i208:"Cake boxes", i209:"Sleeves (cup sleeves for heat)", i210:"Cup holder 2 cups", i211:"Cup holder 4 cups", i212:"Cake bags",
  i213:"Straws", i214:"Espresso cups"
};

// v1 — Corrections demandées
const CHANGES = {
  i000: { name:"Alpro Coconut barista 1 L (pack de 6)", unit:"packs" },
  i001: { name:"Alpro Oat barista 1 L (pack de 8)", unit:"packs" },
  i002: { name:"Alpro Soy barista 1 L (pack de 6)", unit:"packs" }
};
const REMOVE = ["i107", "i050", "i037"]; // Ceci pois chiches 1/2 (doublon), Chaudfontaine 50 cl (on a Spa), myrtilles congelées
const ADD = {
  m001: { name:"Roquette", nameEn:"Arugula (rocket)", cat:"fruitsleg", supplier:"maraicher", unit:"sachets" },
  m002: { name:"Clémentines", nameEn:"Clementines", cat:"fruitsleg", supplier:"maraicher", unit:"kg" },
  m003: { name:"Citrons", nameEn:"Lemons", cat:"fruitsleg", supplier:"maraicher", unit:"kg" },
  m004: { name:"Oignons rouges", nameEn:"Red onions", cat:"fruitsleg", supplier:"maraicher", unit:"kg" },
  m005: { name:"Pommes vertes", nameEn:"Green apples", cat:"fruitsleg", supplier:"maraicher", unit:"kg" }
};

export const MIGRATIONS = [
  { v:1, apply(items){ // items : { id: data } tels qu'ils sont dans la base
      const ops = [];
      Object.keys(items).forEach(id => {
        const upd = {};
        if (EN[id] && !items[id].nameEn) upd.nameEn = EN[id];
        if (CHANGES[id]) Object.assign(upd, CHANGES[id]);
        if (Object.keys(upd).length) ops.push({ type:"update", id, data:upd });
      });
      REMOVE.forEach(id => { if (items[id]) ops.push({ type:"delete", id }); });
      let ord = 1 + Math.max(0, ...Object.values(items).map(x => x.ord || 0));
      Object.keys(ADD).forEach(id => { if (!items[id]) ops.push({ type:"set", id, data:{ ...ADD[id], ord: ord++ } }); });
      return ops;
  } }
];
// v2 — Bananes : par régime (et plus au kilo)
MIGRATIONS.push({ v:2, apply(items){
  const ops=[];
  if (items.i169) ops.push({ type:"update", id:"i169", data:{ unit:"régimes", nameEn:"Bananas (bunches)" } });
  return ops;
} });

export const LATEST = MIGRATIONS[MIGRATIONS.length - 1].v;
